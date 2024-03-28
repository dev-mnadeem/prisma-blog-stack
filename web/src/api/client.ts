import axios, { AxiosError, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

export const AUTH_COOKIE = 'authtoken';
const DEFAULT_API_URL = 'http://localhost:7231/api';

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Read the cookie per request. Baking it into the instance headers at module
 * load means a token obtained after the first import is never sent.
 */
api.interceptors.request.use((config) => {
  const token = Cookies.get(AUTH_COOKIE);
  if (token) {
    config.headers.set(AUTH_COOKIE, token);
  }
  return config;
});

interface ApiErrorBody {
  message?: string;
}

/** Turns any axios failure into the message the API actually sent, if it sent one. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) {
      return body.message;
    }
    if (!error.response) {
      return 'Cannot reach the API. Is the server running?';
    }
  }
  return fallback;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}
