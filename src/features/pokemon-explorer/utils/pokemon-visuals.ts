/**
 * @file pokemon-visuals.ts
 * @description Centralized Configuration for Pokémon Visual Themes.
 *
 * ENGINEERING PRINCIPLE: Configuration over Implementation
 * This file acts as a "Style Dictionary". By decoupling the visual values (colors, gradients)
 * from the React components, we gain two benefits:
 * 1. Scalability: We can tweak the "Fire" theme without touching any UI code.
 * 2. Independence: Each type has its own explicit configuration. Even if 'Ghost' and 'Psychic'
 * currently share colors (due to MVP constraints), they remain separate entities.
 * This allows for granular customization in the future without regression.
 */

// --- TYPES ---

/**
 * Defines the structure of a visual theme.
 * Using an interface ensures that if we add a new property later (e.g., 'fontColor'),
 * TypeScript will force us to update all types.
 */
export interface PokemonTheme {
  glow: string; // Outer glow/shadow color
  bg: string; // The complex gradient for the card body
  holo: string; // The holographic background behind the image
}

export const CARD_YELLOW = '#ffcc00';

// --- THEME CONFIGURATION ---

/**
 * The Master Dictionary.
 * Keys represent Pokémon types (lowercase).
 * Values define the complete visual identity for that type.
 */
