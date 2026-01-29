/**
 * @file usePokemonSearch.ts
 * @description Custom hook for handling "Smart Search" functionality.
 *
 * ENGINEERING PRINCIPLE: Client-Side Indexing & Two-Phase Fetch
 *
 * PROBLEM:
 * PokeAPI does not support partial/fuzzy search (e.g., searching "pika" won't return "Pikachu").
 * It only supports exact ID/Name lookups.
 *
 * SOLUTION:
 * 1. Phase 1 (The Index): We fetch a lightweight list of ALL Pokemon names/URLs (100kb gzipped).
 * We cache this indefinitely (`staleTime: Infinity`).
 * 2. Phase 2 (The Filter): We filter this list in memory on the client.
 * 3. Phase 3 (The Hydration): We fetch full details ONLY for the top 20 matches.
 *
 * BENEFIT:
 * Provides an "Instant Search" experience with zero network latency for the filtering step,
 * mimicking the behavior of a sophisticated search engine.
 */

import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAllPokemonNames, adaptPokemon, Pokemon } from '../services/pokemon.service';
import { api } from '../../../lib/axios';

export function usePokemonSearch(searchQuery: string) {
  // PAGINATION STATE
  // Even in search mode, we paginate the results to avoid overwhelming the DOM
  // (e.g., searching "a" might return 500 results; we render 20 at a time).
  const [page, setPage] = useState(1);

  // THRESHOLD STRATEGY
  // We avoid triggering complex logic for single characters to reduce noise.
  const isSearching = searchQuery.length >= 2;

  // RESET LOGIC
  // If the user changes the search term, we must reset to page 1.
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // --- QUERY A: THE INDEX (Lightweight) ---
  const { data: allNames } = useQuery({
    queryKey: ['all-pokemon-names'],
    queryFn: getAllPokemonNames,
    // PERFORMANCE OPTIMIZATION:
    // This list rarely changes. We cache it for the entire session to save bandwidth.
    staleTime: Infinity,
    enabled: isSearching,
  });

  // --- QUERY B: THE DETAILS (Heavyweight) ---
  const { data: searchResults, isLoading: isSearchingLoading } = useQuery<Pokemon[]>({
    // DEPENDENCY TRACKING:
    // This query re-runs when the search term changes OR the page changes.
    queryKey: ['search-results', searchQuery, page],
    enabled: isSearching && !!allNames,

    queryFn: async () => {
      if (!allNames) return [];

      // STEP 1: Client-Side Filtering
      // Efficiently filter the array of ~10k items (JS engines handle this in <10ms).
      const filtered = allNames.filter((p) =>
        p.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );

      // STEP 2: Pagination Slicing
      // We only want to fetch details for the subset currently visible.
      const itemsToShow = filtered.slice(0, 20 * page);

      // STEP 3: Data Hydration (Parallel Fetching)
      // We map the lightweight URLs to full API requests.
      const promises = itemsToShow.map(async (lite) => {
        // Extract ID from URL (e.g. ".../pokemon/25/") to keep calls clean
        const id = lite.url.split('/').filter(Boolean).pop();
        const { data } = await api.get(`/pokemon/${id}`);
        return adaptPokemon(data);
      });

      // Wait for all 20 requests to complete
      return Promise.all(promises);
    },
    // UX: Keep showing old results while fetching new ones to prevent flashing
    placeholderData: keepPreviousData,
  });

  // METRICS CALCULATION
  const totalResults = allNames
    ? allNames.filter((p) => p.name.toLowerCase().startsWith(searchQuery.toLowerCase())).length
    : 0;

  const currentCount = searchResults?.length || 0;
  const hasMoreResults = currentCount < totalResults;

  return {
    isSearching,
    searchResults,
    isSearchingLoading,
    loadMore: () => setPage((p) => p + 1),
    hasMoreResults,
  };
}
