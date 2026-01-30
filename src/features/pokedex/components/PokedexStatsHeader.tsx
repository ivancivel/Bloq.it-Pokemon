/**
 * @file PokedexStatsHeader.tsx
 * @description A gamification element displaying the user's progress.
 *
 * ENGINEERING PRINCIPLE: Visual Feedback
 * Shows a progress bar comparing the user's collection against the total known Pokémon.
 *
 * IMPLEMENTATION DETAILS:
 * - Uses a shimmer animation (`animate-[shimmer_...n]`) to draw attention.
 * - Ensures the bar never has 0% width (min 2%) for visibility.
 */

import { CaughtPokemon } from '../../../lib/db';
import { usePokedexStats } from '../hooks/usePokedexStats';

interface Props {
  pokemons: CaughtPokemon[];
  className?: string;
}

export const PokedexStatsHeader = ({ pokemons, className = '' }: Props) => {
  const stats = usePokedexStats(pokemons);

  if (!stats) return null;

  return (
    <div
      className={`flex items-center gap-2 md:gap-4 bg-white px-3 md:px-4 py-2 rounded-lg border border-gray-200 shadow-sm h-[42px] animate-in fade-in duration-500 ${className}`}
    >
      {/* 1. BADGE INFO (Esquerda) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-baseline gap-1.5 text-sm whitespace-nowrap">
          <span className="font-bold text-gray-900">{stats.caughtCount}</span>
          <span className="text-gray-400 font-medium">/ {stats.totalCount}</span>
          <span className="hidden sm:inline text-gray-400 text-xs font-medium ml-1">Caught</span>
        </div>
      </div>

      {/* 2. PROGRESS BAR  */}

      <div className="flex flex-1 items-center h-full pl-3 md:pl-4 border-l border-gray-100 ml-1 md:ml-2">
        <div className="flex-1 w-full bg-gray-100 h-2 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gray-100 w-full h-full"></div>

          <div
            className="bg-red-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${Math.max(stats.completionRate, 2)}%` }}
          >
            <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        <span className="ml-3 text-xs font-bold text-gray-400 w-[30px] text-right">
          {stats.percentageText}%
        </span>
      </div>
    </div>
  );
};
