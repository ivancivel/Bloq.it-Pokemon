/**
 * @file logger.ts
 * @description Centralized logging utility for the application.
 *
 * ENGINEERING PRINCIPLE: Abstraction & Observability
 * Direct use of `console.log` is discouraged in enterprise applications.
 * By using this facade, we ensure:
 * 1. Environment Control: Logs can be silenced in production to optimize performance and security.
 * 2. Maintainability: Provides a single point of integration for future APM tools (e.g., Sentry, Datadog).
 * 3. Standardization: Enforces a consistent logging structure across the codebase.
 */

// Configuration constant to toggle logs.
// In a CI/CD pipeline, this should be linked to `import.meta.env.DEV` or a specific env variable.
const IS_DEBUG_MODE = true;

export const logger = {
  /**
   * Logs informational messages for debugging purposes.
   * Only active when debug mode is enabled to reduce console noise in production.
   *
   * @param message - The primary message to log.
   * @param args - Additional data structures or context to log.
   */
  info: (message: string, ...args: any[]) => {
    if (IS_DEBUG_MODE) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Logs non-critical warnings that should be addressed but don't stop execution.
   * Uses `console.warn` to provide visual distinction (yellow highlight) in browser dev tools.
   *
   * @param message - The warning message.
   * @param args - Additional context.
   */
  warn: (message: string, ...args: any[]) => {
    if (IS_DEBUG_MODE) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  },

  /**
   * Logs critical errors.
   * Unlike info/warn, errors are NOT suppressed in production as they are critical for
   * diagnosing runtime failures.
   *
   * Scalability Note: This is where we would hook into an external error tracking service.
   *
   * @param message - A description of what went wrong.
   * @param error - The actual error object or stack trace.
   */
  error: (message: string, error?: any) => {
    console.error(`🚨 [ERROR] ${message}`, error);
  },
};
