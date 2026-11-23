import { toApiError, toErrorMessage } from "./errors";

const FALLBACK_ERROR_MESSAGE = "An error has occurred.";
const AUTHORIZATION_HEADER = "Authorization";

interface InterceptorStack<T, TResult = T> {
  use: (fn: (value: T) => TResult | Promise<TResult>) => number;
  eject: (id: number) => void;
}

interface ClientRequest {
  headers: Record<string, string>;
}

interface ResponseErrorShape extends Error {
  status: number;
  data: unknown;
}

type QuerySerializer<TStyle> = (
  params: Record<string, unknown>,
  styles?: Record<string, TStyle>,
) => string;

interface ClientConfigSlice<TStyle> {
  baseURL?: string;
  serializer?: { query?: QuerySerializer<TStyle> };
}

/** The slice of the generated Kubb client this package drives. */
export interface ApiClient<TRequest extends ClientRequest = ClientRequest, TStyle = unknown> {
  getConfig: () => ClientConfigSlice<TStyle>;
  setConfig: (config: ClientConfigSlice<TStyle>) => unknown;
  interceptors: {
    request: InterceptorStack<TRequest>;
    error: InterceptorStack<Error, Error | void>;
  };
}

export interface ConfigureApiClientOptions {
  baseURL: string;
  /** Read on every request; an auth SDK's async `getToken` can be passed as it is. */
  getToken: () => string | null | undefined | Promise<string | null | undefined>;
}

function isResponseError(error: Error): error is ResponseErrorShape {
  return error.name === "ResponseError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)
  );
}

function appendBracketed(search: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    for (const item of value) appendBracketed(search, key, item);
    return;
  }
  if (isRecord(value)) {
    for (const [prop, item] of Object.entries(value))
      appendBracketed(search, `${key}[${prop}]`, item);
    return;
  }
  if (value instanceof Date) search.append(key, value.toISOString());
  else if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    search.append(key, String(value));
  }
}

function bracketUnstyledObjects<TStyle>(
  next: QuerySerializer<TStyle> | undefined,
): QuerySerializer<TStyle> {
  return (params, styles) =>
    Object.entries(params)
      .map(([key, value]) => {
        if (next && (styles?.[key] !== undefined || !isRecord(value))) {
          return next({ [key]: value }, styles);
        }
        const search = new URLSearchParams();
        appendBracketed(search, key, value);
        return search.toString().replaceAll("+", "%20");
      })
      .filter(Boolean)
      .join("&");
}

/**
 * Points the generated Kubb client at an API: base URL, Bearer token per request, and non-2xx
 * responses raised as `ApiError` subclasses. Other failures pass through unchanged. An object
 * query parameter the spec gives no `style` goes out as `key[prop]=value`, arrays repeating
 * the key, as ASP.NET and `buildQueryString` read it; a styled one follows its style.
 *
 * @returns a disposer that removes the interceptors and the query serializer it registered.
 */
export function configureApiClient<TRequest extends ClientRequest, TStyle>(
  client: ApiClient<TRequest, TStyle>,
  { baseURL, getToken }: ConfigureApiClientOptions,
): () => void {
  const query = client.getConfig().serializer?.query;
  client.setConfig({
    baseURL: baseURL.replace(/\/+$/, ""),
    serializer: { query: bracketUnstyledObjects(query) },
  });

  const requestInterceptor = client.interceptors.request.use(async (request) => {
    const token = await getToken();
    for (const key of Object.keys(request.headers)) {
      if (key.toLowerCase() === AUTHORIZATION_HEADER.toLowerCase()) delete request.headers[key];
    }
    if (token) request.headers[AUTHORIZATION_HEADER] = `Bearer ${token}`;

    return request;
  });

  const errorInterceptor = client.interceptors.error.use((error) =>
    isResponseError(error)
      ? toApiError(error.status, toErrorMessage(error.data) ?? FALLBACK_ERROR_MESSAGE)
      : undefined,
  );

  return () => {
    client.interceptors.request.eject(requestInterceptor);
    client.interceptors.error.eject(errorInterceptor);
    client.setConfig({ serializer: { query } });
  };
}
