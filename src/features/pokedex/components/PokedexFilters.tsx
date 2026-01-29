/**
 * @file PokedexFilters.tsx
 * @description A comprehensive toolbar for filtering and sorting the collection.
 *
 * ENGINEERING PRINCIPLE: Controlled Components
 * This component acts as a "Dumb View". It receives all values and setters as props,
 * ensuring it stays perfectly in sync with the `usePokedexCollection` logic.
 *
 * UX PATTERNS:
 * 1. Optgroups: Used in the sort dropdown to categorize options (Name vs Date vs Stats).
 * 2. Visual Feedback: Icons change color on focus-within to indicate active interaction.
 * 3. Clearable Inputs: The search bar offers a quick "X" to reset without backspacing.
 */

import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { SortOption } from '../hooks/usePokedexCollection';

interface PokedexFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedType: string | null;
  setSelectedType: (t: string | null) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
}

const TYPES = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'steel',
  'dark',
  'fairy',
];

export const PokedexFilters = ({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  sortBy,
  setSortBy,
}: PokedexFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* 1. SEARCH INPUT */}
      <div className="relative flex-1 group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Filter my Pokédex..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-base"
        />
        {/* Conditional Clear Button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear filter"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. TYPE DROPDOWN */}
      <div className="relative min-w-[150px] group">
        <Filter
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors"
          size={16}
        />
        <select
          value={selectedType || ''}
          onChange={(e) => setSelectedType(e.target.value || null)}
          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm appearance-none capitalize cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {/* Custom Chevron for consistent UI across browsers */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. SORT DROPDOWN */}
      <div className="relative min-w-[220px] group">
        <ArrowUpDown
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors"
          size={16}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <optgroup label="Date Caught">
            <option value="caughtAt-desc">📅 Newest First</option>
            <option value="caughtAt-asc">📅 Oldest First</option>
          </optgroup>

          <optgroup label="Name">
            <option value="name-asc">🔤 Name (A → Z)</option>
            <option value="name-desc">🔤 Name (Z → A)</option>
          </optgroup>

          <optgroup label="Stats">
            <option value="height-desc">📏 Height (High → Low)</option>
            <option value="height-asc">📏 Height (Low → High)</option>
            <option value="weight-desc">⚖️ Weight (High → Low)</option>
            <option value="weight-asc">⚖️ Weight (Low → High)</option>
          </optgroup>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
