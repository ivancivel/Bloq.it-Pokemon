// @vitest-environment jsdom
/**
 * @file useCatchButtonLogic.test.tsx
 * @description Behavior Testing for the Capture Logic (Hook).
 *
 * STRATEGY:
 * We focus on the most critical path: Catching a Pokemon.
 * We mock the database and image utilities to prevent side effects during testing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCatchButtonLogic } from './useCatchButtonLogic';
import { usePokedexStore } from '../../features/pokedex/store/pokedex.store';
import { Pokemon } from '../../features/pokemon-explorer/services/pokemon.service';

// --- SIMPLIFIED MOCKS ---

// 1. Database Mock (Only what is needed for CATCHING)
vi.mock('../../lib/db', () => ({
  db: {
    transaction: vi.fn((_mode, _tables, callback) => callback()),
    caughtPokemon: {
      add: vi.fn().mockResolvedValue(1), // Simulate successful insert
      put: vi.fn().mockResolvedValue(1), // Simulate successful update
      delete: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

// 2. Image Utils Mock
vi.mock('../../features/pokedex/utils/image-utils', () => ({
  convertImageUrlToBase64: vi.fn().mockResolvedValue('fake-base64-string'),
}));

// --- TEST DATA ---
const mockPokemon: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  imageUrl: 'bulba.png',
  types: ['grass'],
  height: 7,
  weight: 69,
  stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
};

describe('useCatchButtonLogic Hook', () => {
  // RESET: Clean the store and mocks before every test
  beforeEach(() => {
    usePokedexStore.setState({ caughtIds: new Set() });
    vi.clearAllMocks();
  });

  // TEST 1: Initial State
  it('should initialize with isCaught = false', () => {
    const { result } = renderHook(() => useCatchButtonLogic({ pokemon: mockPokemon }));
    expect(result.current.isCaught).toBe(false);
  });

  // TEST 2: Catch Action (Critical Path)
  it('should catch the pokemon and stop propagation on click', async () => {
    const { result } = renderHook(() => useCatchButtonLogic({ pokemon: mockPokemon }));

    // Mock the Mouse Event to verify stopPropagation (UX Safety)
    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    // ACT: Click to catch
    // We use 'await act' because the catch logic is async (DB operations)
    await act(async () => {
      await result.current.handleClick(mockEvent);
    });

    // ASSERT:
    // 1. Verify if the ID was added to the Zustand Store
    const storeState = usePokedexStore.getState();
    expect(storeState.caughtIds.has(1)).toBe(true);

    // 2. Verify if the click propagation was stopped
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
