export interface ApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? defaultBaseUrl;

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.defaultHeaders,
        ...init.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(response.statusText || 'API request failed', response.status, payload);
    }

    return payload as T;
  }

  return {
    get<T>(path: string, init?: RequestInit) {
      return request<T>(path, { ...init, method: 'GET' });
    },
    post<T>(path: string, body: unknown, init?: RequestInit) {
      return request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) });
    },
    put<T>(path: string, body: unknown, init?: RequestInit) {
      return request<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) });
    },
    delete<T>(path: string, init?: RequestInit) {
      return request<T>(path, { ...init, method: 'DELETE' });
    },
  };
}

export const apiClient = createApiClient();
