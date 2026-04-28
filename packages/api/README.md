# @construkt-kit/api

HTTP client, typed error classes, and data-table types for Construkt Kit frontend apps.

## Exports

### Client

| Export                | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| `createApiClient`     | Factory — creates fetch-based HTTP client with Bearer token injection |
| `setApiConfig`        | Configure the Kubb client (base URL, etc.)                            |
| `Client`              | HTTP client type (re-exported from `@kubb/plugin-client`)             |
| `RequestConfig`       | Request configuration type                                            |
| `ResponseConfig`      | Response configuration type                                           |
| `ResponseErrorConfig` | Error response configuration type                                     |

### Error Classes

| Export              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `ApiError`          | Base error class (`status`, `code`, `message`) |
| `ValidationError`   | 422 error (extends `ApiError`)                 |
| `NotFoundError`     | 404 error (extends `ApiError`)                 |
| `UnauthorizedError` | 401 error (extends `ApiError`)                 |
| `ApiErrorResponse`  | Interface — `{ Message: string }`              |

### Data-Table Types

| Export              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `DataTableFilters`  | `Record<string, string[] \| undefined>`           |
| `DataTableSortType` | `"asc" \| "desc" \| ""`                           |
| `DataTableParams`   | `{ page, pageSize, orderBy, orderType, filters }` |

## Usage

```ts
import { ApiError, NotFoundError, createApiClient } from "@construkt-kit/api";
import type { DataTableParams } from "@construkt-kit/api";

if (error instanceof NotFoundError) {
  /* 404 */
}
if (error instanceof ApiError) {
  /* any API error */
}
```

## Key Patterns

### Token callback

`createApiClient(getToken)` accepts a **synchronous** callback (`() => string | null | undefined`), not a static token. The token is fetched at **call time** (not client creation), supporting token refresh.

> **Sync/async gap:** `AuthProvider.getToken` from `@construkt-kit/pages` returns `Promise<string | null>`, but `createApiClient` expects a sync getter. The recommended pattern is to cache the token synchronously in the app and pass the cached value:
>
> ```ts
> let cachedToken: string | null = null;
> // Update cachedToken when auth state changes
> const client = createApiClient(() => cachedToken);
> ```

### Binary responses

Non-JSON/text responses (Excel, PDF exports) return a Response-like object:

```ts
{ blob: () => Promise<Blob>, headers: Headers }
```

Pair with `saveBlobResponse()` or `downloadFile()` from `@construkt-kit/utils` for file downloads.

### Error hierarchy

All errors extend `ApiError` which uses `Object.setPrototypeOf(this, new.target.prototype)` — required for proper `instanceof` checks in transpiled TypeScript. Subclasses hardcode their status: `ValidationError` → 422, `NotFoundError` → 404, `UnauthorizedError` → 401.

**Note:** `createApiClient` only throws `ApiError` for non-2xx responses — it does **not** auto-map status codes to subclasses. The subclasses are building blocks for app-level error handling:

```ts
try {
  await apiCall();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 404) throw new NotFoundError(error.message);
    if (error.status === 422) throw new ValidationError(error.code, error.message);
    if (error.status === 401) throw new UnauthorizedError(error.message);
  }
}
```

### Param normalization

`createApiClient` converts `config.params` to `URLSearchParams`. Rules:

- `undefined` values are **omitted**
- `null` becomes the string `"null"`
- All other values are stringified via `String(value)`

### Kubb codegen integration

Consuming apps generate typed API code using `createKubbConfig()` from `@construkt-kit/config/kubb`. The config produces 3 output directories from an OpenAPI spec:

| Output dir | Contents                                        |
| ---------- | ----------------------------------------------- |
| `dtos/`    | TypeScript types generated from OpenAPI schemas |
| `calls/`   | API call functions (typed fetch wrappers)       |
| `hooks/`   | React Query hooks grouped by API path           |

**How it connects to `createApiClient`:**

1. App creates a client: `const client = createApiClient(() => authToken)`
2. App calls `setApiConfig({ baseURL: "https://api.example.com" })`
3. App re-exports the configured client from a known path (default: `@/api/client`)
4. Kubb `clientImportPath` option points generated `calls/` to that re-export
5. Generated `hooks/` import from `calls/`, which use the configured client

Query keys in generated hooks are prefixed with `"v5"` — bump this in `@construkt-kit/config/kubb` when making breaking API changes to invalidate all caches.

Key Kubb options (via `createKubbConfig()`):

- `inputPath` — OpenAPI spec location (default: `./src/api/openapi.json`)
- `outputPath` — generated output root (default: `./src/api/gen`)
- `clientImportPath` — where generated code imports the client from (default: `@/api/client`)

## CLI: `construkt-kit-api-gen`

The package ships a `construkt-kit-api-gen` binary that automates the full codegen workflow: fetch an OpenAPI spec from a running API, run Kubb codegen, and clean up.

### Usage

```bash
# Uses API_URL env var or specUrl from config
npx construkt-kit-api-gen

# Override the API base URL
npx construkt-kit-api-gen --url https://api.example.com

# Use a custom config file (default: api.config.ts)
npx construkt-kit-api-gen --config my-api.config.ts
```

### Config file (`api.config.ts`)

```ts
import { createKubbConfig } from "@construkt-kit/config/kubb";

export const specUrl = "https://api.example.com";
export default createKubbConfig({ clientImportPath: "@/api/client" });
```

### URL resolution priority

1. `--url` CLI flag
2. `API_URL` environment variable
3. `specUrl` named export from config file

The spec is fetched from `{baseUrl}/openapi/v1.json`, saved temporarily, passed to Kubb, then deleted.
