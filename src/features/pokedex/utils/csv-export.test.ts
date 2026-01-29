// @vitest-environment jsdom
/**
 * @file csv-export.test.ts
 * @description Unit tests for CSV generation logic.
 *
 * TEST STRATEGY (UPDATED):
 * Instead of just checking if the download function was called,
 * we now inspect the ACTUAL CONTENT of the generated Blob.
 * * We verify:
 * 1. Content Validity: Are headers and data rows correct?
 * 2. Data Flattening: Are arrays (Types) split into columns correctly?
 * 3. Security: Are quotes inside notes escaped (" -> "") to prevent CSV injection?
 * 4. Filename: Does it follow the naming convention?
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock, MockInstance } from 'vitest';
import { downloadPokedexCSV } from './csv-export';
import { CaughtPokemon } from '../../../lib/db';

// --- MOCK DATA ---
const mockPokemon: CaughtPokemon = {
  id: 6,
  name: 'charizard',
  types: ['fire', 'flying'], // Two types (tests flattening)
  height: 17,
  weight: 905,
  stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 },
  caughtAt: new Date('2024-01-01T12:00:00.000Z'),
  note: 'Very "strong" & cool', // ⚠️ DANGER: Contains quotes!
  imageUrl: 'base64-image-string',
};

// --- HELPER: Read Blob Content ---
// Reads the Blob content as text so we can assert against the string
const readBlobContent = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
};

// Helper interface for URL Mock
interface MockURL {
  createObjectURL: Mock;
  revokeObjectURL: Mock;
}

describe('CSV Export Utility', () => {
  let createElementSpy: MockInstance;
  let clickSpy: Mock;
  let urlCreateSpy: Mock;
  let urlRevokeSpy: Mock;

  beforeEach(() => {
    // 1. Mock DOM elements
    clickSpy = vi.fn();
    const mockLink = {
      href: '',
      setAttribute: vi.fn(),
      click: clickSpy,
      style: {},
      getAttribute: vi.fn((attr) => (attr === 'download' ? 'pokedex_export_2024-01-01.csv' : null)), // Simple mock
    } as unknown as HTMLAnchorElement;

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

    // 2. Mock URL.createObjectURL
    // IMPORTANT: We capture the Blob passed to this function to inspect it later
    urlCreateSpy = vi.fn(() => 'blob:http://fake-url');
    urlRevokeSpy = vi.fn();

    if (!global.URL) {
      // @ts-expect-error override
      global.URL = {} as URL;
    }
    (global.URL as unknown as MockURL).createObjectURL = urlCreateSpy;
    (global.URL as unknown as MockURL).revokeObjectURL = urlRevokeSpy;

    // 3. Mock body append/remove
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate valid CSV content (Headers, Data Flattening)', async () => {
    // ACT
    downloadPokedexCSV([mockPokemon]);

    // ASSERT: Get the Blob passed to URL.createObjectURL
    const blob = urlCreateSpy.mock.calls[0][0] as Blob;
    const csvContent = await readBlobContent(blob);
    const lines = csvContent.split('\n');

    // 1. Check Headers
    expect(lines[0]).toBe(
      'ID,Name,Type 1,Type 2,Height (m),Weight (kg),HP,Attack,Defense,Sp. Atk,Sp. Def,Speed,Caught Timestamp,Note'
    );

    // 2. Check Data Row & Flattening
    // We expect "fire" and "flying" to be in separate columns
    expect(lines[1]).toContain('charizard');
    expect(lines[1]).toContain('fire,flying');
    // Note: In the raw string it looks like "...,fire,flying,..." because of the comma separator
  });

  it('should sanitize notes containing quotes (Security against CSV Injection)', async () => {
    // ACT
    downloadPokedexCSV([mockPokemon]);

    // ASSERT
    const blob = urlCreateSpy.mock.calls[0][0] as Blob;
    const csvContent = await readBlobContent(blob);

    // The note 'Very "strong" & cool' must become '"Very ""strong"" & cool"'
    // 1. Surrounded by quotes
    // 2. Internal quotes doubled ("")
    expect(csvContent).toContain('"Very ""strong"" & cool"');

    // Ensure the dangerous unescaped version does NOT exist
    expect(csvContent).not.toContain(',Very "strong" & cool,');
  });

  it('should handle pokemon with single type correctly', async () => {
    // ARRANGE: Create a pokemon with only 1 type
    const singleTypePokemon = { ...mockPokemon, types: ['electric'] };

    // ACT
    downloadPokedexCSV([singleTypePokemon]);

    // ASSERT
    const blob = urlCreateSpy.mock.calls[0][0] as Blob;
    const csvContent = await readBlobContent(blob);
    const dataLine = csvContent.split('\n')[1];

    // It should have 'electric' then an empty value for the second type
    // Expected part of string: ...,electric,,...
    expect(dataLine).toContain('electric,,');
  });

  it('should generate correct filename format', () => {
    // ACT
    downloadPokedexCSV([mockPokemon]);

    // ASSERT
    const linkInstance = createElementSpy.mock.results[0].value as HTMLAnchorElement;

    // Check if setAttribute was called with 'download' and a string matching the pattern
    expect(linkInstance.setAttribute).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/^pokedex_export_\d{4}-\d{2}-\d{2}\.csv$/)
    );
  });

  it('should do nothing if list is empty', () => {
    downloadPokedexCSV([]);
    expect(createElementSpy).not.toHaveBeenCalled();
  });
});
