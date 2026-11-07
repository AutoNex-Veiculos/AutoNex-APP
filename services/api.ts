import axios, { AxiosError } from 'axios';
import { storage, TOKEN_KEY } from '@/storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const api = axios.create({ baseURL: API_URL, timeout: 15_000 });

let onUnauthorized: (() => void) | null = null;

// Evita import circular com a store: o layout raiz registra o handler.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.request.use(async (config) => {
  const token = await storage.get(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) onUnauthorized?.();
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (!error.response) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    return 'Algo deu errado. Tente novamente.';
  }
  if (error instanceof Error) return error.message;
  return 'Algo deu errado. Tente novamente.';
}
