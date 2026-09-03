import type {
  Client,
  RequestConfig,
  ResponseConfig,
  ResponseErrorConfig,
} from "@kubb/plugin-client/clients/fetch";
import { getConfig, client as kubbClient } from "@kubb/plugin-client/clients/fetch";

import { toApiError } from "./errors";
import type { ApiErrorResponse } from "./errors";

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig };

const FORM_MEDIA_TYPE = "application/x-www-form-urlencoded";
const JSON_MEDIA_TYPE = "application/json";

function stringifyParam(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return value.toString();
  }
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value, jsonReplacer) ?? "";
}

function jsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

function appendParam(target: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined) return;
  const items = Array.isArray(value) ? value : [value];
  items.forEach((item: unknown) => {
    if (item !== undefined) target.append(key, stringifyParam(item));
  });
}

function toSearchParams(params: unknown): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries((params as Record<string, unknown>) ?? {}).forEach(([key, value]) =>
    appendParam(searchParams, key, value),
  );
  return searchParams;
}

function mediaTypeOf(contentType: string | null): string {
  return (contentType ?? "").split(";")[0].trim().toLowerCase();
}

function layerHeaders(target: Headers, source: RequestConfig["headers"]): void {
  if (!source) return;
  new Headers(source).forEach((value, key) => target.set(key, value));
}

function toRequestHeaders(
  globalHeaders: RequestConfig["headers"],
  requestHeaders: RequestConfig["headers"],
  token: string | null | undefined,
): Headers {
  const headers = new Headers();
  layerHeaders(headers, globalHeaders);
  layerHeaders(headers, requestHeaders);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function isRawBody(data: unknown): data is BodyInit {
  return (
    data instanceof FormData ||
    data instanceof URLSearchParams ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data) ||
    data instanceof ReadableStream
  );
}

function isPlainObject(data: unknown): data is Record<string, unknown> {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}

function toFormBody(data: Record<string, unknown>): URLSearchParams {
  const form = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null) appendParam(form, key, value);
  });
  return form;
}

function toRequestBody(data: unknown, headers: Headers): BodyInit | undefined {
  if (data === undefined) return undefined;

  if (isRawBody(data)) {
    // Only fetch knows the multipart boundary it will generate, so it must own the header.
    if (data instanceof FormData) headers.delete("Content-Type");
    return data;
  }

  const mediaType = mediaTypeOf(headers.get("Content-Type"));
  if (mediaType === FORM_MEDIA_TYPE && isPlainObject(data)) return toFormBody(data);
  if (typeof data === "string" && mediaType && !mediaType.includes("json")) return data;

  if (!mediaType) headers.set("Content-Type", JSON_MEDIA_TYPE);
  return JSON.stringify(data, jsonReplacer);
}

async function readResponseData(response: Response): Promise<unknown> {
  if ([204, 205, 304].includes(response.status) || !response.body) return {};

  const mediaType = mediaTypeOf(response.headers.get("Content-Type"));
  if (mediaType.includes("json")) return response.json();
  if (mediaType.startsWith("text/")) return response.text();

  // Binary response (e.g. Excel/PPT export): return a Response-like object
  // so saveBlobResponse can call .blob() and read .headers correctly.
  const blob = await response.blob();
  const { headers } = response;
  return { blob: () => Promise.resolve(blob), headers };
}

export function createApiClient(getToken: () => string | null | undefined): Client {
  return async <TResponseData, TRequestData = unknown>(
    config: RequestConfig<TRequestData>,
  ): Promise<ResponseConfig<TResponseData>> => {
    const token = getToken();
    const { baseURL, credentials, headers: globalHeaders } = getConfig();

    let url = [baseURL, config.url].filter(Boolean).join("");
    const query = toSearchParams(config.params).toString();
    if (query) url += `?${query}`;

    const headers = toRequestHeaders(globalHeaders, config.headers, token);
    const body = toRequestBody(config.data, headers);

    const rawResponse = await fetch(url, {
      credentials: credentials || "same-origin",
      method: config.method?.toUpperCase(),
      body,
      signal: config.signal,
      headers,
    });

    const response: ResponseConfig<TResponseData> = {
      data: (await readResponseData(rawResponse)) as TResponseData,
      status: rawResponse.status,
      statusText: rawResponse.statusText,
      headers: rawResponse.headers,
    };

    const isSuccess = (response.status >= 200 && response.status < 300) || response.status === 304;
    if (!isSuccess) {
      const errorData = response.data as ApiErrorResponse | undefined;
      throw toApiError(
        response.status,
        response.statusText,
        errorData?.Message ?? "An error has occurred.",
      );
    }

    return response;
  };
}

export function setApiConfig(config: Parameters<typeof kubbClient.setConfig>[0]): void {
  kubbClient.setConfig(config);
}
