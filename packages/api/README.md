# @construkt-kit/api

Configuration for the Kubb-generated HTTP client, typed error classes, and data-table types for
Construkt Kit frontend apps.

## Exports

### Client

| Export                      | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `configureApiClient`        | Points a generated Kubb client at an API; returns a disposer |
| `ApiClient`                 | Structural type of the generated client this package drives  |
| `ConfigureApiClientOptions` | `{ baseURL, getToken }`                                      |

### Error Classes

| Export              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `ApiError`          | Base error class (`status`, `code`, `message`) |
| `ValidationError`   | 422 error (extends `ApiError`)                 |
| `NotFoundError`     | 404 error (extends `ApiError`)                 |
| `UnauthorizedError` | 401 error (extends `ApiError`)                 |
| `toApiError`        | Maps a status onto the narrowest class         |
| `toErrorMessage`    | Picks the message out of an error body         |
| `ApiErrorResponse`  | Interface — `{ detail?, title?, Message? }`    |

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

An operation whose spec gives it, or its path, its own `servers` calls that server instead of `baseURL`; a
`baseURL` passed on the call wins over both.

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

`getToken` is read on every request, so token refresh needs no reconfiguration. It may return the
token or a promise of it, so an auth SDK's async getter, such as `AuthProvider.getToken` from
`@construkt-kit/pages`, can be passed as it is:

```ts
configureApiClient(client, { baseURL, getToken: () => auth.getToken() });
```

The resulting `Authorization: Bearer` header replaces one set through `client.setConfig({ headers })`
whatever its casing, and when the callback returns nothing the header is removed — so a logout stops
sending the old token.

### Query parameters

An object query parameter the spec gives no `style` goes out in bracket form, the way ASP.NET binds it
and `buildQueryString` writes it: `filters: { status: ["open", "closed"] }` sends
`filters[status]=open&filters[status]=closed`. A parameter with a `style` follows it, and every other
parameter goes through the generated serializer unchanged.

### Disposer

`configureApiClient` returns a function that removes the interceptors and the query serializer it
registered. Call it before re-configuring the same client, so a hot reload does not stack interceptors.

A client from `client.createClient()` starts without interceptors, so it sends no token and raises no
`ApiError`; one from `client.extend()` runs the configured client's interceptors first.

### Response bodies

The generated client reads a response by its media type:

- JSON (`application/json`, `application/*+json`, `text/json`) is parsed; invalid JSON rejects with the
  generated `ParseError`
- `text/*` is read as text
- `application/octet-stream`, PDF, image, audio and video bodies become a `Blob`
- any other media type is parsed as JSON when it parses, and read as text otherwise
- `204`/`205` and empty bodies resolve to `undefined`

An operation whose spec declares only binary success bodies (`format: binary`) is generated with
`parseAs: 'blob'`, so its download is a `Blob` whatever the media type. A call can pass `parseAs` (`json`,
`text`, `blob`, `arrayBuffer`, `stream`) itself; it applies to a 2xx response only, and an error body is
always read by its media type, so its message survives.

Only 2xx counts as success, so a `304` raises an `ApiError` rather than resolving empty. Send
conditional requests (`If-None-Match`, `If-Modified-Since`) only where the caller handles that.

Generated hooks resolve to the body alone. For a download, call the generated function directly and
read the filename off the response headers — the body is already consumed, so use `data`, not
`response.blob()`:

```ts
import { saveBlob } from "@construkt-kit/utils";

const { data, headers } = await postApiExportsExcel({ body });

saveBlob(data, headers.get("Content-Disposition"), "export.xlsx");
```

### Error hierarchy

All errors extend `ApiError`, which uses `Object.setPrototypeOf(this, new.target.prototype)` —
required for `instanceof` checks in transpiled TypeScript. Subclasses hardcode their status:
`ValidationError` → 422, `NotFoundError` → 404, `UnauthorizedError` → 401.

Non-2xx responses are raised through an error interceptor, so `instanceof` works directly. This
applies while `throwOnError` is on, which is the default and what the generated hooks use; a call
that opts out with `throwOnError: false` gets the raw body on `error` — `{ status, statusText }` when
there is none — and can map it with `toApiError` and `toErrorMessage`. An error interceptor the app
registers after `configureApiClient` gets the `ApiError`; one registered before it gets the generated
`ResponseError`.

```ts
try {
  await apiCall();
} catch (error) {
  if (error instanceof NotFoundError) return null;
  if (error instanceof UnauthorizedError) return signOut();
  if (error instanceof ApiError) reportError(error.code, error.message);
}
```

The message is the body's `detail`, then `title` (an RFC 9457 problem document), then a legacy
`Message`, falling back to `"An error has occurred."`. `code` is a
stable screaming-snake identifier (`NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`), derived from the
status alone — the status text is empty over HTTP/2 — as its registered reason phrase, or
`HTTP_<status>` for an unregistered one.

