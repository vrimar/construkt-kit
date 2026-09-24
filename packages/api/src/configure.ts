import { toApiError, toErrorMessage } from "./errors";
import type { ApiRequest, ApiTransport } from "./transport";
import { fetchTransport } from "./transport";

const FALLBACK_ERROR_MESSAGE = "An error has occurred.";
const AUTHORIZATION_HEADER = "Authorization";

export interface ApiResponseError {
  status: number;
  statusText: string;
  data: unknown;
}

interface InterceptorStack<T> {
  use: (fn: (value: T) => T | Promise<T>) => number;
  eject: (id: number) => void;
}

/** The slice of the generated Kubb client this package drives. */
export interface ApiClient<
  TRequest extends ApiRequest = ApiRequest,
  TError extends ApiResponseError = ApiResponseError,
> {
  setConfig: (config: { baseURL?: string; transport?: ApiTransport }) => unknown;
  interceptors: {
    request: InterceptorStack<TRequest>;
    error: InterceptorStack<TError>;
  };
}

export interface ConfigureApiClientOptions {
  baseURL: string;
  getToken: () => string | null | undefined;
  transport?: ApiTransport;
}

/**
 * Points the generated Kubb client at an API: base URL, transport, Bearer token per request,
 * and non-2xx responses raised as `ApiError` subclasses.
 *
 * @returns a disposer that removes the interceptors it registered.
 */
export function configureApiClient<TRequest extends ApiRequest, TError extends ApiResponseError>(
  client: ApiClient<TRequest, TError>,
  { baseURL, getToken, transport = fetchTransport }: ConfigureApiClientOptions,
): () => void {
  client.setConfig({ baseURL, transport });

  const requestInterceptor = client.interceptors.request.use((request) => {
    const token = getToken();
    for (const key of Object.keys(request.headers)) {
      if (key.toLowerCase() === AUTHORIZATION_HEADER.toLowerCase()) delete request.headers[key];
    }
    if (token) request.headers[AUTHORIZATION_HEADER] = `Bearer ${token}`;

    return request;
  });

  const errorInterceptor = client.interceptors.error.use((error) => {
    throw toApiError(
      error.status,
      error.statusText,
      toErrorMessage(error.data) ?? FALLBACK_ERROR_MESSAGE,
    );
  });

  return () => {
    client.interceptors.request.eject(requestInterceptor);
    client.interceptors.error.eject(errorInterceptor);
  };
}
