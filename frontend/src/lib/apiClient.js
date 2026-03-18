/**
 * apiClient.js — Shared axios factory with smart retry for Render cold starts.
 *
 * Creates pre-configured axios instances that:
 *  1. Auto-inject auth token from localStorage
 *  2. Retry on network errors and 5xx (NOT 400/401/403)
 *  3. Detect cold starts and update global serverStatus
 *  4. Use exponential backoff (2s → 4s, max 2 retries)
 *
 * Usage:
 *   const api = createApiClient({
 *     baseURL: 'https://api.example.com',
 *     tokenKey: 'token',          // localStorage key
 *   });
 */

import axios from 'axios';
import serverStatus from './serverStatus';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 2000; // 2 seconds
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds (accommodates Render cold start)
const COLD_START_THRESHOLD_MS = 8000; // if request takes >8s, likely a cold start

/**
 * Determines if a failed request should be retried.
 * Only retry for network errors and server errors (5xx).
 * Never retry client errors (4xx).
 */
function shouldRetry(error) {
  // Network error (no response at all — server unreachable)
  if (!error.response) return true;

  // Server errors (5xx) — backend crashed or is starting up
  const status = error.response.status;
  if (status >= 500) return true;

  // Client errors (400, 401, 403, 404) — don't retry
  return false;
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a pre-configured axios instance with retry logic and cold-start detection.
 *
 * @param {Object} options
 * @param {string} options.baseURL - API base URL
 * @param {string} [options.tokenKey='token'] - localStorage key for auth token
 * @returns {import('axios').AxiosInstance}
 */
export function createApiClient({ baseURL, tokenKey = 'token' }) {
  const instance = axios.create({
    baseURL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ─── Request Interceptor: inject auth token ───
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Stamp the start time for cold-start detection
    config.metadata = { startTime: Date.now() };
    return config;
  });

  // ─── Response Interceptor: cold-start detection + retry logic ───
  instance.interceptors.response.use(
    // SUCCESS — clear waking state
    (response) => {
      const duration = Date.now() - (response.config.metadata?.startTime || 0);

      // If the request took a long time, server was probably waking up
      if (duration > COLD_START_THRESHOLD_MS) {
        console.info(`[apiClient] Slow response (${duration}ms) — server was likely waking.`);
      }

      // Server is confirmed alive
      serverStatus.setWaking(false);
      return response;
    },
    // ERROR — retry logic
    async (error) => {
      const config = error.config;

      // Initialize retry state
      if (!config._retryCount) {
        config._retryCount = 0;
      }

      // Should we retry?
      if (shouldRetry(error) && config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;

        // Signal that server is likely waking up
        serverStatus.setWaking(true);
        serverStatus.setRetryCount(config._retryCount);

        const delay = BASE_DELAY_MS * Math.pow(2, config._retryCount - 1); // 2s, 4s
        console.warn(
          `[apiClient] Request failed (${error.message}). Retry ${config._retryCount}/${MAX_RETRIES} in ${delay}ms...`
        );

        await sleep(delay);

        // Retry the request
        return instance(config);
      }

      // All retries exhausted or non-retryable error
      serverStatus.setWaking(false);
      return Promise.reject(error);
    }
  );

  return instance;
}