Only an error response becomes an `ApiError`. Every other failure passes through unchanged: a network
failure rejects with the `TypeError` from `fetch`, an abort with the signal's reason, and invalid JSON
with the generated `ParseError`.

### Custom transport

`configureApiClient` leaves the transport alone. To wrap the send — telemetry, retries — set one on
the client. It gets the resolved request and returns the response with its body unread; the client
decodes it:

```ts
import { client, defaultTransport } from "@/api/gen/.kubb/client";

client.setConfig({
  transport: async (request) => {
    const startedAt = performance.now();
    const result = await defaultTransport(request);
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

| Output dir | Contents                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| `dtos/`    | TypeScript types generated from OpenAPI schemas                                   |
| `calls/`   | One function per operation, returning the full result                             |
| `hooks/`   | React Query hooks grouped by API path                                             |
| `.kubb/`   | The fetch runtime (`client`, `createClient`, `defaultTransport`, `ResponseError`) |

Every generated function takes one grouped options object — `{ path, query, body, headers }` — and
resolves to `{ status, data, error, contentType, headers, request, response }`. Add `.unwrap()` for
the body alone, which is what the hooks do.

Options (via `createKubbConfig()`):

- `inputPath` — OpenAPI spec location (default: `./src/api/openapi.json`)
- `outputPath` — generated output root (default: `./src/api/gen`)
- `overrides` — merged over the generated config

## CLI: `construkt-kit-api-gen`

Fetches an OpenAPI spec from a running API, runs Kubb codegen, and deletes the downloaded spec. It runs the
app's own `kubb`, so install `kubb` next to the Kubb plugins `createKubbConfig()` uses, at the versions
`@construkt-kit/config` declares as peers.

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

### Operation table

Each run also writes `operations.ts` into the output folder: every operation's method, path template, `operationId`
and whether it reads. GET, HEAD and OPTIONS read; any other method writes, unless the spec marks the operation
`"x-read-only": true`, as an API should for a POST that only queries. `@construkt-kit/testing`'s `recordRequests` takes
this table to tell a flow's reads from its writes.

`http` and `https` base URLs both work, and redirects are followed. HTTPS certificates are verified:
for a dev certificate the OS trusts (`dotnet dev-certs https --trust`), run with
`NODE_OPTIONS=--use-system-ca`; otherwise use the API's `http` URL or set `NODE_EXTRA_CA_CERTS`.

## Upgrading from 0.6

- `getToken` may return a promise, so an async token getter no longer needs a cached copy

## Upgrading from 0.5

- Needs `@kubb/plugin-fetch` 6 and `kubb` 5.20.2 or later. Follow `@construkt-kit/config`'s "Upgrading from 0.6",
  regenerate, and run `tsc`
- `fetchTransport`, `ApiTransport`, `ApiTransportResult`, `ApiRequest` and `ApiResponseError` are gone, and
  `configureApiClient` takes no `transport` and leaves the client's own. To wrap the send, set a transport with
  `client.setConfig` around the generated `defaultTransport`; it returns the unread response, not a parsed body (see
  "Custom transport")
- An object query parameter without a `style` keeps its bracket form, `filters[status]=open`, through
  `configureApiClient`, which sets a query serializer; the generated client alone would send `status=open`
- `responseType` on a call is `parseAs`: `arraybuffer` is `arrayBuffer`, and `document` is `text`
- A download is a `Blob` when the spec declares its body `format: binary`, or its media type is octet-stream, PDF,
  image, audio or video; any other body, such as an Office file the spec doesn't mark binary, is read as text
- Invalid JSON under a JSON media type rejects with the generated `ParseError` instead of resolving to the text, and on
  an error status too, where it used to become an `ApiError` with the generic message
- Error interceptors get every failure, not only error responses: narrow with the generated `ResponseError.is`. One
  registered after `configureApiClient` gets the `ApiError` where it used to not run
- A failed call with `throwOnError: false` and no body has `{ status, statusText }` on `error` instead of `undefined`
- `baseURL` no longer reaches an operation or path that declares its own `servers`; pass `baseURL` on the call

## Upgrading from 0.4

- `construkt-kit-api-gen` needs `kubb` 5.15.3 or later; follow `@construkt-kit/config`'s "Upgrading from 0.5" for
  the plugin versions and what changes in regenerated clients

## Upgrading from 0.3

- `toApiError(status, message)` drops `statusText`. `code` comes from the status alone, so a status the server
  answered with a custom reason phrase gets its registered one
- `configureApiClient` strips trailing slashes from `baseURL`
- An explicit `responseType` applies to successful responses only; error bodies are parsed by content type so their
  `detail` reaches the message
- `construkt-kit-api-gen` verifies HTTPS certificates and keeps the base URL's path
- `construkt-kit-api-gen` reads `api.config.ts` in projects without `"type": "module"`, where it used to fall back to
  the defaults, and deletes a partly downloaded spec
