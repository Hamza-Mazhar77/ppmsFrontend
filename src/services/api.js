/**
 * Centralised Axios client
 * `withCredentials` is on because the session JWT lives in an httpOnly cookie -
 * the token is never written to localStorage, so it cannot be read by injected
 * script. Every response error is normalised into a single shape so callers can
 * rely on `error.message` and `error.fieldErrors`.
 */
import axios from 'axios';

/**
 * Base URL. Empty by default so requests go to /api on the same origin
 * (the Vite dev proxy in development, the same host in a unified deployment).
 * Set VITE_API_BASE_URL when the API is on a different domain.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL + '/api',
  withCredentials: true,
  timeout: 30000,
});

/** Build an absolute URL for a file endpoint (used by <iframe> and downloads). */
export const fileUrl = (path) => API_BASE_URL + '/api' + path;

/**
 * Error normaliser.
 * @returns {{message: string, status: number|null, fieldErrors: Record<string,string>}}
 */
function normaliseError(error) {
  if (error.response) {
    const { status, data } = error.response;
    const fieldErrors = {};
    (data?.errors || []).forEach((item) => {
      if (item.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message;
    });
    return {
      message: data?.message || 'Something went wrong. Please try again.',
      status,
      fieldErrors,
    };
  }
  if (error.code === 'ECONNABORTED') {
    return { message: 'The request timed out. Please check your connection and try again.', status: null, fieldErrors: {} };
  }
  return {
    message: 'Unable to reach the PPMS server. Please check your connection.',
    status: null,
    fieldErrors: {},
  };
}

// Listeners notified when the server reports an expired/invalid session.
const unauthorizedListeners = new Set();

/** Register a callback fired on a 401 from any endpoint (except /auth/me). */
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalised = normaliseError(error);
    const url = error.config?.url || '';

    // A 401 on /auth/me is expected on first load for an anonymous visitor and
    // must not trigger a "session expired" notice.
    if (normalised.status === 401 && !url.includes('/auth/me')) {
      unauthorizedListeners.forEach((listener) => listener(normalised));
    }

    return Promise.reject(normalised);
  }
);

export default api;
