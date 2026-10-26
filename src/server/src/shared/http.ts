import type { Response } from 'express';

/**
 * An error that carries the HTTP status it should be reported with.
 * Application services throw these for expected, user-facing failures.
 */
export class AppError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Map a thrown error to an HTTP response. Expected service failures keep their
 * status; unexpected errors fall back to `fallbackStatus` (400 by default).
 */
export function sendError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
  fallbackStatus = 400,
): void {
  if (error instanceof AppError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  res.status(fallbackStatus).json({ error: fallbackMessage });
}
