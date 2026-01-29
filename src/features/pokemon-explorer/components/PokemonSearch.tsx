/**
 * @file PokemonSearch.tsx
 * @description A reusable, controlled search input component.
 *
 * ENGINEERING PRINCIPLE: Controlled Component (Stateless UI)
 * This component follows the "Lifted State" philosophy. It has zero internal state.
 * - Source of Truth: The parent component (ExplorePage) via the `value` prop.
 * - State Updates: Delegated to the parent via the `onChange` callback.
 *
 * UX/UI DECISIONS:
 * 1. Immediate Feedback: Visual states (focus rings, shadows) provide tactile response.
 * 2. Accessibility (A11y): High contrast text and clear tap targets for mobile users.
 * 3. Conditional Actions: The "Clear" (X) button only renders when needed to reduce visual noise.
 */

import { Search, X } from 'lucide-react';

interface PokemonSearchProps {
  /** The current value of the search input (driven by parent state). */
  value: string;
  /** Callback fired synchronously on every keystroke. */
  onChange: (newValue: string) => void;
}

export const PokemonSearch = ({ value, onChange }: PokemonSearchProps) => {
  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      {/* WRAPPER: Relative positioning allows us to float icons inside the input box */}
      <div className="relative">
        {/* ICON: DECORATIVE
            We use `pointer-events-none` so clicks pass through to the input field behind it.
            This ensures the user can focus the input by clicking anywhere on the left side. */}
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={22}
          aria-hidden="true"
        />

        <input
          type="text"
          placeholder="Search Pokémon..."
          value={value}
          // REACTIVITY:
          // We broadcast the change immediately. Debouncing is handled by the hook/parent
          // if necessary, but for UI responsiveness, we keep this synchronous.
          onChange={(e) => onChange(e.target.value)}
          // STYLING STRATEGY:
          // - `pl-12`: Padding Left prevents text from overlapping the Search Icon.
          // - `appearance-none`: Removes native browser styling (crucial for iOS Safari shadow bugs).
          // - `focus:ring`: Custom focus ring matches the brand color (Red-500) for consistency.
          className="w-full pl-12 pr-10 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-red-500 appearance-none text-lg text-gray-900 shadow-sm transition-colors duration-200"
          aria-label="Search for a Pokémon"
        />

        {/* ACTION: CLEAR BUTTON
            Conditionally rendered to keep the UI clean. Only appears when there is text to clear. */}
        {value.length > 0 && (
          <button
            onClick={() => onChange('')}
            // ACCESSIBILITY:
            // Large touch target (p-2) ensures easy interaction on mobile devices.
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 active:text-red-700 transition-colors"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
