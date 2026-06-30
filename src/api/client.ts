import axios from 'axios';

import { API_BASE_URL } from './config';

// In-memory token store (the source of truth for requests). AuthContext keeps
// these in sync with SecureStore.
let accessToken: string | null = null;
let refreshToken: string | null = null;
let onAuthFail: (() => void) | null = null;

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
}

export function setOnAuthFail(fn: () => void) {
  onAuthFail = fn;
}

/** Current access token (used for authenticated file downloads). */
export function getAccessToken(): string | null {
  return accessToken;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    accessToken = res.data.access_token;
    return accessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      refreshToken
    ) {
      original._retry = true;
      if (!refreshing) {
        refreshing = doRefresh().finally(() => {
          refreshing = null;
        });
      }
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      onAuthFail?.();
    }
    return Promise.reject(error);
  }
);

/** Extract a human-friendly message from an axios error. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length) {
      // FastAPI validation errors
      const first = detail[0];
      return first?.msg ? `${first.msg}` : 'Validation error';
    }
    if (error.code === 'ECONNABORTED') return 'Request timed out. Is the server running?';
    if (!error.response) return 'Cannot reach the server. Check the API address and Wi-Fi.';
    return `Request failed (${error.response.status})`;
  }
  return 'Something went wrong';
}
