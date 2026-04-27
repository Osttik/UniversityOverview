import { HttpErrorResponse } from '@angular/common/http';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromHttpError(error: HttpErrorResponse): ApiError {
    const message = extractErrorMessage(error);
    return new ApiError(message, error.status, error.error);
  }
}

function extractErrorMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string' && error.error.trim().length > 0) {
    return error.error;
  }

  if (isMessagePayload(error.error)) {
    return error.error.message;
  }

  return error.message || 'Request failed';
}

function isMessagePayload(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}
