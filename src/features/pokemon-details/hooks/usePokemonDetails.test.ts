// @vitest-environment jsdom
/**
 * @file usePokemonDetails.test.tsx
 * @description Integration tests for the Data Fusion logic (API vs Local DB).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePokemonDetails } from './usePokemonDetails';
import { db } from '../../../lib/db';

// --- MOCKS ---

// 1. Mock React Router
const mockUseParams = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams(),
  useSearchParams: () => mockUseSearchParams(),
}));

// 2. Mock React Query
const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  // FIX: Usar 'unknown' em vez de 'any' é mais seguro e satisfaz o linter
  useQuery: (opts: unknown) => mockUseQuery(opts),
}));

// 3. Mock Dexie
vi.mock('../../../lib/db', () => ({
  db: {
    caughtPokemon: {
      get: vi.fn(),
    },
  },
}));

// 4. Mock Visual Utils
vi.mock('../../pokemon-explorer/utils/pokemon-visuals', () => ({
  getPokemonColors: vi.fn().mockReturnValue({ primary: 'red' }),
}));

// --- TEST DATA ---
const mockApiPokemon = { id: 25, name: 'pikachu-api', types: ['electric'] };
const mockLocalPokemon = {
  id: 25,
  name: 'pikachu-local',
  caughtAt: new Date(),
  imageUrl: 'base64',
};

// Interface auxiliar para o mock do document.execCommand
interface MockDocument {
  execCommand: (commandId: string) => boolean;
}

describe('usePokemonDetails Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '25' });
    mockUseSearchParams.mockReturnValue([new URLSearchParams()]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- SCENARIO 1: DISCOVERY ---
  it('should return API data when pokemon is not in local DB', async () => {
    vi.mocked(db.caughtPokemon.get).mockResolvedValue(undefined);
    mockUseQuery.mockReturnValue({ data: mockApiPokemon, isLoading: false });

    const { result } = renderHook(() => usePokemonDetails());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pokemon).toEqual(mockApiPokemon);
    expect(result.current.isSharedView).toBe(false);
  });

  // --- SCENARIO 2: OWNER VIEW ---
  it('should PREFER local data when pokemon is in local DB', async () => {
    vi.mocked(db.caughtPokemon.get).mockResolvedValue(mockLocalPokemon);
    mockUseQuery.mockReturnValue({ data: mockApiPokemon, isLoading: false });

    const { result } = renderHook(() => usePokemonDetails());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.pokemon).toEqual(mockLocalPokemon);
    expect(result.current.pokemon?.name).toBe('pikachu-local');
  });

  // --- SCENARIO 3: SHARED VIEW ---
  it('should FORCE API data when viewing a shared link, even if locally caught', async () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams({ caughtAt: '2024-01-01' })]);
    vi.mocked(db.caughtPokemon.get).mockResolvedValue(mockLocalPokemon);
    mockUseQuery.mockReturnValue({ data: mockApiPokemon, isLoading: false });

    const { result } = renderHook(() => usePokemonDetails());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isSharedView).toBe(true);
    expect(result.current.pokemon).toEqual(mockApiPokemon);
  });

  // --- SCENARIO 4: CLIPBOARD SHARING ---
  it('should use Clipboard API to generate share link', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    });
    Object.assign(window, { isSecureContext: true });

    const { result } = renderHook(() => usePokemonDetails());

    const success = await result.current.handleShare();

    expect(success).toBe(true);
    expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('/pokemon/25'));
  });

  it('should fallback to legacy execCommand if Clipboard API fails', async () => {
    // 1. Disable Clipboard API
    Object.assign(navigator, { clipboard: undefined });

    // 2. FIX: Usamos um cast seguro para 'MockDocument' em vez de 'any'
    // Isto diz ao TS: "Finge que este objeto tem o método execCommand"
    (document as unknown as MockDocument).execCommand = vi.fn();

    // 3. Spy
    const execCommandSpy = vi
      .spyOn(document as unknown as MockDocument, 'execCommand')
      .mockReturnValue(true);

    // 4. Mock DOM elements
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    const { result } = renderHook(() => usePokemonDetails());

    const success = await result.current.handleShare();

    expect(success).toBe(true);
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
  });
});
