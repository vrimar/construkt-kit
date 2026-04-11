# B3 Frontend Shared — AI Instructions

Monorepo providing `@b3/*` packages. Uses **pnpm workspaces**, **Turbo**, **Tsdown**, **Changesets**.

> For per-package details (exports, patterns, architecture), see `README.md` in each package under `packages/`.
> Full AI instructions are in `.github/copilot-instructions.md`.

## Packages

- **`@b3/ui`** — 60+ UI components built on Panda CSS + Ark UI primitives. Always import from `@b3/ui`, never `@ark-ui/*` or `styled-system/*`.
- **`@b3/api`** — HTTP client (`createApiClient`), typed error classes (`ApiError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`), data-table types.
- **`@b3/utils`** — Stateless utilities: arrays, dates, enums, numbers, objects, query strings, validation schemas (Zod).
- **`@b3/pages`** — Shared auth pages (`LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`) with adapter-based auth.
- **`@b3/config`** — Shared tool configs: `@b3/config/typescript`, `/vite`, `/oxlint`, `/oxfmt`, `/playwright`, `/kubb`.
- **`@b3/auth-adapters`** — `AuthProvider` adapters (Auth0).
- **`@b3/testing`** — Test infrastructure (MSW request handlers for Storybook).

## Build & Dev Commands

| Command          | Purpose                             |
| ---------------- | ----------------------------------- |
| `pnpm install`   | Install all workspace dependencies  |
| `pnpm dev`       | Dev mode (watch + rebuild all pkgs) |
| `pnpm build`     | Build all packages (`dist/`)        |
| `pnpm test`      | Run all tests                       |
| `pnpm typecheck` | Type-check all packages             |
| `pnpm lint`      | Lint all packages (oxlint)          |
| `pnpm format`    | Format all packages (oxfmt)         |
| `pnpm storybook` | Start Storybook dev server          |
| `pnpm changeset` | Create a changeset for versioning   |

All build/dev/test/lint/typecheck commands go through Turbo (`turbo run <task>` via root scripts).

## Conventions

- Named exports only (no default exports)
- Source under `packages/<name>/src/`, each with `tsconfig.json` + `tsdown.config.ts`
- React 19 peer dep (`^19.0.0`)
- Never import from `@ark-ui/react` directly — use `@b3/ui`
- Never import from `styled-system/*` in consuming apps — use `css`/`styled`/`token` from `@b3/ui`
- Never use hardcoded colors — use Panda tokens
- Never import between packages via relative paths — use `@b3/*` aliases
- `react` / `react-dom` are peer deps — never add to `dependencies`
- `styled-system/` directories are Panda CSS generated output — never edit manually

## Package Dependency Graph

```
@b3/config         ← all packages (tool configs)
@b3/utils          ← @b3/api, @b3/ui, @b3/pages, consuming apps
@b3/ui             ← @b3/pages, consuming apps  (depends on @b3/utils)
@b3/pages          ← consuming apps  (defines AuthProvider interface, depends on @b3/ui)
@b3/auth-adapters  ← consuming apps  (implements AuthProvider, depends on @b3/pages for types)
@b3/api            ← consuming apps  (HTTP client factory, uses @kubb/plugin-client)
@b3/testing        ← storybook, test suites  (depends on @b3/ui, msw, @testing-library/react)
```

## Design Principles

- **Adapter pattern** — auth pages accept interfaces, not specific SDKs
- **Callback-driven** — pages/components use callbacks for navigation, never import a router
- **Factory functions** — configs export `createXConfig()`, API exports `createApiClient()`
- **Duck-typing** — `Auth0ClientLike` interface, not direct Auth0 SDK imports
- **Stateless utilities** — `@b3/utils` has no framework deps, no side effects
