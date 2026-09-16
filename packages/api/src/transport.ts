const EMPTY_STATUSES = new Set([204, 205, 304]);

export interface ApiRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  credentials?: "omit" | "same-origin" | "include";
  options?: RequestInit & { next?: Record<string, unknown> };
  responseType?: string;
}

export interface ApiTransportResult {
  data: unknown;
  status: number;
  statusText: string;
  headers: Headers;
  contentType?: string;
  request: Request;
  response: Response;
}

export type ApiTransport = (request: ApiRequest) => Promise<ApiTransportResult>;

function mediaTypeOf(contentType: string | null): string {
  return (contentType ?? "").split(";")[0].trim().toLowerCase();
}

function parseJson(body: string): unknown {
  if (!body) return undefined;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

async function readBody(
  response: Response,
  responseType: string | undefined,
  mediaType: string,
): Promise<unknown> {
  if (EMPTY_STATUSES.has(response.status) || !response.body) return undefined;

  switch (responseType) {
    case "blob":
      return response.blob();
    case "arraybuffer":
      return response.arrayBuffer();
    case "stream":
      return response.body;
    case "text":
    case "document":
      return response.text();
    case "json":
      return parseJson(await response.text());
  }

  if (mediaType.includes("json")) return parseJson(await response.text());
  if (mediaType === "text/event-stream") return response.body;
  if (mediaType.startsWith("text/")) return (await response.text()) || undefined;
  // Office and other binary media types, which the Kubb runtime would decode as text.
  if (mediaType) return response.blob();

  return parseJson(await response.text());
}

export const fetchTransport: ApiTransport = async (request) => {
  const init: RequestInit = {
    ...request.options,
    method: request.method,
    headers: request.headers,
    body: request.body as BodyInit | undefined,
  };
  if (request.signal) init.signal = request.signal;
  if (request.credentials) init.credentials = request.credentials;

  const nativeRequest = new Request(request.url, init);
  // `next` is not a Request member, so it only reaches Next.js's patched fetch through init.
  const nextInit = request.options?.next && ({ next: request.options.next } as RequestInit);
  const response = await fetch(nativeRequest, nextInit || undefined);
  const mediaType = mediaTypeOf(response.headers.get("Content-Type"));

  return {
    data: await readBody(response, request.responseType, mediaType),
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    contentType: mediaType || undefined,
    request: nativeRequest,
    response,
  };
};
