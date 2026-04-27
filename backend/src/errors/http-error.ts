export type ErrorDetails = Record<string, unknown> | unknown[];

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetails;
  readonly expose: boolean;

  constructor(
    statusCode: number,
    message: string,
    options: { code?: string; details?: ErrorDetails; expose?: boolean } = {}
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = options.code ?? "HTTP_ERROR";
    this.details = options.details;
    this.expose = options.expose ?? statusCode < 500;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
