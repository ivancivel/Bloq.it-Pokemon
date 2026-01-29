/**
 * @file PokedexTableView.tsx
 * @description The Analytical View of the Pokedex (Data Grid).
 *
 * ENGINEERING PRINCIPLE: Type Consistency & Data Density
 * This component is optimized for "Scannability" — allowing users to quickly compare stats
 * (Weight, Height, Date) across their collection, which is harder in Grid View.
 *
 * PERFORMANCE:
 * It receives `filteredPokemons` directly, assuming the heavy lifting (filtering/sorting)
 * was done by the parent/hook to avoid re-calculating on render.
 */

import { Check, SearchX } from 'lucide-react';
import { CaughtPokemon } from '../../../lib/db';

interface PokedexTableViewProps {
  /** The filtered list of Pokemon to display */
  pokemons: CaughtPokemon[];
  isSelectionMode: boolean;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}

export const PokedexTableView = ({
  pokemons,
  isSelectionMode,
  selectedIds,
  onToggle,
}: PokedexTableViewProps) => {
  // --- EMPTY STATE ---
  if (pokemons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
        <SearchX size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">No Pokémon found</p>
        <p className="text-sm">Try adjusting your filters.</p>
      </div>
    );
  }

  // --- TABLE RENDER ---
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500 pb-24">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          {/* HEADER */}
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {isSelectionMode && <th className="w-10 px-4 py-4"></th>}
              <th className="px-6 py-4 font-semibold text-gray-600">Pokémon</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Types</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Height</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Weight</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Date Caught</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-100">
            {pokemons.map((pokemon) => {
              const isSelected = selectedIds.has(pokemon.id);

              // LOCALIZATION: Format date to British English (DD/MM/YY)
              const dateStr = pokemon.caughtAt
                ? new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(pokemon.caughtAt))
                : '-';

              return (
                <tr
                  key={pokemon.id}
                  onClick={() => isSelectionMode && onToggle(pokemon.id)}
                  className={`
                    transition-colors duration-150
                    ${isSelectionMode ? 'cursor-pointer hover:bg-gray-50' : ''}
                    ${isSelected ? 'bg-red-50/60' : ''}
                  `}
                >
                  {/* SELECTION CHECKBOX */}
                  {isSelectionMode && (
                    <td className="px-4 py-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors 
                        ${isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 text-transparent'}`}
                      >
                        <Check size={12} strokeWidth={4} />
                      </div>
                    </td>
                  )}

                  {/* INFO & AVATAR */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center p-1 border border-gray-100">
                        <img
                          src={pokemon.imageUrl}
                          alt={pokemon.name}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div
                          className={`font-bold capitalize ${isSelected ? 'text-red-700' : 'text-gray-800'}`}
                        >
                          {pokemon.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          #{String(pokemon.id).padStart(3, '0')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* TYPES TAGS */}
                  <td className="px-6 py-3">
                    <div className="flex gap-1 flex-wrap w-32">
                      {pokemon.types.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-500 border border-gray-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* STATS */}
                  <td className="px-6 py-3 text-right font-mono text-gray-600">
                    {(pokemon.height / 10).toFixed(1)}m
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-gray-600">
                    {(pokemon.weight / 10).toFixed(1)}kg
                  </td>
                  <td className="px-6 py-3 text-right text-gray-500 text-xs font-medium">
                    {dateStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
