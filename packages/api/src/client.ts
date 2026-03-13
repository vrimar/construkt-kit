export type {
  Client,
  RequestConfig,
  ResponseConfig,
  ResponseErrorConfig,
} from "@kubb/plugin-client/clients/fetch";
import type { Client, RequestConfig, ResponseConfig } from "@kubb/plugin-client/clients/fetch";
import { client as kubbClient, getConfig } from "@kubb/plugin-client/clients/fetch";

import { ApiError } from "./errors";
import type { ApiErrorResponse } from "./errors";

export function createApiClient(getToken: () => string | null | undefined): Client {
  return async <TResponseData, TRequestData = unknown>(
    config: RequestConfig<TRequestData>,
  ): Promise<ResponseConfig<TResponseData>> => {
    const token = getToken();
    const { baseURL, credentials } = getConfig();

    const normalizedParams = new URLSearchParams();
    Object.entries((config.params as Record<string, unknown>) ?? {}).forEach(([key, value]) => {
      if (value !== undefined)
        normalizedParams.append(key, value === null ? "null" : String(value));
    });

    let url = [baseURL, config.url].filter(Boolean).join("");
    if (config.params) url += `?${normalizedParams}`;

    const rawResponse = await fetch(url, {
      credentials: (credentials as RequestCredentials) || "same-origin",
      method: config.method?.toUpperCase(),
      body:
        config.data instanceof FormData
          ? config.data
          : config.data !== undefined
            ? JSON.stringify(config.data)
            : undefined,
      signal: config.signal as AbortSignal | undefined,
      headers: {
        ...(typeof config.headers === "object" && !Array.isArray(config.headers)
          ? (config.headers as Record<string, string>)
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const contentType = rawResponse.headers.get("Content-Type") ?? "";
    let data: unknown;

    if ([204, 205, 304].includes(rawResponse.status) || !rawResponse.body) {
      data = {};
    } else if (contentType.includes("json") || contentType.startsWith("text/")) {
      data = await rawResponse.json();
    } else {
      // Binary response (e.g. Excel/PPT export): return a Response-like object
      // so saveBlobResponse can call .blob() and read .headers correctly.
      const blob = await rawResponse.blob();
      const { headers } = rawResponse;
      data = { blob: () => Promise.resolve(blob), headers };
    }

    const response: ResponseConfig<TResponseData> = {
      data: data as TResponseData,
      status: rawResponse.status,
      statusText: rawResponse.statusText,
      headers: rawResponse.headers,
    };

    if (response.status < 200 || response.status >= 300) {
      const errorData = response.data as ApiErrorResponse;
      throw new ApiError(
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
