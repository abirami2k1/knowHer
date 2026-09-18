/**
 * Throw this from routes/services for expected failures. The error middleware
 * turns it into the { success:false, error:{ code, message } } envelope with the
 * given HTTP status. Anything else thrown becomes a generic 500 with no details.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
