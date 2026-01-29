/**
 * @file usePokedexStats.ts
 * @description Calculates statistics about the user's collection.
 *
 * ENGINEERING PRINCIPLE: Derived State & caching
 * Uses `useMemo` to recalculate percentages only when the collection size or global total changes.
 *
 * FALLBACK STRATEGY:
 * If the API call for the global list fails, it defaults to 1350 (approximate count)
 * to prevent the UI from breaking or showing "NaN%".
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CaughtPokemon } from '../../../lib/db';
import { getAllPokemonNames } from '../../pokemon-explorer/services/pokemon.service';

export const usePokedexStats = (myPokemons: CaughtPokemon[]) => {
  // Fetch total count of existing Pokemon from API
  const { data: globalList } = useQuery({
    queryKey: ['all-pokemon-names'],
    queryFn: getAllPokemonNames,
    staleTime: Infinity,
  });

  const stats = useMemo(() => {
    if (!myPokemons || myPokemons.length === 0) return null;

    const caughtCount = myPokemons.length;
    const totalCount = globalList?.length || 1350; // Resilient fallback

    // 1. Raw Percentage (for logic/width calculations)
    const rawPercentage = (caughtCount / totalCount) * 100;

    // 2. Human Readable Text
    // Logic: Avoid showing "0%" if user has at least one, and avoid decimals for cleanliness.
    const percentageText =
      rawPercentage < 1 && rawPercentage > 0 ? '< 1' : Math.floor(rawPercentage).toString();

    return {
      caughtCount,
      totalCount,
      percentageText,
      completionRate: rawPercentage,
    };
  }, [myPokemons, globalList]);

  return stats;
};
