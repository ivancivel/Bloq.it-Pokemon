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

import { Award } from 'lucide-react';
import { CaughtPokemon } from '../../../lib/db';
import { usePokedexStats } from '../hooks/usePokedexStats';

interface Props {
  pokemons: CaughtPokemon[];
}

export const PokedexStatsHeader = ({ pokemons }: Props) => {
  const stats = usePokedexStats(pokemons);

  if (!stats) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* STATS BADGE */}
        <div className="flex items-center gap-4 min-w-max">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Award size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Pokédex Progress
            </p>
            <h3 className="text-2xl font-extrabold text-gray-800 leading-none">
              {stats.percentageText}%{' '}
              <span className="text-sm text-gray-400 font-medium">Complete</span>
            </h3>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="flex-1 w-full">
          <div className="flex justify-between mb-2 text-xs font-semibold text-gray-500">
            <span> </span>
            <span>
              {stats.caughtCount} / {stats.totalCount} Caught
            </span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gray-100 w-full h-full"></div>

            {/* Dynamic Width Bar with Shimmer Effect */}
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${Math.max(stats.completionRate, 2)}%` }}
            >
              <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
