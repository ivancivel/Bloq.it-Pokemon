/**
 * @file PokeballIcons.tsx
 * @description SVG Icon components for the Catch Button states.
 *
 * ENGINEERING PRINCIPLE: Inline SVG Assets (Iconography Strategy)
 * Instead of fetching external image files (.svg/.png), we inline the SVG paths directly as React components.
 *
 * BENEFITS:
 * 1. Zero Network Latency: Icons render instantly with the JavaScript bundle.
 * 2. Dynamic Styling: We can manipulate colors (fill/stroke) and opacity using CSS classes
 * via the 'className' prop, which is impossible with static <img> tags.
 * 3. Accessibility: Pure SVGs scale infinitely without pixelation (critical for Retina/High-DPI screens).
 */

interface IconProps {
  /** Optional Tailwind classes for sizing and coloring */
  className?: string;
}

/**
 * Represents the "Caught" state (Active).
 * A colored, solid Pokéball indicating possession.
 */
export const ClosedPokeballIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    // Accessibility: Mark as decorative since the button label handles the text description
    aria-hidden="true"
  >
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      fill="white"
      stroke="#374151"
      strokeWidth="2"
    />
    <path
      d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12H2Z"
      fill="#EF4444"
      stroke="#374151"
      strokeWidth="2"
    />
    {/* Shine effect (Opacity 0.3) for depth */}
    <ellipse cx="7" cy="5" rx="2.5" ry="2" transform="rotate(-45 9 4)" fill="white" opacity="0.3" />
    <path d="M2 12H22" stroke="#374151" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="#F5F5DC" stroke="#374151" strokeWidth="2" />
    <circle cx="12" cy="12" r="1.5" fill="#F5F5DC" stroke="#9CA3AF" strokeWidth="1" />
  </svg>
);

/**
 * Represents the "Uncaught" state (Inactive).
 * An outlined, grayscale Pokéball inviting interaction.
 */
export const OpenPokeballIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Ghost path for hover effect area */}
      <path
        d="M12 22C16.5 22 21 18 21 13C21 8 16.5 4 12 4C7.5 4 3 8 3 13C3 18 7.5 22 12 22Z"
        fill="#374151"
        stroke="none"
        opacity="0.15"
      />
      {/* Mechanical parts of the open ball */}
      <rect x="10" y="12" width="4" height="2" rx="0.5" fill="#9CA3AF" stroke="none" />
      <path d="M3 14C3 18.5 7 22 12 22C17 22 21 18.5 21 14" fill="#F3F4F6" />
      <path d="M3 14C7 15.2 17 15.2 21 14" fill="#F3F4F6" />
      <path d="M21 10C21 5.5 17 2 12 2C7 2 3 5.5 3 10" fill="#F3F4F6" />
      <path d="M3 10C7 8.8 17 8.8 21 10" fill="#F3F4F6" />
      {/* Glint/Reflection */}
      <path
        d="M7 6C8 5 10 4 12 4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path d="M9.5 14.2C9.5 15.2 10.6 16 12 16C13.4 16 14.5 15.2 14.5 14.2" fill="white" />
      <path d="M9.5 9.8C9.5 8.8 10.6 8 12 8C13.4 8 14.5 8.8 14.5 9.8" fill="white" />
    </g>
  </svg>
);
