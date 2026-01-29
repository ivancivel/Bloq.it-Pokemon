// @vitest-environment jsdom
/**
 * @file usePokedexCollection.test.tsx
 * @description Integration tests for the Collection Controller.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePokedexCollection } from './usePokedexCollection';
import * as DexieHooks from 'dexie-react-hooks';
import { usePokedexStore } from '../store/pokedex.store';
import { CaughtPokemon } from '../../../lib/db';

// --- HOISTED MOCKS ---
const { mockRelease } = vi.hoisted(() => {
  return { mockRelease: vi.fn() };
});

// --- MOCKS ---
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock('../store/pokedex.store', () => ({
  usePokedexStore: vi.fn(),
}));

// --- FAKE DATASET ---
// Helper object to avoid repeating stats and removing 'any'
const defaultStats = {
  hp: 10,
  attack: 10,
  defense: 10,
  specialAttack: 10,
  specialDefense: 10,
  speed: 10,
};

const mockPokemons: CaughtPokemon[] = [
  {
    id: 1,
    name: 'bulbasaur',
    types: ['grass', 'poison'],
    height: 7,
    weight: 69,
    caughtAt: new Date('2024-01-01'),
    stats: defaultStats,
    imageUrl: '',
    note: '',
  },
  {
    id: 4,
    name: 'charmander',
    types: ['fire'],
    height: 6,
    weight: 85,
    caughtAt: new Date('2024-01-02'),
    stats: defaultStats,
    imageUrl: '',
    note: '',
  },
  {
    id: 143,
    name: 'snorlax',
    types: ['normal'],
    height: 21,
    weight: 4600,
    caughtAt: new Date('2024-01-03'),
    stats: defaultStats,
    imageUrl: '',
    note: '',
  },
];

describe('usePokedexCollection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(DexieHooks.useLiveQuery).mockReturnValue(mockPokemons);

    // Type Safe Mock Implementation for Zustand Selector
    // We define the specific shape of the state part we are mocking
    (usePokedexStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: { releasePokemon: typeof mockRelease }) => unknown) => {
        return selector({ releasePokemon: mockRelease });
      }
    );
  });

  // --- 1. FILTERING LOGIC ---
  it('should filter pokemons by name (Search)', () => {
    const { result } = renderHook(() => usePokedexCollection());
    expect(result.current.pokemons).toHaveLength(3);

    act(() => {
      result.current.setSearchQuery('saur');
    });

    expect(result.current.pokemons).toHaveLength(1);
    expect(result.current.pokemons[0].name).toBe('bulbasaur');
  });

  it('should filter pokemons by type', () => {
    const { result } = renderHook(() => usePokedexCollection());

    act(() => {
      result.current.setSelectedType('fire');
    });

    expect(result.current.pokemons).toHaveLength(1);
    expect(result.current.pokemons[0].name).toBe('charmander');
  });

  // --- 2. SORTING LOGIC ---
  it('should sort by weight descending (Heaviest first)', () => {
    const { result } = renderHook(() => usePokedexCollection());

    act(() => {
      result.current.setSortBy('weight-desc');
    });

    expect(result.current.pokemons[0].name).toBe('snorlax');
    expect(result.current.pokemons[2].name).toBe('bulbasaur');
  });

  it('should sort by capture date descending (Newest first)', () => {
    const { result } = renderHook(() => usePokedexCollection());

    act(() => {
      result.current.setSortBy('caughtAt-desc');
    });

    expect(result.current.pokemons[0].name).toBe('snorlax');
  });

  // --- 3. SELECTION LOGIC ---
  it('should handle "Select All" correctly', () => {
    const { result } = renderHook(() => usePokedexCollection());

    act(() => {
      result.current.toggleSelectionMode();
      result.current.selectAll();
    });

    expect(result.current.selectedIds.size).toBe(3);
    expect(result.current.selectedIds.has(143)).toBe(true);

    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selectedIds.size).toBe(0);
  });

  // --- 4. ACTION LOGIC ---
  it('should call releasePokemon store action with selected IDs', async () => {
    const { result } = renderHook(() => usePokedexCollection());

    // ARRANGE: Split acts to ensure state updates propagate correctly
    act(() => {
      result.current.toggleSelectionMode();
    });

    act(() => {
      result.current.togglePokemonSelection(1);
    });

    act(() => {
      result.current.togglePokemonSelection(4);
    });

    // ACT: Release
    await act(async () => {
      await result.current.handleRelease();
    });

    // ASSERT
    expect(mockRelease).toHaveBeenCalledWith(expect.arrayContaining([1, 4]));
    expect(result.current.isSelectionMode).toBe(false);
  });
});
