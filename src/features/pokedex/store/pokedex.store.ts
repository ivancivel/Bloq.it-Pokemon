/**
 * @file pokedex.store.ts
 * @description Global State Manager for the "My Pokedex" feature.
 *
 * ENGINEERING PRINCIPLE: Hybrid State Management (Memory + Persistence)
 * This store bridges the gap between:
 * 1. Zustand (In-Memory): For high-performance, reactive UI updates.
 * 2. Dexie (IndexedDB): For permanent, offline-capable storage.
 *
 * PERFORMANCE ARCHITECTURE:
 * We use a `Set<number>` for 'caughtIds'.
 * Why?
 * - Array.includes(id) is O(N) -> Slows down as you catch more Pokemon.
 * - Set.has(id) is O(1) -> Instant lookup, even with 10,000 Pokemon.
 */

import { create } from 'zustand';
import { db, CaughtPokemon } from '../../../lib/db';
import { logger } from '../../../lib/logger';
import { convertImageUrlToBase64 } from '../utils/image-utils';

interface PokedexState {
  caughtIds: Set<number>;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  catchPokemon: (pokemon: Omit<CaughtPokemon, 'caughtAt'>) => Promise<void>;
  releasePokemon: (ids: number[]) => Promise<void>;
  updatePokemonNote: (id: number, note: string) => Promise<void>;
}

const MAX_NOTE_LENGTH = 200;

export const usePokedexStore = create<PokedexState>((set, get) => ({
  // Initial state is empty. 'initialize()' hydrates this from IndexedDB.
  caughtIds: new Set(),
  isInitialized: false,

  // --- 1. INITIALIZATION FLOW ---
  // Must be called once on App mount. Reconstructs the Set O(N) once,
  // enabling O(1) lookups for the rest of the session.
  initialize: async () => {
    if (get().isInitialized) return;
    try {
      const allPokemon = await db.caughtPokemon.toArray();
      const ids = new Set(allPokemon.map((p) => p.id));
      set({ caughtIds: ids, isInitialized: true });
    } catch (e) {
      logger.error('Failed to initialize Pokedex store from DB', e);
    }
  },

  // --- 2. CATCH ACTION (The Complex One) ---
  catchPokemon: async (pokemon) => {
    const currentIds = get().caughtIds;

    // SECURITY / INTEGRITY: Prevent duplicate IDs in the DB
    if (currentIds.has(pokemon.id)) {
      logger.warn(`Duplicate capture attempt blocked: ${pokemon.name} (${pokemon.id})`);
      return;
    }

    // UX PATTERN: Optimistic Update
    // We update the UI IMMEDIATELY (add checkmark), assuming success.
    // This removes the "network lag" feeling.
    const previousState = new Set(currentIds);
    const nextState = new Set(previousState);
    nextState.add(pokemon.id);
    set({ caughtIds: nextState });

    try {
      // OFFLINE STRATEGY: Blob Conversion
      // 1. Fetch the image blob from the URL.
      // 2. Convert to Base64 string.
      // 3. Store the STRING in IndexedDB.
      // Why? So users can see their caught Pokemon even in Airplane Mode.
      const offlineImage = await convertImageUrlToBase64(pokemon.imageUrl);

      // PERSISTENCE
      await db.caughtPokemon.add({
        ...pokemon,
        imageUrl: offlineImage, // Replaces external URL with local data
        caughtAt: new Date(),
      });
    } catch (error) {
      // ERROR HANDLING: Rollback Strategy
      // If the DB write or Image Fetch fails, we must revert the UI
      // so the user doesn't think they caught it when they didn't.
      logger.error('DB Write Failed (Catch)', error);
      set({ caughtIds: previousState });
      // TODO: Ideally, show a Toast Notification here ("Capture failed")
    }
  },

  // --- 3. RELEASE ACTION ---
  releasePokemon: async (ids) => {
    if (ids.length === 0) return;

    const currentIds = get().caughtIds;
    const previousState = new Set(currentIds);

    // Optimistic Update
    const nextState = new Set(previousState);
    ids.forEach((id) => nextState.delete(id));
    set({ caughtIds: nextState });

    try {
      await db.caughtPokemon.bulkDelete(ids);
    } catch (error) {
      logger.error('DB Delete Failed (Release)', error);
      // Rollback on failure
      set({ caughtIds: previousState });
    }
  },

  // --- 4. DATA INTEGRITY ---
  updatePokemonNote: async (id, note) => {
    // SECURITY: Input Sanitization
    // Prevents database bloat and UI overflow issues by enforcing hard limits.
    let safeNote = note.trim();

    if (safeNote.length > MAX_NOTE_LENGTH) {
      logger.warn(`Note truncated for Pokemon ID ${id}.`);
      safeNote = safeNote.substring(0, MAX_NOTE_LENGTH);
    }

    try {
      await db.caughtPokemon.update(id, { note: safeNote });
    } catch (error) {
      logger.error('DB Update Failed (Note)', error);
    }
  },
}));
