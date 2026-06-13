import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.error || response.statusText, body.code);
  }
  return response.json();
}

async function getHeaders(customHeaders: Record<string, string> = {}): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    ...customHeaders,
  };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Failed to resolve auth session token:', error);
  }

  return headers;
}

export const api = {
  get: async <T>(path: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(`${API_BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }
    const headers = await getHeaders();
    return fetch(url.toString(), { headers }).then(handleResponse<T>);
  },

  post: async <T>(path: string, body: unknown): Promise<T> => {
    const headers = await getHeaders({ 'Content-Type': 'application/json' });
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  put: async <T>(path: string, body: unknown): Promise<T> => {
    const headers = await getHeaders({ 'Content-Type': 'application/json' });
    return fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  patch: async <T>(path: string, body: unknown): Promise<T> => {
    const headers = await getHeaders({ 'Content-Type': 'application/json' });
    return fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  del: async <T>(path: string): Promise<T> => {
    const headers = await getHeaders();
    return fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers,
    }).then(handleResponse<T>);
  },
};
