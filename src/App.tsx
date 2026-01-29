/**
 * @file App.tsx
 * @description The Root Component and Provider Composer.
 *
 * ENGINEERING PRINCIPLE: Composition Root
 * This file is responsible for assembling the application's "dependency graph":
 * 1. Global Providers (State, Cache, Routing).
 * 2. Layout Structure (Navbar + Content).
 * 3. App Initialization (Bootstrapping the Database).
 *
 * It should NOT contain implementation details (like Button styles or API configs).
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

// Infrastructure & Config
import { queryClient } from './lib/react-query';
import { usePokedexStore } from './features/pokedex/store/pokedex.store';
import { logger } from './lib/logger';

// Layout & UI
import { Navbar } from './layout/Navbar';
import { ScrollToTop } from './layout/ScrollToTop';

// Pages
import { ExplorePage } from './features/pokemon-explorer/pages/ExplorePage';
import { MyPokedexPage } from './features/pokedex/pages/MyPokedexPage';
import { PokemonDetailsPage } from './features/pokemon-details/components/PokemonDetailsPage';

/**
 * Content Wrapper
 * Separated to keep the DOM structure clear and distinct from the Provider logic.
 */
const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/pokedex" element={<MyPokedexPage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailsPage />} />
        </Routes>
      </div>
    </div>
  );
};

/**
 * Main Application Component
 */
export default function App() {
  const initialize = usePokedexStore((s) => s.initialize);

  // BOOTSTRAP LOGIC
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initialize();
        logger.info('App initialized: Database connected');
      } catch (error) {
        // Graceful degradation: The app opens, but local DB features might fail.
        logger.error('CRITICAL: Failed to initialize database', error);
      }
    };

    initializeApp();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
