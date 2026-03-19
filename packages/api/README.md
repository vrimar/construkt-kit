# @b3/api

HTTP client, typed error classes, and data-table types for B3 frontend apps.

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
import { ApiError, NotFoundError, createApiClient } from "@b3/api";
import type { DataTableParams } from "@b3/api";

if (error instanceof NotFoundError) {
  /* 404 */
}
if (error instanceof ApiError) {
  /* any API error */
}
```

## Key Patterns

### Token callback

`createApiClient(getToken)` accepts a callback, not a static token. The token is fetched at **call time** (not client creation), supporting token refresh.

### Binary responses

Non-JSON/text responses (Excel, PDF exports) return a Response-like object:

```ts
{ blob: () => Promise<Blob>, headers: Headers }
```

Pair with `saveBlobResponse()` or `downloadFile()` from `@b3/utils` for file downloads.

### Error hierarchy

All errors extend `ApiError` which uses `Object.setPrototypeOf(this, new.target.prototype)` — required for proper `instanceof` checks in transpiled TypeScript. Subclasses hardcode their status: `ValidationError` → 422, `NotFoundError` → 404, `UnauthorizedError` → 401.

### Param normalization

`createApiClient` converts `config.params` to `URLSearchParams`. Rules:

- `undefined` values are **omitted**
- `null` becomes the string `"null"`
- All other values are stringified via `String(value)`

### Kubb codegen integration

Consuming apps generate typed API code using `createKubbConfig()` from `@b3/config/kubb`. The config produces 3 output directories from an OpenAPI spec:

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

Query keys in generated hooks are prefixed with `"v5"` — bump this in `@b3/config/kubb` when making breaking API changes to invalidate all caches.

Key Kubb options (via `createKubbConfig()`):

- `inputPath` — OpenAPI spec location (default: `./src/api/openapi.json`)
- `outputPath` — generated output root (default: `./src/api/gen`)
- `clientImportPath` — where generated code imports the client from (default: `@/api/client`)