export const TYPE_THEMES: Record<string, PokemonTheme> = {
  fire: {
    glow: 'rgba(239, 68, 68, 0.8)',
    bg: `radial-gradient(circle at 15% 25%, rgba(255, 230, 210, 0.5) 0%, transparent 35%), radial-gradient(circle at 85% 75%, rgba(255, 230, 210, 0.4) 0%, transparent 35%), linear-gradient(160deg, #e69d8e 0%, #d17a64 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #ffecd6 0%, #f0cbb6 100%)',
  },
  water: {
    glow: 'rgba(59, 130, 246, 0.8)',
    bg: `radial-gradient(circle at 20% 10%, rgba(230, 245, 255, 0.6) 0%, transparent 30%), radial-gradient(circle at 80% 90%, rgba(230, 245, 255, 0.5) 0%, transparent 30%), linear-gradient(160deg, #9bb8ed 0%, #6b94d6 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #e8f4ff 0%, #cce3fa 100%)',
  },
  grass: {
    glow: 'rgba(34, 197, 94, 0.8)',
    bg: `radial-gradient(circle at 10% 20%, rgba(240, 255, 230, 0.5) 0%, transparent 35%), radial-gradient(circle at 90% 80%, rgba(240, 255, 230, 0.4) 0%, transparent 35%), linear-gradient(160deg, #a8dba8 0%, #7cae7a 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f2ffe6 0%, #d1e8c1 100%)',
  },
  electric: {
    glow: 'rgba(234, 179, 8, 0.8)',
    bg: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 25%), radial-gradient(circle at 70% 70%, rgba(255, 255, 240, 0.6) 0%, transparent 25%), linear-gradient(160deg, #fae28c 0%, #dec25b 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #fffde6 0%, #faeeb4 100%)',
  },
  bug: {
    glow: 'rgba(34, 197, 94, 0.8)',
    bg: `radial-gradient(circle at 10% 20%, rgba(240, 255, 230, 0.5) 0%, transparent 35%), radial-gradient(circle at 90% 80%, rgba(240, 255, 230, 0.4) 0%, transparent 35%), linear-gradient(160deg, #a8dba8 0%, #7cae7a 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f2ffe6 0%, #d1e8c1 100%)',
  },
  psychic: {
    glow: 'rgba(168, 85, 247, 0.8)',
    bg: `radial-gradient(circle at 20% 20%, rgba(243, 232, 255, 0.6) 0%, transparent 30%), radial-gradient(circle at 80% 80%, rgba(243, 232, 255, 0.5) 0%, transparent 30%), linear-gradient(160deg, #d8b4fe 0%, #9333ea 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f3e8ff 0%, #e9d5ff 100%)',
  },
  poison: {
    glow: 'rgba(168, 85, 247, 0.8)',
    bg: `radial-gradient(circle at 20% 20%, rgba(243, 232, 255, 0.6) 0%, transparent 30%), radial-gradient(circle at 80% 80%, rgba(243, 232, 255, 0.5) 0%, transparent 30%), linear-gradient(160deg, #d8b4fe 0%, #9333ea 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f3e8ff 0%, #e9d5ff 100%)',
  },
  ghost: {
    glow: 'rgba(168, 85, 247, 0.8)',
    bg: `radial-gradient(circle at 20% 20%, rgba(243, 232, 255, 0.6) 0%, transparent 30%), radial-gradient(circle at 80% 80%, rgba(243, 232, 255, 0.5) 0%, transparent 30%), linear-gradient(160deg, #d8b4fe 0%, #9333ea 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f3e8ff 0%, #e9d5ff 100%)',
  },
  ice: {
    glow: 'rgba(168, 85, 247, 0.8)',
    bg: `radial-gradient(circle at 20% 20%, rgba(243, 232, 255, 0.6) 0%, transparent 30%), radial-gradient(circle at 80% 80%, rgba(243, 232, 255, 0.5) 0%, transparent 30%), linear-gradient(160deg, #d8b4fe 0%, #9333ea 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f3e8ff 0%, #e9d5ff 100%)',
  },
  rock: {
    glow: 'rgba(186, 168, 89, 0.8)',
    bg: `radial-gradient(circle at 50% 0%, rgba(255, 253, 230, 0.4) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(160, 140, 80, 0.2) 0%, transparent 30%), linear-gradient(160deg, #e0d2a2 0%, #b09e60 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #fcf9ea 0%, #e8dec3 100%)',
  },
  ground: {
    glow: 'rgba(186, 168, 89, 0.8)',
    bg: `radial-gradient(circle at 50% 0%, rgba(255, 253, 230, 0.4) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(160, 140, 80, 0.2) 0%, transparent 30%), linear-gradient(160deg, #e0d2a2 0%, #b09e60 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #fcf9ea 0%, #e8dec3 100%)',
  },
  fighting: {
    glow: 'rgba(186, 168, 89, 0.8)',
    bg: `radial-gradient(circle at 50% 0%, rgba(255, 253, 230, 0.4) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(160, 140, 80, 0.2) 0%, transparent 30%), linear-gradient(160deg, #e0d2a2 0%, #b09e60 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #fcf9ea 0%, #e8dec3 100%)',
  },
  steel: {
    glow: 'rgba(148, 163, 184, 0.9)',
    bg: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.9) 0%, transparent 40%), linear-gradient(160deg, #dae2ed 0%, #94a3b8 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f1f5f9 0%, #cbd5e1 100%)',
  },
  dragon: {
    glow: 'rgba(180, 83, 9, 0.8)',
    bg: `radial-gradient(circle at 10% 20%, rgba(254, 243, 199, 0.5) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(217, 119, 6, 0.3) 0%, transparent 40%), linear-gradient(160deg, #d97706 0%, #78350f 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #fef3c7 0%, #d97706 100%)',
  },
  fairy: {
    glow: 'rgba(244, 114, 182, 0.8)',
    bg: `radial-gradient(circle at 15% 15%, rgba(255, 240, 245, 0.7) 0%, transparent 30%), radial-gradient(circle at 85% 85%, rgba(255, 230, 240, 0.6) 0%, transparent 35%), linear-gradient(160deg, #fbcfe8 0%, #f472b6 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #fff1f2 0%, #fce7f3 100%)',
  },
  dark: {
    glow: 'rgba(96, 165, 250, 0.8)',
    bg: `radial-gradient(circle at 50% 0%, rgba(186, 215, 255, 0.5) 0%, transparent 60%), radial-gradient(circle at 10% 90%, rgba(216, 180, 254, 0.3) 0%, transparent 40%), linear-gradient(160deg, #8ba0c4 0%, #6b7a9e 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #e2e8f0 0%, #cbd5e1 100%)',
  },
  flying: {
    glow: 'rgba(147, 197, 253, 0.8)',
    bg: `radial-gradient(circle at 50% 0%, rgba(224, 242, 254, 0.5) 0%, transparent 50%), linear-gradient(160deg, #bfdbfe 0%, #60a5fa 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f0f9ff 0%, #bae6fd 100%)',
  },
  normal: {
    glow: 'rgba(156, 163, 175, 0.8)',
    bg: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 40%), linear-gradient(160deg, #CFCFB4 0%, #AFAFA0 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f5f5f5 0%, #d4d4d4 100%)',
  },
  default: {
    glow: 'rgba(156, 163, 175, 0.8)',
    bg: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 40%), linear-gradient(160deg, #CFCFB4 0%, #AFAFA0 100%)`,
    holo: 'radial-gradient(circle at 50% 30%, #f5f5f5 0%, #d4d4d4 100%)',
  },
};

// --- HELPER LOGIC ---

/**
 * Determines the visual theme for a Pokémon based on its types.
 *
 * VISUAL PRIORITY LOGIC:
 * A Pokémon like "Pidgey" is Normal/Flying. If we use the primary type (Normal),
 * the card looks gray and dull.
 * Strategy: If the primary type is "Normal" and a secondary type exists,
 * we prioritize the secondary type (e.g., Flying) for a more vibrant UI.
 *
 * @param types - Array of type strings (e.g., ["fire"] or ["normal", "flying"])
 * @returns {PokemonTheme} The selected palette containing bg, holo, and glow styles.
 */
export const getPokemonColors = (types: string[]): PokemonTheme => {
  // Defensive coding: Ensure types exist and normalize case
  const firstType = types[0]?.toLowerCase() || 'default';
  const secondType = types[1] ? types[1].toLowerCase() : null;

  // Decision Algorithm: Swap 'Normal' for the second type if available
  let typeKey = firstType;
  if (firstType === 'normal' && secondType) {
    typeKey = secondType;
  }

  // Lookup the palette directly. Fallback to 'default' if the type is unknown (e.g. new generation type)
  return TYPE_THEMES[typeKey] || TYPE_THEMES['default'];
};
