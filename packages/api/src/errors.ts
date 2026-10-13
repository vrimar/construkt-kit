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

const ERROR_CODES = new Map([
  [300, "MULTIPLE_CHOICES"],
  [301, "MOVED_PERMANENTLY"],
  [302, "FOUND"],
  [303, "SEE_OTHER"],
  [304, "NOT_MODIFIED"],
  [305, "USE_PROXY"],
  [307, "TEMPORARY_REDIRECT"],
  [308, "PERMANENT_REDIRECT"],
  [400, "BAD_REQUEST"],
  [402, "PAYMENT_REQUIRED"],
  [403, "FORBIDDEN"],
  [405, "METHOD_NOT_ALLOWED"],
  [406, "NOT_ACCEPTABLE"],
  [407, "PROXY_AUTHENTICATION_REQUIRED"],
  [408, "REQUEST_TIMEOUT"],
  [409, "CONFLICT"],
  [410, "GONE"],
  [411, "LENGTH_REQUIRED"],
  [412, "PRECONDITION_FAILED"],
  [413, "CONTENT_TOO_LARGE"],
  [414, "URI_TOO_LONG"],
  [415, "UNSUPPORTED_MEDIA_TYPE"],
  [416, "RANGE_NOT_SATISFIABLE"],
  [417, "EXPECTATION_FAILED"],
  [421, "MISDIRECTED_REQUEST"],
  [426, "UPGRADE_REQUIRED"],
  [428, "PRECONDITION_REQUIRED"],
  [429, "TOO_MANY_REQUESTS"],
  [431, "REQUEST_HEADER_FIELDS_TOO_LARGE"],
  [451, "UNAVAILABLE_FOR_LEGAL_REASONS"],
  [500, "INTERNAL_SERVER_ERROR"],
  [501, "NOT_IMPLEMENTED"],
  [502, "BAD_GATEWAY"],
  [503, "SERVICE_UNAVAILABLE"],
  [504, "GATEWAY_TIMEOUT"],
  [505, "HTTP_VERSION_NOT_SUPPORTED"],
  [511, "NETWORK_AUTHENTICATION_REQUIRED"],
]);

/**
 * Maps a non-2xx status onto the narrowest error class available. Its `code` is the status's
 * registered reason phrase in screaming snake case (`409` → `CONFLICT`), or `HTTP_<status>`.
 */
export function toApiError(status: number, message: string): ApiError {
  switch (status) {
    case 401:
      return new UnauthorizedError(message);
    case 404:
      return new NotFoundError(message);
    case 422:
      return new ValidationError("VALIDATION_ERROR", message);
    default:
      return new ApiError(status, ERROR_CODES.get(status) ?? `HTTP_${status}`, message);
  }
}
