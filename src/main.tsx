/**
 * @file main.tsx
 * @description The Application Bootstrapper / Entry Point.
 *
 * ENGINEERING PRINCIPLE: Separation of Initialization vs. Application Logic
 * This file has a Single Responsibility: Mounting the React tree into the DOM.
 *
 * Architectural Decision:
 * You might notice the absence of Global Providers (QueryClient, Contexts) here.
 * We deliberately moved them to `App.tsx`.
 *
 * Benefit:
 * - Testability: We can test the `App` component in isolation without mocking `main.tsx`.
 * - Clarity: `main.tsx` is purely for DOM integration; `App.tsx` is for React composition.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Mounts the React application to the DOM.
 *
 * The non-null assertion (!) after getElementById is safe here because
 * 'root' is guaranteed to exist in the underlying index.html template.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  /**
   * React.StrictMode is a development-only tool.
   * It intentionally double-invokes effects/renders to help detect:
   * 1. Unsafe side effects.
   * 2. Deprecated API usage.
   * 3. Unexpected state mutations.
   *
   * Note: This double-invocation does NOT happen in the production build.
   */
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
