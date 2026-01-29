/**
 * @file usePokemonList.ts
 * @description Custom hook for managing the Infinite Scroll data feed.
 *
 * ENGINEERING PRINCIPLE: Server State Management (React Query)
 * Instead of managing `isLoading` and `data[]` arrays manually in React state,
 * we offload this complexity to React Query. This provides:
 * 1. Automatic Caching & Background Refetching.
 * 2. Deduping of requests.
 * 3. Simplified "Load More" logic via `fetchNextPage`.
 *
 * PAGINATION STRATEGY: Offset-based
 * PokeAPI uses `limit` and `offset`. We calculate the offset based on
 * the number of pages currently held in memory.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { getPokemonList } from '../services/pokemon.service';

export function usePokemonList() {
  return useInfiniteQuery({
    // CACHE KEY:
    // Uniquely identifies this data stream. Any invalidation of 'pokemon-list'
    // will trigger a refresh of the main feed.
    queryKey: ['pokemon-list'],

    // CURSOR INITIALIZATION:
    // We start at the beginning of the dataset (Pokemon #1, Index 0).
    initialPageParam: 0,

    // DATA FETCHER:
    // React Query injects the current 'pageParam'. We request a chunk of 20 items.
    queryFn: ({ pageParam }) => getPokemonList(20, pageParam),

    // PAGINATION LOGIC (The "Next Cursor" Calculator):
    // This function determines the `pageParam` for the NEXT request.
    // It runs automatically after every successful fetch.
    getNextPageParam: (lastPage, allPages) => {
      // EDGE CASE: End of Data
      // If the API returns an empty array, we have reached the end of the Pokemon world.
      // Returning 'undefined' tells React Query to set 'hasNextPage' to false.
      if (lastPage.length === 0) return undefined;

      // OFFSET CALCULATION:
      // Since we fetch 20 items per page, the next offset is simply:
      // (Total Pages Loaded) * (Items Per Page).
      // Example: 2 pages loaded = 40 items. Next request starts at offset 40.
      return allPages.length * 20;
    },
  });
}
