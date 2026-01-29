/**
 * @file useCatchButtonLogic.tsx
 * @description Headless hook containing the business logic for the Catch Button.
 *
 * ENGINEERING PRINCIPLE: Separation of Concerns (Logic vs. View)
 * By extracting the interaction logic into a custom hook, we achieve two goals:
 * 1. Testability: Logic can be unit tested in isolation without rendering the UI.
 * 2. Clean Code: The UI component remains purely presentational (Dumb Component).
 *
 * CORE RESPONSIBILITY:
 * Orchestrates the interaction between the user input and the Global Pokedex Store,
 * while rigidly managing event propagation to prevent UI conflicts (e.g., triggering a card navigation).
 */

import { usePokedexStore } from '../../features/pokedex/store/pokedex.store';
import { Pokemon } from '../../features/pokemon-explorer/services/pokemon.service';

interface UseCatchButtonParams {
  /** The target Pokemon entity to catch/check. */
  pokemon: Pokemon;
  /** Optional override to disable interaction (e.g. during animations). */
  disabled?: boolean;
}

export const useCatchButtonLogic = ({ pokemon, disabled }: UseCatchButtonParams) => {
  // GLOBAL STATE INTEGRATION
  const caughtIds = usePokedexStore((state) => state.caughtIds);
  const catchPokemon = usePokedexStore((state) => state.catchPokemon);

  // PERFORMANCE: O(1) Lookup
  // Checking a Set is instant, regardless of whether we have 10 or 10,000 items.
  const isCaught = caughtIds.has(pokemon.id);

  /**
   * Centralized Click Handler
   * Implements the "Defensive Event Handling" pattern.
   */
  const handleClick = (e: React.MouseEvent) => {
    // CRITICAL: Event Propagation Control
    // Since this button is often nested inside the PokemonCard (which acts as a Link),
    // we MUST stop the event from bubbling up. Otherwise, catching a Pokemon would also
    // trigger a navigation to the Details Page, confusing the user.
    e.stopPropagation();
    e.preventDefault();

    // Guard Clause: Prevent actions if disabled or already caught
    if (isCaught || disabled) return;

    // CORE ACTION: Commit to Store
    // Maps the API Domain Model to the Database Schema and persists it.
    catchPokemon({
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.imageUrl,
      types: pokemon.types,
      height: pokemon.height,
      weight: pokemon.weight,
      stats: pokemon.stats,
    });
  };

  return {
    isCaught,
    handleClick,
  };
};
