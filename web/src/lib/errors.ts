import { ApiClientError } from '@/lib/api/client';

/**
 * One sentence to show her when something fails. The API's own messages are
 * written for her and pass through unchanged; everything else gets a warm
 * fallback rather than whatever a library happened to throw.
 */
export function friendlyError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.code === 'network_error') {
      return "Couldn't reach knowHer. Check your connection and try again.";
    }
    if (error.code === 'bad_response' || error.code === 'internal_error') {
      return 'Something went wrong on our side. Please try again in a moment.';
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
