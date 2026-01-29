// @vitest-environment jsdom
/**
 * @file usePokedexStats.test.tsx
 * @description Unit tests for the Stats Calculator.
 *
 * TEST STRATEGY:
 * We mock the 'useQuery' API response to control the "Total Pokemon Count".
 * We then pass different arrays of 'myPokemons' to see if the math holds up.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePokedexStats } from './usePokedexStats';
import { CaughtPokemon } from '../../../lib/db';

// --- MOCKS ---
// Mock useQuery to control the "Global Total"
const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  // FIX: Substituído 'any' por 'unknown' para satisfazer o linter
  useQuery: (opts: unknown) => mockUseQuery(opts),
}));

// Helper to create fake pokemon array
// FIX: Usamos 'unknown' como ponte segura para converter objeto parcial em tipo completo
const createMockPokemons = (count: number) =>
  new Array(count).fill({ id: 1 }) as unknown as CaughtPokemon[];

describe('usePokedexStats Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null if user has 0 pokemon', () => {
    // ARRANGE
    mockUseQuery.mockReturnValue({ data: undefined }); // API loading

    // ACT
    const { result } = renderHook(() => usePokedexStats([]));

    // ASSERT
    expect(result.current).toBeNull();
  });

  it('should calculate percentage correctly based on API total', () => {
    // ARRANGE
    // API returns 1000 total pokemon
    mockUseQuery.mockReturnValue({ data: new Array(1000) });

    // User has 500 pokemon
    const myCollection = createMockPokemons(500);

    // ACT
    const { result } = renderHook(() => usePokedexStats(myCollection));

    // ASSERT
    expect(result.current?.caughtCount).toBe(500);
    expect(result.current?.totalCount).toBe(1000);
    expect(result.current?.completionRate).toBe(50); // 50%
    expect(result.current?.percentageText).toBe('50');
  });

  it('should use fallback total (1350) if API fails', () => {
    // ARRANGE
    // API returns undefined (Network Error)
    mockUseQuery.mockReturnValue({ data: undefined });

    // User has 135 pokemon
    const myCollection = createMockPokemons(135);

    // ACT
    const { result } = renderHook(() => usePokedexStats(myCollection));

    // ASSERT
    // 135 is 10% of 1350
    expect(result.current?.totalCount).toBe(1350);
    expect(result.current?.percentageText).toBe('10');
  });

  it('should format percentage "< 1" for very small progress', () => {
    // ARRANGE
    mockUseQuery.mockReturnValue({ data: new Array(1000) });
    // User has 1 pokemon (0.1%)
    const myCollection = createMockPokemons(1);

    // ACT
    const { result } = renderHook(() => usePokedexStats(myCollection));

    // ASSERT
    expect(result.current?.percentageText).toBe('< 1');
    expect(result.current?.completionRate).toBe(0.1);
  });
});
