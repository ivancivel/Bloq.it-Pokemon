// @vitest-environment jsdom
/**
 * @file pokedex.store.test.ts
 * @description Integration tests for the Global Pokedex Store.
 *
 * TEST STRATEGY:
 * We are testing the integration between Zustand (State) and Dexie (DB).
 * Key scenarios to cover:
 * 1. Happy Path: Catching a pokemon updates both State and DB.
 * 2. Resilience: If DB fails, State must ROLLBACK (Optimistic UI pattern).
 * 3. Integrity: Preventing duplicates.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePokedexStore } from './pokedex.store';
import { CaughtPokemon } from '../../../lib/db';

// --- HOISTED MOCKS (Fixes the "Cannot access before initialization" error) ---
const { mockAdd, mockDelete, mockToArray, mockUpdate } = vi.hoisted(() => {
  return {
    mockAdd: vi.fn(),
    mockDelete: vi.fn(),
    mockToArray: vi.fn(),
    mockUpdate: vi.fn(),
  };
});

// --- MOCKS CONFIGURATION ---

// 1. Mock Image Utils
vi.mock('../utils/image-utils', () => ({
  convertImageUrlToBase64: vi.fn().mockResolvedValue('fake-base64'),
}));

// 2. Mock Logger
vi.mock('../../../lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// 3. Mock Database (Dexie)
vi.mock('../../../lib/db', () => ({
  db: {
    caughtPokemon: {
      add: mockAdd,
      bulkDelete: mockDelete,
      toArray: mockToArray,
      update: mockUpdate,
    },
  },
}));

// --- TEST DATA ---
const mockPokemon: Omit<CaughtPokemon, 'caughtAt'> = {
  id: 25,
  name: 'pikachu',
  imageUrl: 'https://pikachu.com/image.png',
  types: ['electric'],
  height: 4,
  weight: 60,
  stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
  note: '',
};

describe('Pokedex Store (Zustand + Dexie)', () => {
  // RESET STATE BEFORE EACH TEST
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Store State (Zustand persists between tests by default!)
    usePokedexStore.setState({
      caughtIds: new Set(),
      isInitialized: false,
    });

    // Default successful behaviors
    mockAdd.mockResolvedValue(25);
    mockDelete.mockResolvedValue(undefined);
    mockToArray.mockResolvedValue([]);
    mockUpdate.mockResolvedValue(1);
  });

  // --- 1. INITIALIZATION ---
  it('should hydrate state from DB on initialization', async () => {
    // ARRANGE: DB has 1 pokemon
    mockToArray.mockResolvedValue([{ id: 25, name: 'pikachu' }]);

    // ACT
    await usePokedexStore.getState().initialize();

    // ASSERT
    const state = usePokedexStore.getState();
    expect(state.caughtIds.has(25)).toBe(true);
    expect(state.isInitialized).toBe(true);
  });

  // --- 2. CATCH FLOW (Optimistic UI) ---
  it('should optimistically update state and then save to DB', async () => {
    // ACT
    await usePokedexStore.getState().catchPokemon(mockPokemon);

    // ASSERT
    // 1. State updated?
    expect(usePokedexStore.getState().caughtIds.has(25)).toBe(true);

    // 2. DB called with correct data?
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 25,
        name: 'pikachu',
        imageUrl: 'fake-base64', // Validates offline image conversion logic
      })
    );
  });

  // --- 3. ERROR HANDLING  ---
  it('should ROLLBACK state if DB write fails', async () => {
    // ARRANGE: Force DB to fail
    mockAdd.mockRejectedValue(new Error('Disk Full'));

    // ACT
    await usePokedexStore.getState().catchPokemon(mockPokemon);

    // ASSERT
    // The ID should NOT be in the state anymore (Rollback happened)
    expect(usePokedexStore.getState().caughtIds.has(25)).toBe(false);
  });

  // --- 4. INTEGRITY ---
  it('should prevent catching the same pokemon twice', async () => {
    // ARRANGE: Pokemon already in state
    usePokedexStore.setState({ caughtIds: new Set([25]) });

    // ACT
    await usePokedexStore.getState().catchPokemon(mockPokemon);

    // ASSERT
    // DB should NOT be called again
    expect(mockAdd).not.toHaveBeenCalled();
  });

  // --- 5. RELEASE FLOW ---
  it('should remove pokemon from state and DB', async () => {
    // ARRANGE
    usePokedexStore.setState({ caughtIds: new Set([25, 1]) });

    // ACT
    await usePokedexStore.getState().releasePokemon([25]);

    // ASSERT
    const state = usePokedexStore.getState();
    expect(state.caughtIds.has(25)).toBe(false); // Pikachu gone
    expect(state.caughtIds.has(1)).toBe(true); // Bulbasaur stays

    expect(mockDelete).toHaveBeenCalledWith([25]);
  });
});
