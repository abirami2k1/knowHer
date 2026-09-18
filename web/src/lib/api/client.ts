import type { ApiError, ApiResponse } from '@shared/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
 * callers get `T` or a thrown ApiClientError. The Cognito token is attached here in Task 3.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
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
