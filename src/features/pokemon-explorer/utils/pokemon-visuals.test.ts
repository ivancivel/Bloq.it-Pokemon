/**
 * @file pokemon-visuals.test.ts
 * @description Unit Tests for the Visual Theme Logic.
 *
 * TEST STRATEGY:
 * We focus on testing the "Business Logic" of UI generation, specifically:
 * 1. Deterministic Output: Ensure the same type always returns the same colors.
 * 2. Priority Rules: Validate complex logic where secondary types override primary ones.
 * 3. Resilience: Ensure the app defaults gracefully when encountering unknown data.
 */

import { describe, it, expect } from 'vitest';
import { getPokemonColors, TYPE_THEMES } from './pokemon-visuals';

describe('Pokemon Visuals Utility', () => {
  // --- 1. BASIC FUNCTIONALITY ---
  it('should return the correct theme for a single known type', () => {
    // Scenario: Standard single-type Pokemon (e.g., Charmander -> Fire)
    const result = getPokemonColors(['fire']);
    expect(result).toEqual(TYPE_THEMES.fire);
  });

  it('should handle uppercase types gracefully (Case Insensitivity)', () => {
    // Resilience: The API might return 'Electric' or 'ELECTRIC'.
    // Our utility must normalize inputs to prevent broken UI lookups.
    const result = getPokemonColors(['Electric']);
    expect(result).toEqual(TYPE_THEMES.electric);
  });

  // --- 2. BUSINESS LOGIC: Priority Rules ---
  // The Design System dictates that "Normal" type (Gray) is dull.
  // If a Pokemon has a secondary type (e.g., Flying), we prioritize that color.

  it('should prioritize the secondary type if the primary is "normal"', () => {
    // Scenario: Pidgey is ['normal', 'flying'].
    // Expectation: We want the 'flying' theme (Blue), NOT 'normal' (Gray).
    const result = getPokemonColors(['normal', 'flying']);

    expect(result).toEqual(TYPE_THEMES.flying);
    // Extra assertion to strictly verify it didn't pick Normal
    expect(result).not.toEqual(TYPE_THEMES.normal);
  });

  it('should still use "normal" theme if it is the ONLY type', () => {
    // Scenario: Rattata is ['normal'].
    // Expectation: Since there is no alternative, we must accept Gray.
    const result = getPokemonColors(['normal']);
    expect(result).toEqual(TYPE_THEMES.normal);
  });

  it('should prioritize the primary type for other combinations', () => {
    // Scenario: Bulbasaur is ['grass', 'poison'].
    // Expectation: The 'Normal' rule does not apply here.
    // We should respect the primary type ('grass').
    const result = getPokemonColors(['grass', 'poison']);
    expect(result).toEqual(TYPE_THEMES.grass);
  });

  // --- 3. RESILIENCE (Edge Cases) ---
  it('should fallback to default theme for unknown types', () => {
    // Scenario: API returns a new "Cosmic" type that we haven't implemented yet.
    // Expectation: Do not crash. Return the safe 'default' theme.
    const result = getPokemonColors(['cosmic']);
    expect(result).toEqual(TYPE_THEMES.default);
  });

  it('should handle empty type arrays safely', () => {
    // Scenario: Data corruption results in an empty array.
    const result = getPokemonColors([]);
    expect(result).toEqual(TYPE_THEMES.default);
  });
});
