/**
 * @file ExplorePage.tsx
 * @description The primary landing view for exploring the Pokémon dataset.
 *
 * ENGINEERING PRINCIPLE: Container/Presenter Pattern & State Orchestration
 * This component acts as a "Smart Container". It does not implement low-level UI details
 * (like card styling); instead, it focuses on ORCHESTRATING data flows.
 *
 * RESPONSIBILITIES:
 * 1. State Hoisting: Owns the `searchQuery` state to coordinate the Input and the Search Hook.
 * 2. Data Source Strategy: Dynamically switches between "Server-Side Infinite List"
 * and "Client-Side Filtered Results" based on user intent.
 * 3. UX Unification: Aggregates loading states from different sources to prevent layout thrashing.
 */

import { useState } from 'react';
import { usePokemonList } from '../hooks/usePokemonList';
import { usePokemonSearch } from '../hooks/usePokemonSearch';
import { PokemonSearch } from '../components/PokemonSearch';
import { PokemonCard } from '../components/PokemonCard';

export const ExplorePage = () => {
  // --- 0. LOCAL STATE (State Hoisting) ---
  // The "Truth" about what is being searched lives here at the top level.
  // We hoist this state so we can pass it down to both the UI (Input) and Logic (Hook).
  const [searchQuery, setSearchQuery] = useState('');

  // --- DATA SOURCE A: INFINITE SCROLL (Default Discovery Mode) ---
  // Connects to the paginated API via React Query.
  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isError: isInfiniteError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePokemonList();

  // --- DATA SOURCE B: SEARCH MODE (Targeted Mode) ---
  // DEPENDENCY INJECTION: We pass the current query to the hook.
  // The hook reacts to this value and switches its internal fetching strategy.
  const { isSearching, searchResults, isSearchingLoading, loadMore, hasMoreResults } =
    usePokemonSearch(searchQuery);

  // --- STATE COMPOSITION (Derived State) ---
  // We unify the loading concept. The user shouldn't care *which* hook is loading,
  // only that the page is busy.
  const isLoading = isInfiniteLoading || (isSearching && isSearchingLoading);

  // --- 1. INITIAL LOADING STATE ---
  // Blocks the UI only during the initial "First Paint" to avoid layout shifts.
  if (isLoading && !infiniteData && !searchResults) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-xl gap-4 text-gray-500 animate-pulse">
        <div className="text-4xl">⏳</div>
        <p className="font-medium">Loading Pokédex...</p>
      </div>
    );
  }

  // --- 2. ERROR BOUNDARY ---
  // Graceful degradation if the API is completely unreachable.
  if (isInfiniteError) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <p className="text-red-500 font-bold text-lg">Network Error</p>
        <p className="text-gray-500">Could not retrieve Pokémon data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6">
      {/* --- SEARCH SECTION --- */}
      <div className="max-w-xl mx-auto">
        {/* CONTROLLED COMPONENT PATTERN:
            The parent (ExplorePage) dictates the value and handles the change.
            The child (PokemonSearch) is purely presentational. */}
        <PokemonSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* --- GRID SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* CONDITIONAL RENDERING STRATEGY:
            If the user is searching, we mount the 'Search Results'.
            Otherwise, we mount the 'Infinite Scroll List'. */}
        {isSearching ? (
          <>
            {/* RENDER PATH A: Search Mode */}
            {searchResults?.map((pokemon, index) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} index={index} />
            ))}

            {/* Empty State for Zero Results */}
            {searchResults?.length === 0 && !isSearchingLoading && (
              <div className="col-span-full text-center py-20">
                <p className="text-xl text-gray-400 font-medium">Nothing found... 😢</p>
                <p className="text-sm text-gray-400">Try searching for "Pikachu"</p>
              </div>
            )}
          </>
        ) : (
          /* RENDER PATH B: Discovery Mode (Infinite Scroll) */
          infiniteData?.pages.map((page) =>
            page.map((pokemon, index) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} index={index} />
            ))
          )
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      <div className="text-center pb-10 mt-8">
        {isSearching ? (
          /* Search Pagination (Client Logic) */
          hasMoreResults && (
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-purple-600 text-white rounded-full font-bold shadow-lg hover:bg-purple-700 hover:scale-105 transition-all active:scale-95"
            >
              {isSearchingLoading ? 'Searching...' : 'Load more results'}
            </button>
          )
        ) : (
          /* API Pagination (Server Logic) */
          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className="px-8 py-3 bg-red-600 text-white rounded-full font-bold shadow-lg hover:bg-red-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all active:scale-95"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
};
