// @vitest-environment jsdom
/**
 * @file usePokemonList.test.tsx
 * @description Integration Unit Test for React Query logic.
 *
 * TEST STRATEGY:
 * Testing a React Query hook requires a specific setup:
 * 1. Wrapper: We must wrap the hook in a <QueryClientProvider> (simulating App.tsx).
 * 2. Mocks: We intercept calls to 'getPokemonList' to avoid real API costs.
 * 3. Flow Verification: We verify if 'fetchNextPage' correctly calculates the offset (0 -> 20 -> 40).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePokemonList } from './usePokemonList';
// Import types to avoid 'any'
import * as PokemonService from '../services/pokemon.service';
import type { Pokemon } from '../services/pokemon.service';

// --- SETUP ---

// 1. Create a Test QueryClient
// Important: Disable 'retry' so tests fail fast on error
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// 2. Create the Wrapper (The "Parent" providing context)
const createWrapper = () => {
  const queryClient = createTestQueryClient();

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePokemonList Hook (Infinite Scroll)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch the first page (offset 0) on mount', async () => {
    // ARRANGE: Mock service returning 1 Pokemon
    // We use 'as unknown as Pokemon[]' to satisfy TS without mocking all 50 properties of a Pokemon
    const mockService = vi
      .spyOn(PokemonService, 'getPokemonList')
      .mockResolvedValue([{ name: 'bulbasaur', url: '...' }] as unknown as Pokemon[]);

    // ACT: Render Hook with Wrapper
    const { result } = renderHook(() => usePokemonList(), {
      wrapper: createWrapper(),
    });

    // ASSERT: Wait for loading to finish
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify service call with offset 0 (page 1)
    expect(mockService).toHaveBeenCalledWith(20, 0);

    // Verify data structure
    expect(result.current.data?.pages[0]).toHaveLength(1);
  });

  it('should calculate next cursor and fetch next page (offset 20)', async () => {
    // ARRANGE: ROBUST MOCK STRATEGY 🛡️
    // Instead of relying on call order (.mockResolvedValueOnce),
    // we return data based on the 'offset' argument. This prevents race conditions.
    const mockService = vi
      .spyOn(PokemonService, 'getPokemonList')
      .mockImplementation(async (_limit, offset) => {
        if (offset === 0) {
          // Page 1: 20 items (Full page)
          return new Array(20).fill({ name: 'pika' }) as unknown as Pokemon[];
        }
        if (offset === 20) {
          // Page 2: 1 item
          return [{ name: 'raichu' }] as unknown as Pokemon[];
        }
        return [];
      });

    const { result } = renderHook(() => usePokemonList(), {
      wrapper: createWrapper(),
    });

    // 1. Wait for 1st page to settle
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify initial state
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true); // Should be true because page 1 was full

    // 2. ACT: Simulate "Scroll Down" (Load More)
    await result.current.fetchNextPage();

    // 3. ASSERT
    // Wait for the data array to grow to size 2 (Page 1 + Page 2)
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    // Verify if Page 2 logic was correct:
    // Previous had 20 items -> Offset should be 20.
    expect(mockService).toHaveBeenLastCalledWith(20, 20);
  });

  it('should stop fetching when API returns empty list', async () => {
    // ARRANGE: Return empty list immediately
    vi.spyOn(PokemonService, 'getPokemonList').mockResolvedValue([]);

    const { result } = renderHook(() => usePokemonList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // ASSERT: hasNextPage should be false
    expect(result.current.hasNextPage).toBe(false);
  });
});
