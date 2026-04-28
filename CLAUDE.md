# Construkt Kit Frontend Shared — AI Instructions

Monorepo providing `@construkt-kit/*` packages. Uses **pnpm workspaces**, **Turbo**, **Tsdown**, **Changesets**.

> For per-package details (exports, patterns, architecture), see `README.md` in each package under `packages/`.
> Full AI instructions are in `.github/copilot-instructions.md`.

## Packages

- **`@construkt-kit/ui`** — 60+ UI components built on Panda CSS + Ark UI primitives. Always import from `@construkt-kit/ui`, never `@ark-ui/*` or `styled-system/*`.
- **`@construkt-kit/api`** — HTTP client (`createApiClient`), typed error classes (`ApiError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`), data-table types.
- **`@construkt-kit/utils`** — Stateless utilities: arrays, dates, enums, numbers, objects, query strings, validation schemas (Zod).
- **`@construkt-kit/pages`** — Shared auth pages (`LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`) with adapter-based auth.
- **`@construkt-kit/config`** — Shared tool configs: `@construkt-kit/config/typescript`, `/vite`, `/oxlint`, `/oxfmt`, `/playwright`, `/kubb`.
- **`@construkt-kit/auth-adapters`** — `AuthProvider` adapters (Auth0).
- **`@construkt-kit/testing`** — Test infrastructure (MSW request handlers for Storybook).

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
- Never import from `@ark-ui/react` directly — use `@construkt-kit/ui`
- Never import from `styled-system/*` in consuming apps — use `css`/`styled`/`token` from `@construkt-kit/ui`
- Never use hardcoded colors — use Panda tokens
- Never import between packages via relative paths — use `@construkt-kit/*` aliases
- `react` / `react-dom` are peer deps — never add to `dependencies`
- `styled-system/` directories are Panda CSS generated output — never edit manually

## Package Dependency Graph

```
@construkt-kit/config         ← all packages (tool configs)
@construkt-kit/utils          ← @construkt-kit/api, @construkt-kit/ui, @construkt-kit/pages, consuming apps
@construkt-kit/ui             ← @construkt-kit/pages, consuming apps  (depends on @construkt-kit/utils)
@construkt-kit/pages          ← consuming apps  (defines AuthProvider interface, depends on @construkt-kit/ui)
@construkt-kit/auth-adapters  ← consuming apps  (implements AuthProvider, depends on @construkt-kit/pages for types)
@construkt-kit/api            ← consuming apps  (HTTP client factory, uses @kubb/plugin-client)
@construkt-kit/testing        ← storybook, test suites  (depends on @construkt-kit/ui, msw, @testing-library/react)
```

## Design Principles

- **Adapter pattern** — auth pages accept interfaces, not specific SDKs
- **Callback-driven** — pages/components use callbacks for navigation, never import a router
- **Factory functions** — configs export `createXConfig()`, API exports `createApiClient()`
- **Duck-typing** — `Auth0ClientLike` interface, not direct Auth0 SDK imports
- **Stateless utilities** — `@construkt-kit/utils` has no framework deps, no side effects
