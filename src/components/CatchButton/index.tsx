/**
 * @file index.tsx
 * @description The main Catch Button component.
 *
 * ENGINEERING PRINCIPLE: Presentational Component (The "View")
 * This component implements the "Dumb Component" pattern. It has no internal state logic;
 * it simply delegates behavior to the `useCatchButtonLogic` hook and renders based on the result.
 *
 * ACCESSIBILITY (A11Y):
 * - Semantic HTML: Uses a real `<button>` (not a div).
 * - Screen Readers: Since this is an icon-only button, we generate a dynamic `aria-label`
 * so users know exactly what action they are taking ("Catch Pikachu").
 *
 * FLEXIBILITY:
 * Designed to be context-agnostic. It works equally well on the small PokemonCard
 * or the large DetailsPage header, thanks to the `className` prop and relative styling.
 */

import clsx from 'clsx';
import { Pokemon } from '../../features/pokemon-explorer/services/pokemon.service';
import { useCatchButtonLogic } from './useCatchButtonLogic';
import { ClosedPokeballIcon, OpenPokeballIcon } from './PokeballIcons';

interface CatchButtonProps {
  /** The Pokémon context for this button. */
  pokemon: Pokemon;
  /** Optional classes for layout positioning (e.g. absolute positioning in a Card). */
  className?: string;
  /** Forces the button into a disabled state (visual & functional). */
  disabled?: boolean;
}

export const CatchButton = ({ pokemon, className, disabled = false }: CatchButtonProps) => {
  // LOGIC DELEGATION
  // We extract the "Thinking" part to keep this component focused on "Drawing".
  const { isCaught, handleClick } = useCatchButtonLogic({
    pokemon,
    disabled,
  });

  // VISUAL TOGGLE
  // Swaps the SVG asset entirely based on state, rather than just changing CSS.
  // This allows for distinct silhouettes for accessibility.
  const IconComponent = isCaught ? ClosedPokeballIcon : OpenPokeballIcon;

  // A11Y LABEL GENERATION
  const label = isCaught ? `Caught ${pokemon.name}` : `Catch ${pokemon.name}`;

  return (
    <button
      onClick={handleClick}
      // LOGIC: A caught Pokémon cannot be "re-caught", so we disable interaction.
      disabled={isCaught || disabled}
      aria-label={label}
      title={label} // Tooltip for mouse users
      className={clsx(
        'p-2 rounded-full transition-all duration-200 shadow-md border-2 group relative',
        isCaught
          ? 'bg-white border-red-100 cursor-default opacity-100'
          : disabled
            ? 'bg-gray-50 border-gray-200 cursor-default opacity-50 grayscale'
            : 'bg-white border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-500 hover:scale-105 cursor-pointer',
        className
      )}
    >
      <IconComponent className={clsx('w-7 h-7 ')} />
    </button>
  );
};
