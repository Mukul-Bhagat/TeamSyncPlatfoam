const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.error || response.statusText, body.code);
  }
  return response.json();
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(path, API_BASE);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
      });
    }
    return fetch(url.toString()).then(handleResponse<T>);
  },

  post: <T>(path: string, body: unknown): Promise<T> => {
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  put: <T>(path: string, body: unknown): Promise<T> => {
    return fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  patch: <T>(path: string, body: unknown): Promise<T> => {
    return fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  del: <T>(path: string): Promise<T> => {
    return fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
    }).then(handleResponse<T>);
  },
};
