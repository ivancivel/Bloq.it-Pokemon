import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'; // 1. Importar 'Mock'
import {
  adaptPokemon,
  getPokemonList,
  getAllPokemonNames,
  getPokemonById,
  PokeAPIResponse,
} from './pokemon.service';
import { api } from '../../../lib/axios';

// --- MOCKING ---
vi.mock('../../../lib/axios', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('Pokemon Service Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- 1. ADAPTER TESTS ---
  describe('adaptPokemon (Data Transformation)', () => {
    it('should adapt a valid API response to our Domain Model', () => {
      const mockApiResponse = {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        sprites: {
          front_default: 'pixel-pikachu.png',
          other: {
            'official-artwork': {
              front_default: 'hd-pikachu.png',
            },
          },
        },
        types: [{ type: { name: 'electric' } }],
        stats: [
          { base_stat: 35, stat: { name: 'hp' } },
          { base_stat: 55, stat: { name: 'attack' } },
        ],
      } as unknown as PokeAPIResponse;

      const result = adaptPokemon(mockApiResponse);

      expect(result.id).toBe(25);
      expect(result.name).toBe('pikachu');
      expect(result.imageUrl).toBe('hd-pikachu.png');
      expect(result.stats.hp).toBe(35);
    });

    it('should use the low-res image if official artwork is missing', () => {
      const mockMissingArtwork = {
        id: 1,
        name: 'glitch-mon',
        sprites: {
          front_default: 'pixel-art-only.png',
          other: {},
        },
        types: [],
        stats: [],
      } as unknown as PokeAPIResponse;

      const result = adaptPokemon(mockMissingArtwork);
      expect(result.imageUrl).toBe('pixel-art-only.png');
    });
  });

  // --- 2. LIST & RESILIENCE TESTS ---
  describe('getPokemonList (Network & Resilience)', () => {
    it('should handle partial failures (Resilience Pattern)', async () => {
      const mockListResponse = {
        data: {
          results: [
            { name: 'bulbasaur', url: '.../1/' },
            { name: 'missingno', url: '.../9999/' },
          ],
        },
      };

      const mockBulbasaurDetails = {
        data: {
          id: 1,
          name: 'bulbasaur',
          sprites: { front_default: 'img.png', other: {} },
          types: [],
          stats: [],
        },
      };

      (api.get as Mock)
        .mockResolvedValueOnce(mockListResponse)
        .mockResolvedValueOnce(mockBulbasaurDetails)
        .mockRejectedValueOnce(new Error('Network Error 500'));

      const result = await getPokemonList(20, 0);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('bulbasaur');
    });
  });

  // --- 3. SEARCH INDEX TESTS ---
  describe('getAllPokemonNames (Search Index)', () => {
    it('should fetch lightweight list of all pokemon', async () => {
      // ARRANGE
      const mockResponse = {
        data: {
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
          ],
        },
      };

      (api.get as Mock).mockResolvedValueOnce(mockResponse);

      // ACT
      const result = await getAllPokemonNames();

      // ASSERT
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon/1/',
      });
      expect(api.get).toHaveBeenCalledWith('/pokemon?limit=10000');
    });
  });

  // --- 4. DETAILS TESTS ---
  describe('getPokemonById', () => {
    it('should fetch and adapt a single pokemon by ID', async () => {
      // ARRANGE
      const mockDetails = {
        data: {
          id: 6,
          name: 'charizard',
          sprites: { front_default: 'fire.png', other: {} },
          types: [{ type: { name: 'fire' } }],
          stats: [],
          height: 17,
          weight: 905,
        },
      };

      (api.get as Mock).mockResolvedValueOnce(mockDetails);

      // ACT
      const result = await getPokemonById(6);

      // ASSERT
      expect(result.name).toBe('charizard');
      expect(result.id).toBe(6);
      expect(api.get).toHaveBeenCalledWith('/pokemon/6');
    });
  });
});
