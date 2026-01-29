// @vitest-environment jsdom
/**
 * @file image-utils.test.ts
 * @description Unit tests for image persistence utilities.
 *
 * TEST STRATEGY:
 * This utility relies on browser APIs (fetch, FileReader) that are slow or unavailable in tests.
 * We mock these APIs to:
 * 1. Simulate a successful image conversion (Base64).
 * 2. Simulate network failures to ensure the app doesn't crash (Graceful Degradation).
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { convertImageUrlToBase64 } from './image-utils';
import { logger } from '../../../lib/logger';

// 1. MOCK LOGGER
// We spy on the logger to ensure errors are recorded without polluting the console.
vi.mock('../../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('Image Utils (Base64 Conversion)', () => {
  const mockUrl = 'https://example.com/pikachu.png';
  const mockBase64Result = 'data:image/png;base64,fake-content';

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset global fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully convert an image URL to Base64', async () => {
    // ARRANGE

    // A. Mock Fetch: Return a fake Blob
    const mockBlob = new Blob(['fake-binary-data'], { type: 'image/png' });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      blob: async () => mockBlob,
    });

    // B. Mock FileReader: The tricky part!
    // We create a class that simulates the browser's FileReader behavior.
    const MockFileReader = class {
      result = '';
      onloadend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL(_blob: Blob) {
        // Simulate async success immediately
        this.result = mockBase64Result;
        if (this.onloadend) {
          this.onloadend();
        }
      }
    };

    // Replace the global FileReader with our Mock
    vi.stubGlobal('FileReader', MockFileReader);

    // ACT
    const result = await convertImageUrlToBase64(mockUrl);

    // ASSERT
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    expect(result).toBe(mockBase64Result);
  });

  it('should gracefully handle errors and return the original URL (Resilience)', async () => {
    // ARRANGE
    // Simulate a Network Error (e.g., Offline)
    (global.fetch as Mock).mockRejectedValue(new Error('Network Error'));

    // ACT
    const result = await convertImageUrlToBase64(mockUrl);

    // ASSERT
    // 1. Check if the error was logged
    expect(logger.error).toHaveBeenCalled();

    // 2. CRITICAL: Ensure the function returns the original URL instead of crashing
    // This allows the app to display the image via standard <img> tag if offline storage fails.
    expect(result).toBe(mockUrl);
  });
});
