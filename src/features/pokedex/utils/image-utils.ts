/**
 * @file image-utils.ts
 * @description Utilities for handling image persistence.
 *
 * ENGINEERING PRINCIPLE: Offline-First & Asset Inlining
 * Normal URLs (https://...) require an internet connection to load.
 * To make the Pokedex truly offline, we must convert images into a string format (Base64)
 * that can be stored inside our IndexedDB.
 *
 * TRADE-OFF:
 * - Pros: Works offline, zero network requests after capture.
 * - Cons: Increases database size significantly (Base64 is ~33% larger than binary).
 * Given that Pokémon sprites are small pixel-art (low KB), this trade-off is acceptable.
 *
 * ENGINEERING DECISION: Native Fetch vs. Axios
 * We deliberately use the native `fetch` API here instead of the project's `axios` instance for three reasons:
 * 1. Cross-Origin Simplicity: The image URLs come from external CDNs (GitHub/PokeAPI), not our internal API.
 * Using our pre-configured Axios instance might erroneously prepend our API BaseURL.
 * 2. Native Binary Handling: `fetch` handles binary streams natively via `.blob()`.
 * Axios attempts to parse JSON by default and requires explicit `responseType: 'blob'` configuration.
 * 3. Zero Dependency: This keeps the utility function pure and portable, relying only on browser standards
 * rather than library-specific implementations.
 */

import { logger } from '../../../lib/logger';

export const convertImageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    // 1. FETCH BINARY DATA
    // We request the image as a 'Blob' (Binary Large Object).
    // Note: The server hosting the image must allow CORS for this to work.
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // 2. CONVERSION (FileReader API)
    // The FileReader API is event-based (older API). We wrap it in a Promise
    // to make it compatible with modern async/await patterns.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Success Handler
      reader.onloadend = () => {
        // The result is a string like: "data:image/png;base64,iVBORw0KGgo..."
        const base64String = reader.result as string;
        resolve(base64String);
      };

      // Error Handler
      reader.onerror = reject;

      // Trigger the read operation
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // RESILIENCE STRATEGY (Graceful Degradation)
    // If we can't convert the image (e.g., CORS error, Network offline during first capture),
    // we log the error but DO NOT crash the application.
    // We return the original URL instead. It won't work offline, but it works online.
    logger.error('Failed to convert image to offline format', error);
    return imageUrl;
  }
};
