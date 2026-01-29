/**
 * @file usePokemonDetails.ts
 * @description The central controller for the Details View.
 *
 * ENGINEERING PRINCIPLE: Data Fusion & Platform Resilience
 * This hook is responsible for "hydrating" the view by merging two distinct data sources:
 * 1. Local Persistence (Dexie): Used if the user has caught the Pokémon (provides 'caughtAt' & custom image).
 * 2. Remote API (React Query): Used for static stats if not locally cached.
 *
 * RESILIENCE:
 * It implements a robust "Copy to Clipboard" strategy that degrades gracefully
 * from the modern Async Clipboard API to a legacy DOM manipulation method
 * to ensure functionality across all browsers (including HTTP contexts).
 */

import { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPokemonById } from '../../pokemon-explorer/services/pokemon.service';
import { db, CaughtPokemon } from '../../../lib/db';
import { getPokemonColors } from '../../pokemon-explorer/utils/pokemon-visuals';
import { logger } from '../../../lib/logger';

export const usePokemonDetails = () => {
  const { id } = useParams();
  const pokemonId = Number(id);
  const [searchParams] = useSearchParams();
  const [isRevealed, setIsRevealed] = useState(false);

  // STATE FOR LOCAL DATA
  // We use standard React state instead of a subscription to avoid overhead.
  const [localPokemon, setLocalPokemon] = useState<CaughtPokemon | undefined>(undefined);
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  // --- 1. CONTEXT AWARENESS (Shared View vs. Owner View) ---
  const sharedDateStr = searchParams.get('caughtAt');
  const isSharedView = !!sharedDateStr;

  // --- 2. LOCAL DATA SOURCE (One-Time Fetch) ---
  // We fetch strictly ONCE on mount/id-change. No subscriptions.
  useEffect(() => {
    let mounted = true;
    setIsLocalLoading(true);

    db.caughtPokemon
      .get(pokemonId)
      .then((data) => {
        if (mounted) setLocalPokemon(data);
      })
      .catch((err) => {
        logger.error('Failed to fetch local details', err);
      })
      .finally(() => {
        if (mounted) setIsLocalLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [pokemonId]);

  // --- 3. REMOTE DATA SOURCE (The "Online Truth") ---
  const {
    data: apiPokemon,
    isLoading: isApiLoading,
    isError: isApiError,
  } = useQuery({
    queryKey: ['pokemon', pokemonId],
    queryFn: () => getPokemonById(pokemonId),
    enabled: !!pokemonId,
    retry: 1,
  });

  // --- 4. DATA MERGE STRATEGY ---
  const pokemon = useMemo(() => {
    // CASE A: SHARED VIEW (The "Neutrality Principle")
    // If the user arrived via a shared link (?caughtAt=...), we FORCE the use of API data.
    // WHY? To avoid "Frankenstein Objects".
    // If we used local data (because ID matches), the user would see their own low-res
    // Base64 image mixed with the friend's capture date.
    // A shared view must always represent the pristine/official state of the Pokémon,
    // untainted by the viewer's local cache or customizations.
    if (isSharedView) {
      return apiPokemon;
    }

    // CASE B: PERSONAL COLLECTION (The "Offline Truth")
    // If I am browsing my own Pokedex and I have this Pokémon, use the local copy.
    // This ensures I see my specific version (offline image, caught date, etc).
    if (localPokemon) {
      return localPokemon;
    }

    // CASE C: DISCOVERY (Fallthrough)
    // If I don't have it locally and it's not a shared link, show the standard API data.
    return apiPokemon;
  }, [localPokemon, apiPokemon, isSharedView]);

  // --- 5. DERIVED STATE ---
  const displayDate = useMemo(() => {
    if (sharedDateStr) return new Date(sharedDateStr);
    if (localPokemon?.caughtAt) return new Date(localPokemon.caughtAt);
    return null;
  }, [sharedDateStr, localPokemon]);

  const visuals = useMemo(() => {
    if (!pokemon) return null;
    return getPokemonColors(pokemon.types);
  }, [pokemon]);

  // --- 6. ROBUST SHARING LOGIC ---
  const handleShare = async (): Promise<boolean> => {
    const dateToShare = localPokemon?.caughtAt?.toISOString();
    let shareUrl = `${window.location.origin}/pokemon/${id}`;

    if (dateToShare) {
      const params = new URLSearchParams();
      params.append('caughtAt', dateToShare);
      shareUrl += `?${params.toString()}`;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        return true;
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback for HTTP/Legacy Browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (fallbackError) {
        logger.error('Fallback copy failed', fallbackError);
        return false;
      }
    }
  };

  // UX ANIMATION
  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // AGGREGATED LOADING/ERROR STATES
  // Valid loading state: API is loading OR Local DB is reading (and we're not in shared view)
  const isEffectiveLoading = (isApiLoading || (isLocalLoading && !isSharedView)) && !pokemon;

  // Valid error state: API failed AND Local DB found nothing AND not shared
  const isEffectiveError = isApiError && !localPokemon && !isSharedView && !isLocalLoading;

  return {
    pokemon,
    displayDate,
    isSharedView,
    isLoading: isEffectiveLoading,
    isError: isEffectiveError,
    isRevealed,
    visuals,
    handleShare,
  };
};
