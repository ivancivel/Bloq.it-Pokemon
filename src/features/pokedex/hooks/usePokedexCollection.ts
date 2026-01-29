/**
 * @file usePokedexCollection.ts
 * @description The Brain/Controller for the "My Pokedex" Collection Manager.
 *
 * ENGINEERING PRINCIPLE: Separation of Concerns (Logic vs View)
 * This hook encapsulates ALL the complex logic regarding the user's collection:
 * 1. Data Retrieval: Subscribes to IndexDB changes via `useLiveQuery`.
 * 2. Filtering & Sorting: Performs client-side operations on the dataset.
 * 3. Selection State: Manages the `Set<number>` for bulk actions.
 *
 * WHY CLIENT-SIDE SORTING?
 * Since the user's personal collection is relatively small (hundreds, not millions),
 * sorting in Javascript (V8 Engine) is faster and more responsive than querying the DB repeatedly.
 */

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CaughtPokemon } from '../../../lib/db';
import { usePokedexStore } from '../store/pokedex.store';

export type SortOption =
  | 'caughtAt-desc'
  | 'caughtAt-asc'
  | 'name-asc'
  | 'name-desc'
  | 'id-asc'
  | 'id-desc'
  | 'height-desc'
  | 'height-asc'
  | 'weight-desc'
  | 'weight-asc';

export type ViewMode = 'grid' | 'table';

export const usePokedexCollection = () => {
  // --- UI STATE ---
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // --- FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('caughtAt-desc');

  // --- DATA SOURCE (Real-time DB Connection) ---
  const releasePokemon = usePokedexStore((state) => state.releasePokemon);

  // LIVE QUERY: Updates automatically when items are added/removed/edited in IndexDB
  const rawPokemons = useLiveQuery(() => db.caughtPokemon.toArray());
  const myPokemons = useMemo(() => rawPokemons || [], [rawPokemons]);

  // --- PROCESSING PIPELINE (Filter -> Sort) ---
  const processedPokemons = useMemo(() => {
    let result = [...myPokemons];

    // 1. Filter by Name (Case Insensitive)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // 2. Filter by Type
    if (selectedType) {
      result = result.filter((p) => p.types.includes(selectedType));
    }

    // 3. Sort Logic
    result.sort((a, b) => {
      switch (sortBy) {
        case 'caughtAt-desc':
          return new Date(b.caughtAt).getTime() - new Date(a.caughtAt).getTime();
        case 'caughtAt-asc':
          return new Date(a.caughtAt).getTime() - new Date(b.caughtAt).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'id-asc':
          return a.id - b.id;
        case 'id-desc':
          return b.id - a.id;
        case 'height-desc':
          return b.height - a.height;
        case 'height-asc':
          return a.height - b.height;
        case 'weight-desc':
          return b.weight - a.weight;
        case 'weight-asc':
          return a.weight - b.weight;
        default:
          return 0;
      }
    });

    return result;
  }, [myPokemons, searchQuery, selectedType, sortBy]);

  // --- SELECTION HANDLERS ---
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const togglePokemonSelection = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === processedPokemons.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(processedPokemons.map((p) => p.id)));
  };

  const handleRelease = async () => {
    if (selectedIds.size === 0) return;
    await releasePokemon(Array.from(selectedIds));
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  return {
    // BUG FIX: Type is now strictly 'CaughtPokemon[]' to satisfy the TableView contract.
    pokemons: processedPokemons as CaughtPokemon[],
    allCaughtPokemons: myPokemons, // Used for Stats & CSV Export (Full Dataset)

    // Metrics
    totalCount: myPokemons.length,
    filteredCount: processedPokemons.length,
    isEmpty: myPokemons.length === 0,

    // UI Controls
    viewMode,
    setViewMode,

    // Filter Controls
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,

    // Selection Controls
    isSelectionMode,
    selectedIds,
    toggleSelectionMode,
    togglePokemonSelection,
    selectAll,
    handleRelease,
  };
};
