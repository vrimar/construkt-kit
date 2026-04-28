# @construct-kit/config

Shared tool configuration for Construct Kit frontend projects.

## Sub-paths

| Import                  | Usage                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| `@construct-kit/config/typescript` | `"extends": "@construct-kit/config/typescript"` in `tsconfig.json`            |
| `@construct-kit/config/oxlint`     | `import baseConfig from "@construct-kit/config/oxlint"` in `oxlint.config.ts` |
| `@construct-kit/config/oxfmt`      | `export { default } from "@construct-kit/config/oxfmt"` in `oxfmt.config.ts`  |
| `@construct-kit/config/vite`       | `createViteConfig(overrides?)` factory                             |
| `@construct-kit/config/playwright` | `createPlaywrightConfig(overrides?)` factory                       |
| `@construct-kit/config/kubb`       | `createKubbConfig(options)` factory for OpenAPI codegen            |

## Oxlint Config

The shared `@construct-kit/config/oxlint` export now ships as a TypeScript config module.
Consume it from an `oxlint.config.ts` file and merge local overrides there.

This requires the Node-based `oxlint` runtime with a Node version new enough to
execute TypeScript config files.

## Oxfmt Config

The shared `@construct-kit/config/oxfmt` base enables Oxc import sorting via `sortImports: true`, so consuming packages inherit automatic import ordering without additional local config.

## Vite Config

`createViteConfig(overrides?)` returns a merged Vite config using Vite's `mergeConfig()` (properly merges plugin arrays, not shallow).

## Kubb Config (OpenAPI Codegen)

`createKubbConfig(options?)` generates a Kubb config that produces 3 output directories:

| Output dir | Content                               | Plugin             |
| ---------- | ------------------------------------- | ------------------ |
| `dtos/`    | TypeScript types from OpenAPI schemas | `pluginTs`         |
| `calls/`   | API call functions                    | `pluginClient`     |
| `hooks/`   | React Query hooks (grouped by path)   | `pluginReactQuery` |

Options (all optional):

| Option             | Default                  | Description                    |
| ------------------ | ------------------------ | ------------------------------ |
| `inputPath`        | `./src/api/openapi.json` | Path to OpenAPI spec           |
| `outputPath`       | `./src/api/gen`          | Output directory               |
| `clientImportPath` | `@/api/client`           | Import path for the API client |

Key behaviors:

- **Query key versioning**: All React Query keys are prefixed with `"v5"` for cache invalidation on breaking API changes
- **Path params as objects**: `pathParamsType: "object"` — route params are passed as `{ id }` not positional args
- **Inline params**: `paramsType: "inline"` — params are inlined into hook signatures
