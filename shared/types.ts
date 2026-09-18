/**
 * Types shared by /web and /api. Types only — no runtime logic lives here.
 *
 * Every API response uses this envelope. Routes call ok()/fail() in the api;
 * the web client narrows on `success`.
 */
export interface ApiError {
  code: string;
  message: string;
}

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiError };
