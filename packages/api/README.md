# @construkt-kit/api

Configuration for the Kubb-generated HTTP client, typed error classes, and data-table types for
Construkt Kit frontend apps.

## Exports

### Client

| Export                       | Description                                                            |
| ---------------------------- | ---------------------------------------------------------------------- |
| `configureApiClient`         | Points a generated Kubb client at an API; returns a disposer            |
| `fetchTransport`             | Fetch transport used by default — JSON, text, SSE and binary responses |
| `ApiClient`                  | Structural type of the generated client this package drives            |
| `ApiRequest`                 | Resolved request handed to a transport                                  |
| `ApiTransport`               | Transport signature (`ApiRequest` → `ApiTransportResult`)              |
| `ApiTransportResult`         | What a transport returns (parsed body plus native request/response)     |
| `ApiResponseError`           | Non-2xx response the error interceptor maps                             |
| `ConfigureApiClientOptions`  | `{ baseURL, getToken, transport? }`                                     |

### Error Classes

| Export              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `ApiError`          | Base error class (`status`, `code`, `message`) |
| `ValidationError`   | 422 error (extends `ApiError`)                 |
| `NotFoundError`     | 404 error (extends `ApiError`)                 |
| `UnauthorizedError` | 401 error (extends `ApiError`)                 |
| `toApiError`        | Maps a status onto the narrowest class          |
| `ApiErrorResponse`  | Interface — `{ Message: string }`              |

### Data-Table Types

| Export              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `DataTableFilters`  | `Record<string, string[] \| undefined>`           |
| `DataTableSortType` | `"asc" \| "desc" \| ""`                           |
| `DataTableParams`   | `{ page, pageSize, orderBy, orderType, filters }` |

## Usage

Kubb generates its own fetch runtime into `<output>/.kubb/client.ts`. This package configures that
client; it never replaces it.

```ts
import { configureApiClient } from "@construkt-kit/api";

import { client } from "@/api/gen/.kubb/client";

const dispose = configureApiClient(client, {
  baseURL: "https://api.example.com",
  getToken: () => authToken,
});
```

Generated calls and hooks then work unchanged:

```ts
import { ApiError, NotFoundError } from "@construkt-kit/api";

// Hook: resolves to the body, errors surface on `error`
const { data: project, error } = useGetApiProjectsId({ path: { id } });

if (error instanceof NotFoundError) {
  /* 404 */
}
if (error instanceof ApiError) {
  /* any API error */
}

// Call function: awaitable, `.unwrap()` for the body alone
const project = await getApiProjectsId({ path: { id } }).unwrap();
```

## Key Patterns

### Token callback

`getToken` is a **synchronous** callback (`() => string | null | undefined`) read on every request,
so token refresh needs no reconfiguration. The resulting `Authorization: Bearer` header replaces one
set through `client.setConfig({ headers })` whatever its casing, and when the callback returns
nothing the header is removed — so a logout stops sending the old token.

> **Sync/async gap:** `AuthProvider.getToken` from `@construkt-kit/pages` returns
> `Promise<string | null>`. Cache the token in the app and hand over the cached value:
>
> ```ts
> let cachedToken: string | null = null;
> // Update cachedToken when auth state changes
> configureApiClient(client, { baseURL, getToken: () => cachedToken });
> ```

### Disposer

`configureApiClient` returns a function that removes the interceptors it registered. Call it before
re-configuring the same client, so a hot reload does not stack interceptors.

### Response bodies

`fetchTransport` decides how to read a response:

- JSON content types are parsed; an unparseable body is passed through as text
- `text/*` is read as text, `text/event-stream` as the raw stream
- every other media type becomes a `Blob` — the Kubb runtime would decode it as text
- `204`/`205` and empty bodies resolve to `undefined`
- an explicit per-operation `responseType` (`blob`, `arraybuffer`, `stream`, `text`, `json`) wins

Only 2xx counts as success, so a `304` raises an `ApiError` rather than resolving empty. Send
conditional requests (`If-None-Match`, `If-Modified-Since`) only where the caller handles that.

Generated hooks resolve to the body alone. For a download, call the generated function directly and
read the filename off the response — the body is already consumed, so use `data`, not `response.blob()`:

```ts
import { saveBlob } from "@construkt-kit/utils";

const { data, response } = await postApiExportsExcel({ body });

saveBlob(data as Blob, response.headers.get("Content-Disposition"), "export.xlsx");
```

### Error hierarchy

All errors extend `ApiError`, which uses `Object.setPrototypeOf(this, new.target.prototype)` —
required for `instanceof` checks in transpiled TypeScript. Subclasses hardcode their status:
`ValidationError` → 422, `NotFoundError` → 404, `UnauthorizedError` → 401.

Non-2xx responses are raised through an error interceptor, so `instanceof` works directly. This
applies while `throwOnError` is on, which is the default and what the generated hooks use; a call
that opts out with `throwOnError: false` gets the raw body on `error` and can map it with
`toApiError`:

```ts
try {
  await apiCall();
} catch (error) {
  if (error instanceof NotFoundError) return null;
  if (error instanceof UnauthorizedError) return signOut();
  if (error instanceof ApiError) reportError(error.code, error.message);
}
```

The message comes from a `{ Message }` body, falling back to `"An error has occurred."`. `code` is a
stable screaming-snake identifier (`NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_SERVER_ERROR`), derived
from the status text when there is no dedicated subclass. Network failures reject with the underlying
`TypeError`, not an `ApiError`.

### Custom transport

Pass `transport` to wrap `fetchTransport` — telemetry, retries, or response fixups:

```ts
configureApiClient(client, {
  baseURL,
  getToken,
  transport: async (request) => {
    const startedAt = performance.now();
    const result = await fetchTransport(request);
    track("api_call", {
      endpoint: new URL(request.url).pathname,
      durationMs: performance.now() - startedAt,
    });

    return result;
  },
});
```

### Kubb codegen integration

Consuming apps generate typed API code with `createKubbConfig()` from `@construkt-kit/config/kubb`:

| Output dir     | Contents                                                |
| -------------- | ------------------------------------------------------- |
| `dtos/`        | TypeScript types generated from OpenAPI schemas         |
| `calls/`       | One function per operation, returning the full result   |
| `hooks/`       | React Query hooks grouped by API path                   |
| `.kubb/`       | The bundled fetch runtime (`client`, `createClient`)    |

Every generated function takes one grouped options object — `{ path, query, body, headers }` — and
resolves to `{ status, data, error, request, response }`. Add `.unwrap()` for the body alone, which
is what the hooks do.

Options (via `createKubbConfig()`):

- `inputPath` — OpenAPI spec location (default: `./src/api/openapi.json`)
- `outputPath` — generated output root (default: `./src/api/gen`)
- `overrides` — merged over the generated config

## CLI: `construkt-kit-api-gen`

Fetches an OpenAPI spec from a running API, runs Kubb codegen, and deletes the downloaded spec.

### Usage

```bash
# Uses API_URL env var or specUrl from config
npx construkt-kit-api-gen

# Override the API base URL
npx construkt-kit-api-gen --url https://api.example.com

# Use a custom config file (default: api.config.ts)
npx construkt-kit-api-gen --config my-api.config.ts

# Generate from a spec on disk; nothing is downloaded or deleted
npx construkt-kit-api-gen --input ./spec/openapi.json
```

### Config file (`api.config.ts`)

```ts
import { createKubbConfig } from "@construkt-kit/config/kubb";

export const specUrl = "https://api.example.com";
export default createKubbConfig();
```

### URL resolution priority

1. `--url` CLI flag
2. `API_URL` environment variable
3. `specUrl` named export from config file

The spec is fetched from `{baseUrl}/openapi/v1.json`, saved to the config's `input` path, passed to
Kubb, then deleted. Generation problems are printed and exit the process with code 1.
