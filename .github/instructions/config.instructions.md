---
applyTo: "packages/config/**"
---

Read `packages/config/README.md` for full options and usage.

## Quick Reference

Sub-path exports — each consumed differently:

| Sub-path                | Type      | Key export                                                                                               |
| ----------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `@b3/config/typescript` | JSON      | Base `tsconfig.json` (strict, ES2022, react-jsx, bundler resolution)                                     |
| `@b3/config/vite`       | Factory   | `createViteConfig(overrides?)` — includes React plugin, built-in `resolve.tsconfigPaths`, oxlint checker |
| `@b3/config/playwright` | Factory   | `createPlaywrightConfig(overrides?)` — Chromium-only, runs `pnpm dev` as webServer                       |
| `@b3/config/kubb`       | Factory   | `createKubbConfig(options?)` — OpenAPI codegen → `dtos/`, `calls/`, `hooks/`                             |
| `@b3/config/oxlint`     | TS config | Shared base for `oxlint.config.ts` files                                                                 |
| `@b3/config/oxfmt`      | TS config | Shared `oxfmt.config.ts` base                                                                            |

## Key Patterns

- **Factory functions** (`createXConfig`) accept overrides and return full config objects
- Vite uses `mergeConfig()` for proper plugin array merging — never shallow-spread
- Kubb query keys are prefixed with `"v5"` for cache invalidation on breaking changes
- Kubb `clientImportPath` defaults to `@/api/client` — apps must export their configured client there
- Playwright runs `pnpm dev` before tests; uses `PLAYWRIGHT_BASE_URL` env var (default: `http://localhost:5173`)

## Conventions

- Named exports only
- Config files are plain `.ts` or `.json` — no framework-specific setup
- Consuming apps extend/merge these configs, not copy them
