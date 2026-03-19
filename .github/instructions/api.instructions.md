---
applyTo: "packages/api/**"
---

Read `packages/api/README.md` for full exports and usage examples.

## Quick Reference

- `createApiClient(getToken)` — factory returning a Kubb-compatible `Client`; token fetched at **call time** (not creation), enabling refresh
- `setApiConfig({ baseURL })` — configure the underlying Kubb client (base URL, credentials)
- Error hierarchy: `ApiError` (base) → `ValidationError` (422), `NotFoundError` (404), `UnauthorizedError` (401)
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
- Always check errors specific-to-general: `NotFoundError` before `ApiError`
