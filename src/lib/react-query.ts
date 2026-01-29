import { QueryClient } from '@tanstack/react-query';

/**
 * @file react-query.ts
 * @description Global configuration for server-state management.
 * * SETTINGS RATIONALE:
 * - staleTime: 5 minutes. We treat Pokémon data as highly static.
 * Frequent refetches waste bandwidth and battery.
 * - retry: 2. If it fails twice, it's likely a real network issue, not a blip.
 * - refetchOnWindowFocus: False. Prevents jarring UI updates when switching tabs.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
