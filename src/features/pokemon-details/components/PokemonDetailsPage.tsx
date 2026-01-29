/**
 * @file PokemonDetailsPage.tsx
 * @description The immersive "Trading Card" view for a single Pokémon.
 *
 * ENGINEERING PRINCIPLE: Mobile-First UX & Visual Feedback
 *
 * OPTIMIZATIONS:
 * 1. Interaction Latency: Uses `onPointerUp` instead of `onClick` for navigation buttons.
 * This bypasses the 300ms mobile tap delay, making the app feel "native".
 * 2. Visual Feedback: Implements a Holographic Shine effect using CSS keyframes,
 * simulating a real rare trading card.
 * 3. Accessibility: 'Toast' notifications use `role="status"` to announce actions to screen readers.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, WifiOff, RefreshCw, Globe, Backpack, CheckCircle2 } from 'lucide-react';
import { usePokemonDetails } from '../hooks/usePokemonDetails';
import { logger } from '@/lib/logger';

const statLabels: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Sp. Atk',
  specialDefense: 'Sp. Def',
  speed: 'Speed',
};

export const PokemonDetailsPage = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const {
    pokemon,
    isLoading,
    isError,
    isRevealed,
    visuals,
    handleShare,
    displayDate,
    isSharedView,
  } = usePokemonDetails();

  /**
   * Action Handler for Sharing
   * Displays a temporary Toast notification upon success.
   */
  const onShareClick = async () => {
    try {
      const success = await handleShare();
      if (success) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      }
    } catch (error) {
      logger.error('Failed to share:', error);
    }
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-gray-500 font-medium animate-pulse">Scanning Pokémon DNA...</p>
      </div>
    );
  }

  // --- ERROR STATE (Network / Not Found) ---
  if (isError || !pokemon || !visuals) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full flex flex-col items-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <WifiOff size={48} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Signal Lost</h2>
          <p className="text-gray-500 mb-6">
            We couldn't connect to the Pokédex Network to fetch data for this wild Pokémon.
          </p>

          <div className="flex flex-col gap-3 w-full">
            {/* RETRY ACTION */}
            <button
              type="button"
              onPointerUp={() => window.location.reload()}
              className="
                w-full flex items-center justify-center gap-2 py-3 
                bg-red-600 text-white rounded-xl font-bold 
                hover:bg-red-700 transition-colors
                touch-manipulation cursor-pointer
              "
            >
              <RefreshCw size={18} /> Try Again
            </button>

            {/* FALLBACK ACTION */}
            <button
              type="button"
              onPointerUp={() => navigate('/')}
              className="
                w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold 
                hover:bg-gray-200 transition-colors
                touch-manipulation cursor-pointer
              "
            >
              Back to Explore
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FOOTER LOGIC ---
  let footerText = '';
  if (displayDate) {
    if (isSharedView) {
      const dateStr = displayDate.toLocaleDateString('en-GB');
      footerText = `Fellow Trainer caught this: ${dateStr}`;
    } else {
      const dateStr = displayDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
      const timeStr = displayDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      footerText = `Caught by you: ${dateStr} • ${timeStr}`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      {/* CSS-IN-JS INJECTION 
         Defines the holographic shine animation locally.
      */}
      <style>{`
        .card-shine-effect { 
          background: linear-gradient(
            90deg, 
            #cca300 0%, 
            #ffcc33 25%, 
            #fffee0 50%, 
            #ffcc33 75%, 
            #cca300 100%
          ); 
          background-size: 200% 100%; 
          animation: shineMove 6s linear infinite; 
          border-color: #cca300; 
          box-shadow: 
            inset 0 0 10px rgba(204, 163, 0, 0.4), 
            0 20px 25px -5px rgba(0, 0, 0, 0.2); 
        } 
        @keyframes shineMove { 
          0% { background-position: 0% 50%; } 
          100% { background-position: 200% 50%; } 
        }
      `}</style>

      {/* --- NAVIGATION HEADER --- */}
      <div className="w-full max-w-[340px] mb-6 flex justify-between items-end">
        {/* ACTION: EXPLORE */}
        <button
          type="button"
          onPointerUp={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="
            flex flex-col items-center gap-1 w-16 
            text-[10px] font-bold text-gray-400 uppercase tracking-wider 
            hover:text-red-600 hover:scale-110
            transition-all duration-150
            touch-manipulation cursor-pointer select-none
          "
          aria-label="Go to Explore page"
        >
          <Globe size={18} />
          <span>Explore</span>
        </button>

        {/* ACTION: SHARE (Conditional) */}
        {!isSharedView ? (
          <button
            type="button"
            onPointerUp={(e) => {
              e.preventDefault();
              onShareClick();
            }}
            className="
              flex flex-col items-center gap-1 w-16 
              text-[10px] font-bold text-gray-400 uppercase tracking-wider 
              hover:text-red-500 hover:scale-110
              transition-all duration-150
              touch-manipulation cursor-pointer select-none
            "
            aria-label="Share this Pokémon"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        ) : (
          <div className="w-16" aria-hidden="true"></div>
        )}

        {/* ACTION: POKEDEX */}
        <button
          type="button"
          onPointerUp={(e) => {
            e.preventDefault();
            navigate('/pokedex');
          }}
          className="
            flex flex-col items-center gap-1 w-16 
            text-[10px] font-bold text-gray-400 uppercase tracking-wider 
            hover:text-red-600 hover:scale-110
            transition-all duration-150
            touch-manipulation cursor-pointer select-none
          "
          aria-label="Go to Pokédex"
        >
          <Backpack size={18} />
          <span>Pokédex</span>
        </button>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="relative z-10">
        <div
          className={`
            relative w-[320px] sm:w-[340px] aspect-[2.5/3.5] 
            transition-opacity duration-500 ease-out
            ${isRevealed ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="absolute inset-0 backface-hidden z-10">
            <div className="w-full h-full rounded-2xl p-4 shadow-2xl select-none card-shine-effect bg-white">
              {/* Overlay: Adds depth and hover interaction */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded-3xl z-30 mix-blend-overlay"></div>

              {/* Card Content Container */}
              <div
                className="h-full w-full px-5 pt-4 pb-3 flex flex-col relative overflow-hidden shadow-inner"
                style={{ background: visuals.bg }}
              >
                {/* Header Info */}
                <div className="flex justify-between items-end mb-1 px-0.5 relative z-10">
                  <h1 className="text-lg font-extrabold text-gray-900 tracking-tight capitalize">
                    {pokemon.name}
                  </h1>
                  <div className="flex items-center gap-1">
                    <span className="text-red-700 font-extrabold text-lg">
                      {pokemon.stats.hp} HP
                    </span>
                  </div>
                </div>

                {/* Hero Image */}
                <div
                  className="relative w-full aspect-[1.5] border-4 border-[#e6b800]/60 mb-1 overflow-hidden"
                  style={{ background: visuals.holo }}
                >
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    draggable="false"
                    className="w-full h-full object-contain p-2 relative z-10 drop-shadow-xl transform hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Metadata Strip */}
                <div
                  className="w-[88%] mx-auto h-[12px] mb-3 flex items-center justify-center border border-yellow-800/20 shadow-sm shrink-0 rounded-[1px]"
                  style={{
                    background: 'linear-gradient(90deg, #cca300 0%, #ffe680 50%, #cca300 100%)',
                  }}
                >
                  <p className="text-[8px] font-bold text-[#665200] italic leading-none tracking-wide capitalize">
                    {pokemon.types.join(', ')} &nbsp; Height: {(pokemon.height / 10).toFixed(1)}m
                    &nbsp; Weight: {(pokemon.weight / 10).toFixed(1)}kg
                  </p>
                </div>

                {/* Stats List */}
                <div className="flex-1 px-1 flex flex-col justify-center">
                  <div className="space-y-1">
                    {Object.entries(pokemon.stats).map(
                      ([key, value]) =>
                        key !== 'hp' && (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-wide opacity-80">
                              {statLabels[key] || key}
                            </span>
                            <span className="text-[11px] font-black text-black font-mono">
                              {value}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {/* Footer Date */}
                <div className="mt-auto flex justify-center items-center px-1 pt-2 border-t border-black/10">
                  {footerText && (
                    <span className="text-[10px] font-extrabold text-gray-900 tracking-tight opacity-90">
                      {footerText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- TOAST NOTIFICATION (A11y Optimized) --- */}
        <div
          role="status"
          aria-live="polite"
          className={`
            fixed bottom-10 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl
            bg-gray-900/95 backdrop-blur-sm text-white text-sm font-bold
            transition-all duration-300 transform
            ${
              showToast
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
            }
          `}
        >
          <CheckCircle2 size={18} className="text-green-400" />
          <span>Link copied to clipboard!</span>
        </div>
      </div>
    </div>
  );
};
