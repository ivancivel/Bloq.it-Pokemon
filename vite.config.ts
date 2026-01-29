/**
 * @file vite.config.ts
 * @description Vite Configuration for React + TypeScript.
 *
 * ENGINEERING PRINCIPLE: Build Tooling & Developer Experience (DX)
 *
 * This configuration file handles:
 * 1. Plugin Integration: Sets up the React plugin for Fast Refresh (HMR).
 * 2. Path Aliases: Maps '@' to the '/src' directory, allowing for clean imports
 * (e.g., "import Button from '@/components/Button'") instead of fragile relative paths
 * (e.g., "../../../components/Button").
 * 3. Network Exposure: Configures the dev server to be accessible via network (host: true),
 * crucial for testing on mobile devices in the same Wi-Fi.
 *
 * NOTE ON ESM (ECMAScript Modules):
 * Since this project runs as a module (type: "module" in package.json), the global variable
 * '__dirname' is not available natively in Node.js. We reconstruct it using 'import.meta.url'
 * to ensure path resolution works correctly across different environments.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ESM COMPATIBILITY FIX ---
// Reconstruct __dirname for ES Modules environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Maps '@' imports to the 'src' directory
      // Matches the "paths" configuration in tsconfig.json
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Exposes the server to the local network (allows testing on iPhone/Android)
    host: true,
    port: 5173,
  },
});
