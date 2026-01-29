/**
 * @file csv-export.ts
 * @description Utility to serialize the user's collection into a CSV file.
 *
 * ENGINEERING PRINCIPLE: Data Portability & Client-Side Processing
 * Instead of asking a server to generate a report (which costs money and latency),
 * we generate the file entirely in the user's browser using the Blob API.
 *
 * UX DECISION (Flattening Data):
 * We split array fields (like 'Types') into separate columns ('Type 1', 'Type 2').
 * Why? Because spreadsheets (Excel/Sheets) filter distinct columns better than
 * comma-separated strings inside a single cell.
 */

import { CaughtPokemon } from '../../../lib/db';

export const downloadPokedexCSV = (pokemons: CaughtPokemon[]) => {
  // Defensive coding: Do nothing if there's no data
  if (!pokemons.length) return;

  // 1. DEFINE HEADERS
  // Explicitly mapping the schema ensures we control exactly what the user sees.
  const headers = [
    'ID',
    'Name',
    'Type 1', // Split for better Excel filtering
    'Type 2', // Split for better Excel filtering
    'Height (m)',
    'Weight (kg)',
    'HP',
    'Attack',
    'Defense',
    'Sp. Atk',
    'Sp. Def',
    'Speed',
    'Caught Timestamp',
    'Note',
  ];

  // 2. DATA TRANSFORMATION (The Serialization Loop)
  const rows = pokemons.map((p) => {
    // SECURITY/ROBUSTNESS: CSV Injection Prevention
    // If a user writes a note like: "Cool, strong", the comma would break the CSV column.
    // We wrap it in quotes and escape existing quotes (" -> "") to keep the file valid.
    const safeNote = p.note ? `"${p.note.replace(/"/g, '""')}"` : '';

    // Data Flattening: Handling the array[0] and array[1] safely
    const type1 = p.types[0] || '';
    const type2 = p.types[1] || '';

    // ISO Format: Standard for data portability (machine readable)
    const isoDate = new Date(p.caughtAt).toISOString();

    return [
      p.id,
      p.name,
      type1,
      type2,
      (p.height / 10).toFixed(1),
      (p.weight / 10).toFixed(1),
      p.stats.hp,
      p.stats.attack,
      p.stats.defense,
      p.stats.specialAttack,
      p.stats.specialDefense,
      p.stats.speed,
      isoDate,
      safeNote,
    ].join(',');
  });

  // 3. BLOB CONSTRUCTION
  // We combine headers and rows with newlines.
  const csvContent = [headers.join(','), ...rows].join('\n');

  // 4. TRIGGER DOWNLOAD (The "Invisible Link" Pattern)
  // We create a temporary URL pointing to the RAM memory where our string lives.
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `pokedex_export_${new Date().toISOString().split('T')[0]}.csv`);

  // Append -> Click -> Remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // MEMORY MANAGEMENT: Release the Blob from memory
  URL.revokeObjectURL(url);
};
