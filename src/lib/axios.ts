/**
 * @file axios.ts
 * @description Global HTTP Client configuration using Axios.
 *
 * ENGINEERING PRINCIPLE: Singleton Pattern & Cross-Cutting Concerns
 * Instead of using 'fetch' directly in components or creating multiple axios instances,
 * we export a single, pre-configured instance.
 *
 * Benefits:
 * 1. Consistency: Base URL and Timeouts are defined once.
 * 2. Error Handling: Global interceptors catch errors before they reach the UI.
 * 3. Observability: Automatic logging of all outgoing requests and incoming errors.
 */

import axios from 'axios';
import { logger } from './logger';

/**
 * The main API client instance.
 * Configured with the PokéAPI base URL and reasonable defaults.
 */
export const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  // Timeout is critical for UX. If the API hangs, we want to fail fast (10s)
  // rather than keeping the user waiting indefinitely.
  timeout: 10000,
});

// --- INTERCEPTORS ---

/**
 * Request Interceptor
 * Runs before every request is sent to the network.
 *
 * Use Case: Logging, attaching Auth tokens (if needed in future), or modifying headers.
 */
api.interceptors.request.use((config) => {
  // LOGGING REQUIREMENT: We log the outgoing request method and URL.
  // This is crucial for debugging to see exactly what the app is requesting.
  const method = config.method?.toUpperCase() || 'UNKNOWN';
  const url = config.url || '';

  logger.info(`[API Request] ${method} ${url}`);

  return config;
});

/**
 * Response Interceptor
 * Runs after every response is received from the network.
 *
 * Use Case: Global error logging, automatic token refresh, or response data transformation.
 */
api.interceptors.response.use(
  (response) => {
    // We could log successes here, but it might be too noisy for production.
    // logger.info(`[API Success] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // LOGGING REQUIREMENT: Centralized Error Logging.
    // We catch the error here to log it with our standardized logger before propagating it.
    // This ensures no API failure goes unnoticed in our logs / Sentry.
    const url = error.config?.url || 'Unknown URL';
    const message = error.message || 'Unknown Error';

    logger.error(`[API Error] ${url}`, message);

    // Propagate the error so React Query can handle the 'isError' state in the UI.
    return Promise.reject(error);
  }
);
