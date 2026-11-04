# @construkt-kit/config

Shared tool configuration for Construkt Kit frontend projects.

## Sub-paths

| Import                             | Usage                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `@construkt-kit/config/typescript` | `"extends": "@construkt-kit/config/typescript"` in `tsconfig.json`            |
| `@construkt-kit/config/oxlint`     | `import baseConfig from "@construkt-kit/config/oxlint"` in `oxlint.config.ts` |
| `@construkt-kit/config/oxfmt`      | `export { default } from "@construkt-kit/config/oxfmt"` in `oxfmt.config.ts`  |
| `@construkt-kit/config/vite`       | `createViteConfig(overrides?)` factory                                        |
| `@construkt-kit/config/playwright` | `createPlaywrightConfig(overrides?)` factory                                  |
| `@construkt-kit/config/kubb`       | `createKubbConfig(options)` factory for OpenAPI codegen                       |
| `@construkt-kit/config/tsdown`     | `createTsdownConfig(options?)` factory; a given `entry` replaces the default  |

## Oxlint Config

The shared `@construkt-kit/config/oxlint` export now ships as a TypeScript config module.
Consume it from an `oxlint.config.ts` file and merge local overrides there.

This requires the Node-based `oxlint` runtime with a Node version new enough to
execute TypeScript config files.

## Oxfmt Config

The shared `@construkt-kit/config/oxfmt` base enables Oxc import sorting via `sortImports: true`, so consuming packages inherit automatic import ordering without additional local config.

## Vite Config

`createViteConfig(overrides?)` returns a merged Vite config using Vite's `mergeConfig()` (properly merges plugin arrays, not shallow).

## Playwright Config

`createPlaywrightConfig(overrides?)` starts `pnpm dev` as its web server and tests `http://localhost:5173`. With
`PLAYWRIGHT_BASE_URL` set it tests that URL instead and starts no server, unless `overrides.webServer` names one.

## Kubb Config (OpenAPI Codegen)

`createKubbConfig(options?)` generates a Kubb v5 config that produces 3 output directories plus the
bundled fetch runtime:

| Output dir | Content                               | Plugin             |
| ---------- | ------------------------------------- | ------------------ |
| `dtos/`    | TypeScript types from OpenAPI schemas | `pluginTs`         |
| `calls/`   | API call functions                    | `pluginFetch`      |
| `hooks/`   | React Query hooks (grouped by path)   | `pluginReactQuery` |
| `.kubb/`   | Fetch client runtime                  | `pluginFetch`      |

Options (all optional):

| Option       | Default                  | Description                                |
| ------------ | ------------------------ | ------------------------------------------ |
| `inputPath`  | `./src/api/openapi.json` | Path to OpenAPI spec                       |
| `outputPath` | `./src/api/gen`          | Output directory                           |
| `overrides`  | `{}`                     | Merged over the config; arrays replace     |

Key behaviors:

- **Grouped arguments**: every call and hook takes one `{ path, query, body, headers }` object
- **Hooks opted in**: `hooks: true` — `use*` wrappers alongside the `queryOptions` helpers
- **Named barrels**: an `index.ts` per output directory and one at the root
- **`int64` as `number`**: `integerType: "number"`, matching what `JSON.parse` produces
- **Client configuration**: apps wire the generated `.kubb/client` up with `configureApiClient` from `@construkt-kit/api`

The peer Kubb packages (`kubb`, `@kubb/adapter-oas`, `@kubb/plugin-ts`, `@kubb/plugin-fetch`,
`@kubb/plugin-react-query`) are optional — install them in apps that run codegen.

## Upgrading from 0.5

- Apps that run codegen need `kubb` and `@kubb/adapter-oas` 5.15.3 or later, `@kubb/plugin-fetch` 5.11,
  `@kubb/plugin-react-query` 5.9 and `@kubb/plugin-ts` 5.4. The plugins no longer declare a peer on `kubb`, so these
  ranges are what keeps the two in step
- `inputPath` and `outputPath` resolve against the config file's folder, not the working directory; keep the config
  at the project root or pass absolute paths
- `defineConfig` rejects unknown keys, so a misspelled key in `overrides` now fails codegen
- Regenerating rewrites every generated file, and the generated client changes what it sends:
  - Parameters described with `content: application/json` go out as one JSON-encoded value instead of `deepObject`
  - JSON bodies send the operation's declared media type, and string bodies are JSON-encoded
  - URL-encoded bodies omit `null` and `undefined` properties
  - Client and call `headers` merge case-insensitively, with the call winning
  - Operations named after a reserved word get a `_` prefix
- `text/event-stream` operations get no React Query hooks; use the generated streaming client
- A JSON spec with a duplicate key fails with `KUBB_INVALID_DOCUMENT`, and a malformed `servers[].url` is rejected
