/**
 * @file pokemon.service.ts
 * @description The Communication Layer between the Application and the External World (PokeAPI).
 *
 * ENGINEERING PRINCIPLE: The Adapter Pattern (Anti-Corruption Layer)
 *
 * PROBLEM:
 * External APIs are often messy, deeply nested, or subject to change.
 * Directly using `data.sprites.other['official-artwork'].front_default` inside a React component
 * creates tight coupling. If the API changes, the entire app breaks.
 *
 * SOLUTION:
 * We define our own internal Domain Model (`Pokemon` interface).
 * This service acts as a strict "border control", converting the chaotic API data
 * into our clean, predictable internal format before it ever reaches the UI.
 */

import { api } from '../../../lib/axios';
import { logger } from '../../../lib/logger';

// --- DOMAIN MODELS (Internal Contract) ---
/**
 * The clean, flat structure used by our UI components.
 * Components should ONLY know about this interface, never the raw API response.
 */
export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  height: number;
  weight: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

// --- API DTOs (Data Transfer Objects) ---
/**
 * Raw shape of the data coming from PokeAPI.
 * Used only within this file for typing the Axios response.
 */
export interface PokeAPIResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other?: { 'official-artwork': { front_default: string } };
  };
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
}

interface PokeAPIListResponse {
  results: Array<{ name: string; url: string }>;
}

// --- ADAPTER IMPLEMENTATION ---

/**
 * Transforms raw API data into our internal Domain Model.
 *
 * BUSINESS DECISION: Image Fallback Strategy
 * We prioritize the "Official Artwork" (High Res). If missing, we fall back to "front_default" (Pixel art).
 * This ensures the UI never breaks even for obscure Pokémon versions.
 */
export function adaptPokemon(data: PokeAPIResponse): Pokemon {
  return {
    id: data.id,
    name: data.name,
    // Defensive coding: access deeply nested properties safely with Optional Chaining (?.)
    imageUrl: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
    types: data.types.map((t) => t.type.name),
    height: data.height,
    weight: data.weight,
    // Flattening the stats array into a map for O(1) access in UI components
    stats: {
      hp: data.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0,
      attack: data.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0,
      defense: data.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0,
      specialAttack: data.stats.find((s) => s.stat.name === 'special-attack')?.base_stat || 0,
      specialDefense: data.stats.find((s) => s.stat.name === 'special-defense')?.base_stat || 0,
      speed: data.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0,
    },
  };
}

// --- FETCHING STRATEGIES ---

/**
 * Fetches a page of Pokémon with full details.
 *
 * PERFORMANCE STRATEGY: Parallel Execution (The "N+1" Solution)
 * PokeAPI design requires 1 request for the list + N requests for details (images/types).
 *
 * Instead of:
 * await getList();
 * for (item of list) { await getDetail(item); } // SLOW (Waterfall)
 *
 * We use parallel requests to fetch all details simultaneously.
 *
 * RESILIENCE PATTERN: Fail-Safe Fetching (Promise.allSettled)
 *
 * PROBLEM:
 * If we use `Promise.all()`, a single failed request (e.g., 1 corrupted Pokémon in a batch of 20)
 * causes the ENTIRE page to fail, showing an error screen to the user.
 * This is a "Fragile" architecture.
 *
 * SOLUTION:
 * We use `Promise.allSettled()`. This waits for all requests to finish, regardless of success or failure.
 * Then, we filter out the failures and return only the valid Pokémon.
 *
 * RESULT:
 * The user sees 19 Pokémon instead of an error screen.
 * Partial success is always better than total failure in UI design.
 */
export async function getPokemonList(limit = 20, offset = 0): Promise<Pokemon[]> {
  const { data } = await api.get<PokeAPIListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);

  const promises = data.results.map(async (result) => {
    // Extract ID from URL to avoid an extra lookup if possible, or fetch by name/id
    const id = result.url.split('/').filter(Boolean).pop();
    const { data: details } = await api.get<PokeAPIResponse>(`/pokemon/${id}`);
    return adaptPokemon(details);
  });

  // EXECUTION: Wait for all outcomes (Success or Failure)
  const results = await Promise.allSettled(promises);

  // FILTERING: Keep only the winners
  const successfulPokemons = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<Pokemon>).value);

  // LOGGING: Warn about failures using the standard logger
  const failedCount = results.length - successfulPokemons.length;
  if (failedCount > 0) {
    logger.warn(`Recovered from ${failedCount} failed Pokémon requests. Partial data returned.`);
  }

  return successfulPokemons;
}

/**
 * Optimized fetch for Search functionality.
 * Fetches ONLY names/urls (lightweight) to build the client-side search index.
 */
export async function getAllPokemonNames() {
  // 10k limit ensures we get everything in one go (PokeAPI hard limit)
  const { data } = await api.get<PokeAPIListResponse>('/pokemon?limit=10000');

  return data.results.map((r) => ({
    name: r.name,
    url: r.url,
  }));
}

export async function getPokemonById(id: string | number): Promise<Pokemon> {
  const { data } = await api.get(`/pokemon/${id}`);
  return adaptPokemon(data);
}
