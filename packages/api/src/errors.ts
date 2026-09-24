/** A non-2xx body: an RFC 9457 problem document, or a legacy `{ Message }` body. */
export interface ApiErrorResponse {
  detail?: string;
  title?: string;
  Message?: string;
}

/** The first non-empty of `detail`, `title` and `Message`; undefined for any other body. */
export function toErrorMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;

  const { detail, title, Message } = body as ApiErrorResponse;
  return [detail, title, Message].find((message) => typeof message === "string" && message !== "");
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(code: string, message: string) {
    super(422, code, message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, "NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

/** `"Internal Server Error"` → `"INTERNAL_SERVER_ERROR"`; falls back to the status. */
function toErrorCode(status: number, statusText: string): string {
  return (
    statusText
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_") || `HTTP_${status}`
  );
}

/** Maps a non-2xx response onto the narrowest error class available. */
export function toApiError(status: number, statusText: string, message: string): ApiError {
  switch (status) {
    case 401:
      return new UnauthorizedError(message);
    case 404:
      return new NotFoundError(message);
    case 422:
      return new ValidationError("VALIDATION_ERROR", message);
    default:
      return new ApiError(status, toErrorCode(status, statusText), message);
  }
}
