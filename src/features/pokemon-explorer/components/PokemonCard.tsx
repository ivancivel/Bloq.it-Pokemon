/**
 * @file PokemonCard.tsx
 * @description The fundamental UI unit representing a single Pokémon entity.
 *
 * ENGINEERING PRINCIPLE: Atomic Design & Interactive States
 * This component acts as an "Atom/Molecule" in our design system. It is responsible for:
 * 1. Visual Hierarchy: Displaying critical data (Image, Name, Type) clearly.
 * 2. Interactive Feedback: Providing distinct feedback for Mouse (Hover) vs. Touch (Active).
 * 3. Mobile Optimization: Utilizing CSS hardware acceleration and touch-action properties
 * to ensure 60fps animations and instant click response on iOS/Android.
 *
 * PERFORMANCE NOTE (Image Strategy):
 * We utilize native browser lazy-loading (`loading="lazy"`) for images.
 * This avoids heavy JS libraries (like 'react-lazy-load') and relies on the browser's
 * highly optimized internal scheduler to fetch images only when they approach the viewport.
 */

import { Link } from 'react-router-dom';
import { Pokemon } from '../services/pokemon.service';
import { CatchButton } from '../../../components/CatchButton';
import { getPokemonColors, CARD_YELLOW } from '../utils/pokemon-visuals';
import { Check, Circle, FileEdit } from 'lucide-react';

interface PokemonCardProps {
  /** The Data Entity. */
  pokemon: Pokemon;
  /** Optional index for staggered animations (debug/future use). */
  index?: number;

  // --- SELECTION MODE PROPS ---
  /** If true, the card behaves as a toggleable checkbox instead of a link. */
  selectionMode?: boolean;
  /** Current selection state. */
  isSelected?: boolean;
  /** Callback triggered when the card is tapped in selection mode. */
  onToggle?: () => void;

  // --- ACTION PROPS ---
  /** Optional callback to edit the note (only available in MyPokedex context). */
  onEditNote?: () => void;
}

export const PokemonCard = ({
  pokemon,
  selectionMode = false,
  isSelected = false,
  onToggle,
  onEditNote,
}: PokemonCardProps) => {
  // HOOKS

  // Visual Palette Pattern: Retrieves the consistent theme (bg/glow) for this Pokémon type
  const { bg, holo } = getPokemonColors(pokemon.types);

  return (
    <Link
      // NAVIGATION LOGIC:
      // If in selection mode, we disable navigation (to='#') to prevent accidental page transitions.
      // Otherwise, we route to the details page.
      to={selectionMode ? '#' : `/pokemon/${pokemon.id}`}
      // EVENT INTERCEPTION:
      // We must stop the Link's default behavior if we are just selecting the card.
      onClick={(e) => {
        if (selectionMode) {
          e.preventDefault();
          onToggle?.();
        }
      }}
      // DYNAMIC STYLING:
      // Applies the specific type-based gradient and border color.
      style={{
        background: bg,
        borderColor: isSelected ? '#ef4444' : CARD_YELLOW, // Visual feedback for selection
      }}
      /**
       * CSS ARCHITECTURE & MOBILE OPTIMIZATION
       * * 1. Layout & Borders:
       * - relative/block: Establishes stacking context.
       * - border-[6px]: Thick borders for "Toy-like" aesthetic.
       * * 2. DESKTOP Interaction (Hover):
       * - transition-transform duration-200: Smooth float effect.
       * - hover:-translate-y-1: Lifts the card physically.
       * * 3. MOBILE Interaction (Touch/Active):
       * - active:transition-none: CRITICAL. Removes lag. Touch feedback must be instant (0ms).
       * - md:active:scale-95: Tactile "press" feel on tap.
       * - touch-manipulation: Disables double-tap zoom delay on iOS.
       * - tap-highlight-transparent: Removes native gray overlay on Android.
       */
      className={`
        group relative block rounded-xl p-3 border-[6px] 
        transition-transform duration-200 ease-out
        active:transition-none  
        touch-manipulation 
        md:active:scale-95
        tap-highlight-transparent
        ${!selectionMode ? 'md:hover:-translate-y-1' : ''}
        ${isSelected ? 'scale-95 ring-4 ring-red-400 ring-offset-2' : ''} 
      `}
    >
      {/* --- LAYER 1: SELECTION INDICATOR --- */}
      {/* Conditionally rendered to reduce DOM nodes when not needed */}
      {selectionMode && (
        <div className="absolute -top-3 -left-3 z-30">
          <div
            className={`
              rounded-full p-1 shadow-md transition-colors duration-200
              ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}
            `}
          >
            {isSelected ? <Check size={20} strokeWidth={3} /> : <Circle size={20} />}
          </div>
        </div>
      )}

      {/* --- LAYER 2: HEADER INFO --- */}
      <div className="flex justify-between items-end mb-1 px-1">
        <h2 className="text-lg font-extrabold text-gray-900 capitalize leading-none tracking-tight drop-shadow-sm">
          {pokemon.name}
        </h2>
      </div>

      {/* --- LAYER 3: ACTIONS (Hidden in Selection Mode) --- */}
      {!selectionMode && (
        <>
          <div className="absolute top-2 right-2 z-20">
            {/* Component Composition:
              The CatchButton handles its own 'onClick' propagation internally 
              to avoid triggering the card navigation.
            */}
            <CatchButton pokemon={pokemon} />
          </div>

          {onEditNote && (
            <div className="absolute bottom-2 right-2 z-20">
              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevent Link navigation
                  e.stopPropagation(); // Stop event bubbling
                  onEditNote();
                }}
                className="p-3 bg-white rounded-full shadow-md border-2 border-gray-200 text-gray-500 hover:text-black hover:border-red-500 flex items-center justify-center active:scale-90 transition-transform"
              >
                <FileEdit size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* --- LAYER 4: VISUALS (Holographic BG + Image) --- */}
      <div
        className="rounded-lg p-2 relative overflow-hidden border-2 shadow-inner"
        style={{ background: holo, borderColor: `${CARD_YELLOW}66` }}
      >
        {/* Decorative Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none"></div>

        <div className="relative w-32 h-32 mx-auto flex items-center justify-center z-10">
          <img
            src={pokemon.imageUrl}
            alt={pokemon.name}
            // PERFORMANCE: Native Lazy Loading
            // Browser handles fetch priority automatically.
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      </div>
    </Link>
  );
};
