/**
 * @file NoteEditorModal.tsx
 * @description A modal dialog for editing personal notes on a Pokémon.
 *
 * ENGINEERING PRINCIPLE: Accessibility & Mobile Responsiveness
 *
 * UX IMPROVEMENTS:
 * 1. Focus Management: Uses `autoFocus` on the textarea.
 * 2. Mobile Typography: Uses `text-base` on mobile to prevent iOS Safari from zooming in (a common nuisance).
 * 3. Character Limit: Provides real-time feedback on character count (Length/Max).
 * 4. Backdrop: Clicking outside closes the modal.
 */

import { useState, useEffect } from 'react';
import { X, Save, FileEdit } from 'lucide-react';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonName: string;
  initialNote?: string;
  onSave: (note: string) => void;
}

const MAX_LENGTH = 200;

export const NoteEditorModal = ({
  isOpen,
  onClose,
  pokemonName,
  initialNote = '',
  onSave,
}: NoteEditorModalProps) => {
  const [note, setNote] = useState(initialNote);

  // Sync internal state when the modal opens or the prop changes
  useEffect(() => {
    setNote(initialNote || '');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop (Click to close) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all scale-100 p-4 md:p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-red-900">
            <div className="p-1.5 bg-red-50 rounded-lg">
              <FileEdit size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg leading-none">Trainer Notes</h3>
              <p className="text-[10px] md:text-xs text-gray-500 capitalize">For {pokemonName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Text Area */}
        <div className="relative mb-4">
          <textarea
            autoFocus
            value={note}
            maxLength={MAX_LENGTH}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Ex: Caught near the lake at night...`}
            // TRICK: text-base on mobile prevents iOS zoom, text-sm on desktop looks cleaner.
            className="w-full h-32 md:h-40 p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-gray-700 text-base md:text-sm leading-relaxed"
          />
          {/* Character Counter */}
          <div
            className={`absolute bottom-3 right-3 text-[10px] md:text-xs font-medium transition-colors ${
              note.length >= MAX_LENGTH ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {note.length} / {MAX_LENGTH}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 md:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-xs md:text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 md:px-6 md:py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-xs md:text-sm"
          >
            <Save size={14} className="md:w-4 md:h-4" />
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};
