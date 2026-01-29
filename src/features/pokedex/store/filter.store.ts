/**
 * @file filter.store.ts
 * @description State Management for the Pokedex List Filters.
 *
 * ENGINEERING PRINCIPLE: Separation of UI State vs. Domain State
 *
 * ARCHITECTURAL DECISION:
 * We deliberately keep this separate from 'pokedex.store.ts'.
 * - 'pokedex.store' manages DATA (Persistence, Integrity, Sync).
 * - 'filter.store' manages VIEW (Search input, Dropdowns).
 *
 * BENEFIT:
 * 1. Performance: Typing in the search bar (high frequency updates) triggers re-renders
 * ONLY for the components listening to filters, not the entire data grid logic.
 * 2. Cleanliness: Keeps the persistence logic free from transient UI variables.
 */

import { create } from 'zustand';
import { logger } from '../../../lib/logger';

// --- 1. THE CONTRACT (Interface) ---
interface FilterState {
  // STATE
  searchQuery: string; // e.g., "char" -> Matches "Charmander", "Charmeleon"
  selectedType: string | null; // e.g., "fire" -> Filters only Fire types

  // ACTIONS
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: string | null) => void;
  resetFilters: () => void; // Useful for a "Clear All" button
}

// --- 2. THE STORE ---
export const useFilterStore = create<FilterState>((set) => ({
  // Initial State: Show everything
  searchQuery: '',
  selectedType: null,

  // --- ACTIONS ---

  /**
   * Updates the text search filter.
   * Usually connected to a debounced input to prevent excessive renders.
   */
  setSearchQuery: (query) => {
    // Analytics hook: We could track what users search for here.
    // logger.debug(`Filter updated: Query="${query}"`);
    set({ searchQuery: query });
  },

  /**
   * Updates the Type dropdown filter.
   * Setting this to null removes the filter.
   */
  setSelectedType: (type) => {
    if (type) {
      logger.info(`User filtered by type: ${type}`);
    }
    set({ selectedType: type });
  },

  /**
   * UX Utility: Resets all filters to default.
   * Essential for the "Empty State" view (e.g., "No results found. Clear filters?")
   */
  resetFilters: () => {
    set({ searchQuery: '', selectedType: null });
  },
}));
