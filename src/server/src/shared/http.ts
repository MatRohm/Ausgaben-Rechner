/**
 * An error that carries the HTTP status it should be reported with.
 * Application services and controllers throw these for expected, user-facing
 * failures.
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
