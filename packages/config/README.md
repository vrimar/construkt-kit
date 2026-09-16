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

## Oxlint Config

The shared `@construkt-kit/config/oxlint` export now ships as a TypeScript config module.
Consume it from an `oxlint.config.ts` file and merge local overrides there.

This requires the Node-based `oxlint` runtime with a Node version new enough to
execute TypeScript config files.

## Oxfmt Config

The shared `@construkt-kit/config/oxfmt` base enables Oxc import sorting via `sortImports: true`, so consuming packages inherit automatic import ordering without additional local config.

## Vite Config

`createViteConfig(overrides?)` returns a merged Vite config using Vite's `mergeConfig()` (properly merges plugin arrays, not shallow).

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
