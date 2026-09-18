import type { ApiError, ApiResponse } from '@shared/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type AccessTokenProvider = () => Promise<string | null>;
let accessTokenProvider: AccessTokenProvider | null = null;

/** Registered by AuthProvider. Called before every request so tokens are always fresh. */
export function setAccessTokenProvider(provider: AccessTokenProvider | null): void {
  accessTokenProvider = provider;
}

/** Thrown when the API answers with { success:false } or cannot be reached. */
export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Thin typed fetch wrapper. Unwraps the { success, data, error } envelope so
 * callers get `T` or a thrown ApiClientError. Attaches the Cognito access token
 * as a Bearer header whenever a session exists.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = accessTokenProvider ? await accessTokenProvider() : null;
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiClientError('network_error', 'Could not reach the knowHer API', 0);
  }

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      'bad_response',
      'The API sent an unreadable response',
      response.status,
    );
  }

  if (!body.success) {
    const error: ApiError = body.error;
    throw new ApiClientError(error.code, error.message, response.status);
  }
  return body.data;
}
