---
applyTo: "packages/api/**"
---

Read `packages/api/README.md` for full exports and usage examples.

## Quick Reference

- `createApiClient(getToken)` — factory returning a Kubb-compatible `Client`; `getToken` is **synchronous** (`() => string | null | undefined`) and called at **request time** (not creation), enabling token refresh
- `setApiConfig({ baseURL })` — configure the underlying Kubb client (base URL, credentials)
- Error hierarchy: `ApiError` (base) → `ValidationError` (422), `NotFoundError` (404), `UnauthorizedError` (401)
- `createApiClient` only throws `ApiError` for non-2xx responses — it does **not** auto-map to subclasses; subclasses are for app-level error construction
- All error subclasses use `Object.setPrototypeOf` for correct `instanceof` in transpiled output
- Non-JSON responses return `{ blob(), headers }` — pair with `saveBlobResponse()` / `downloadFile()` from `@b3/utils`

## Param Normalization

`createApiClient` converts `config.params` to `URLSearchParams`; `undefined` values are omitted, `null` becomes `"null"`.

## Kubb Integration

Consuming apps use `@b3/config/kubb` (`createKubbConfig`) to generate 3 output dirs from an OpenAPI spec:

- `dtos/` — TypeScript types from schemas
- `calls/` — API call functions (import the app's client wrapper)
- `hooks/` — React Query hooks grouped by path, query keys prefixed with `"v5"`

The generated `calls/` import from a path the app provides (`clientImportPath`), which should re-export `createApiClient` configured with the app's `getToken`.

## Conventions

- Named exports only
- `ApiErrorResponse` shape: `{ Message: string }` — matches backend contract
- `createApiClient`'s `getToken` is sync; if the consuming app's auth is async (e.g., `AuthProvider.getToken` from `@b3/pages`), resolve the token before passing it
- Error subclasses (`NotFoundError`, etc.) are building blocks for app error handling — the client itself only throws `ApiError`

## CLI: `b3-api-gen`

Ships as `bin/api-gen.mjs`. Fetches OpenAPI spec → runs Kubb codegen → cleans up.

- Config file: `api.config.ts` (default export = Kubb config, named export `specUrl` = API base URL)
- URL priority: `--url` flag > `API_URL` env > `specUrl` from config
- Spec endpoint: `{baseUrl}/openapi/v1.json`
