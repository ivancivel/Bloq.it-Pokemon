/**
 * @file MyPokedexPage.tsx
 * @description The main dashboard for the user's personal Pokémon collection.
 *
 * ENGINEERING PRINCIPLE: Composition & Modularity
 * This page orchestrates multiple complex sub-systems without implementing their logic:
 * 1. Visualization Strategy: Toggles between `Grid` (Visual) and `Table` (Analytical).
 * 2. Data Export: Handles CSV generation via the `downloadPokedexCSV` utility.
 * 3. Bulk Actions: Manages the "Release" lifecycle via Selection Mode.
 * 4. User Feedback: Uses a localized Toast system for immediate action confirmation.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  BadgeX,
  Trash2,
  X,
  AlertCircle,
  FileDown,
  CheckCircle2,
} from 'lucide-react';
import { PokemonCard } from '../../../components/PokemonCard';
import { PokedexTableView } from '../components/PokedexTableView';
import { PokedexFilters } from '../components/PokedexFilters';
import { usePokedexCollection } from '../hooks/usePokedexCollection';
import { NoteEditorModal } from '../components/NoteEditorModal';
import { usePokedexStore } from '../store/pokedex.store';
import { Pokemon } from '@/features/pokemon-explorer/services/pokemon.service';
import { PokedexStatsHeader } from '../components/PokedexStatsHeader';
import { CaughtPokemon } from '../../../lib/db';
import { downloadPokedexCSV } from '../utils/csv-export';

export const MyPokedexPage = () => {
  // --- STATE ORCHESTRATION ---
  // We extract all data logic into the custom hook to keep the View clean.
  const {
    pokemons,
    allCaughtPokemons,
    isEmpty,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    isSelectionMode,
    selectedIds,
    toggleSelectionMode,
    togglePokemonSelection,
    selectAll,
    handleRelease,
  } = usePokedexCollection();

  // --- NOTE MANAGEMENT (Local Page Logic) ---
  const updateNote = usePokedexStore((state) => state.updatePokemonNote);
  const [editingPokemon, setEditingPokemon] = useState<CaughtPokemon | null>(null);

  // --- TOAST SYSTEM ---
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // --- EVENT HANDLERS ---
  const onReleaseClick = async () => {
    const count = selectedIds.size;
    await handleRelease();
    triggerToast(count === 1 ? 'Pokémon released!' : `${count} Pokémon released!`);
  };

  const handleOpenNote = (pokemon: Pokemon) => {
    // Type Assertion: Safe because MyPokedex ONLY displays CaughtPokemon
    setEditingPokemon(pokemon as unknown as CaughtPokemon);
  };

  const handleSaveNote = async (note: string) => {
    if (editingPokemon) {
      await updateNote(editingPokemon.id, note);
      setEditingPokemon(null);
    }
  };

  // --- EMPTY STATE VIEW ---
  if (isEmpty) {
    return (
      <div className="text-center py-20 flex flex-col items-center animate-in fade-in duration-700">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <LayoutGrid size={48} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-400 mb-2">Your Pokédex is empty!</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          You haven't caught any Pokémon yet. Go to the Explore page and start your journey!
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-red-600 text-white rounded-full font-bold shadow-lg hover:bg-red-700 hover:-translate-y-1 transition-all"
        >
          Start Catching 🏃‍♂️
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {' '}
      {/* MODAL LAYER */}
      <NoteEditorModal
        isOpen={!!editingPokemon}
        onClose={() => setEditingPokemon(null)}
        pokemonName={editingPokemon?.name || ''}
        initialNote={editingPokemon?.note}
        onSave={handleSaveNote}
      />
      {/* --- HEADER ACTIONS TOOLBAR --- */}
      <div className="flex flex-col md:flex-row w-full gap-3 items-stretch justify-between mb-6 pt-4">
        {' '}
        {/* --- PROGRESS STATS --- */}
        {!isSelectionMode && !isEmpty && (
          <PokedexStatsHeader pokemons={allCaughtPokemons} className="flex-1 w-full md:w-auto" />
        )}
        <div className="flex w-full md:w-auto gap-3 items-center justify-end ml-auto">
          {' '}
          {/* EXPORT BUTTON (Hidden in Selection Mode) */}
          {!isSelectionMode && (
            <button
              onClick={() => downloadPokedexCSV(allCaughtPokemons)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 hover:text-red-600 transition-all h-[42px]"
              title="Export to CSV"
            >
              <FileDown size={18} />
              <span className="sm:hidden text-sm uppercase tracking-wider">CSV</span>
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
          {/* RELEASE TOGGLE BUTTON */}
          <button
            onClick={toggleSelectionMode}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all h-[42px] ${
              isSelectionMode
                ? 'bg-gray-800 text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-gray-50'
            }`}
          >
            {isSelectionMode ? <X size={18} /> : <BadgeX size={18} />}
            <span>{isSelectionMode ? 'Cancel' : 'Release'}</span>
          </button>
          {/* VIEW MODE TOGGLE (Grid vs Table) */}
          {!isSelectionMode && (
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 h-[42px]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-red-600' : 'text-gray-400'}`}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-red-600' : 'text-gray-400'}`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      {/* --- FILTERS --- */}
      {!isSelectionMode && (
        <PokedexFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      )}
      {/* --- BULK SELECTION INDICATOR --- */}
      {isSelectionMode && (
        <div className="bg-red-50 border border-red-100 text-red-800 px-4 py-3 rounded-lg mb-6 flex justify-between items-center animate-in slide-in-from-top-2">
          <span className="text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} /> Select Pokémon(s) to release
          </span>
          <button
            onClick={selectAll}
            className="text-xs font-bold uppercase tracking-wide underline hover:text-red-900"
          >
            {selectedIds.size === pokemons.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      )}
      {/* --- MAIN CONTENT (Conditional Rendering) --- */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500 pb-24">
          {pokemons.map((pokemon, index) => (
            <PokemonCard
              key={pokemon.id}
              // Adapter: We treat CaughtPokemon as Pokemon for the card display
              pokemon={pokemon as unknown as Pokemon}
              index={index}
              selectionMode={isSelectionMode}
              isSelected={selectedIds.has(pokemon.id)}
              onToggle={() => togglePokemonSelection(pokemon.id)}
              onEditNote={
                !isSelectionMode ? () => handleOpenNote(pokemon as unknown as Pokemon) : undefined
              }
            />
          ))}
          {pokemons.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No Pokémon found with these filters... 🕵️‍♂️
            </div>
          )}
        </div>
      ) : (
        <PokedexTableView
          pokemons={pokemons}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onToggle={togglePokemonSelection}
        />
      )}
      {/* --- FLOATING ACTION BAR (Mobile/Desktop) --- */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 w-[90%] max-w-md">
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between ring-4 ring-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 pl-2">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {selectedIds.size}
              </div>
              <span className="font-medium text-sm">Selected</span>
            </div>
            <button
              onClick={onReleaseClick}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg active:scale-95 transform"
            >
              <Trash2 size={18} /> Release
            </button>
          </div>
        </div>
      )}
      {/* --- FEEDBACK TOAST --- */}
      <div
        role="status"
        aria-live="polite"
        className={`
          fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]
          flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl
          bg-gray-900/95 backdrop-blur-sm text-white text-sm font-bold
          transition-all duration-300 transform border border-white/10
          ${
            showToast
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }
        `}
      >
        <CheckCircle2 size={18} className="text-green-400" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
