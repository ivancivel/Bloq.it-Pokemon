/**
 * @file db.ts
 * @description Local Database configuration using Dexie.js (IndexedDB wrapper).
 *
 * ENGINEERING PRINCIPLE: Offline-First Architecture
 * This database serves as the "source of truth" for the user's personal collection (Caught Pokémon).
 * By using IndexedDB (via Dexie), we ensure:
 * 1. Persistence: Data survives browser refreshes and closures.
 * 2. Offline Capability: The user can access their caught Pokémon without internet.
 * 3. Performance: Querying local IndexedDB is instantaneous compared to API calls.
 */

import Dexie, { Table } from 'dexie';

/**
 * Interface representing the structure of a Pokémon stored locally.
 * Includes explicit typing for stats to ensure type safety across the app.
 */
export interface CaughtPokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  caughtAt: Date;
  note?: string; // Optional user-generated content
  height: number;
  weight: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

/**
 * The Database Class definition.
 * Extends Dexie to provide strongly-typed table access.
 */
class PokedexDatabase extends Dexie {
  // '!' indicates that this property will be initialized by Dexie's superclass logic.
  caughtPokemon!: Table<CaughtPokemon>;

  constructor() {
    // Database name visible in Browser DevTools -> Application -> IndexedDB
    super('BloqitPokedexDB');

    /**
     * Schema Definition
     * keys:
     * - 'id': Primary Key (Unique Identifier)
     * - 'name': Indexed for fast sorting/filtering
     * - '*types': Multi-entry index (allows efficient searching by "Fire", "Water", etc.)
     * - 'caughtAt': Indexed for chronological sorting
     * - 'height', 'weight': Indexed for sorting requirements
     */
    this.version(2).stores({
      caughtPokemon: 'id, name, *types, caughtAt, height, weight',
    });
  }
}

// Singleton instance to be used throughout the application
export const db = new PokedexDatabase();
