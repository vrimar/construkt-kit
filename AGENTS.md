# B3 Frontend Shared — AI Instructions

Read `.github/copilot-instructions.md` for monorepo rules, conventions, and anti-patterns.
For per-package details, see `README.md` in each package under `packages/`.

## Packages

| Package             | Purpose                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `@b3/ui`            | 60+ UI components (Panda CSS + Ark UI)                           |
| `@b3/api`           | HTTP client factory, typed error classes, data-table types       |
| `@b3/utils`         | Stateless utilities (arrays, dates, enums, validation schemas)   |
| `@b3/pages`         | Shared auth pages (Login, ForgotPassword, ResetPassword)         |
| `@b3/config`        | Shared tool configs (TypeScript, Vite, Kubb, Playwright, oxlint) |
| `@b3/auth-adapters` | AuthProvider adapters (Auth0)                                    |
| `@b3/testing`       | Test infrastructure (MSW handlers for Storybook)                 |

## Package Dependency Graph

```
@b3/config         ← all packages (tool configs)
@b3/utils          ← @b3/api, @b3/pages, consuming apps
@b3/ui             ← @b3/pages, consuming apps
@b3/pages          ← consuming apps  (defines AuthProvider interface)
@b3/auth-adapters  ← consuming apps  (implements AuthProvider, depends on @b3/pages for types)
@b3/api            ← consuming apps  (HTTP client factory, uses @kubb/plugin-client)
@b3/testing        ← storybook, test suites
```

## Design Principles

- **Adapter pattern** — auth pages accept interfaces, not specific SDKs
- **Callback-driven** — pages/components use callbacks for navigation, never import a router
- **Factory functions** — configs export `createXConfig()`, API exports `createApiClient()`
- **Duck-typing** — `Auth0ClientLike` interface, not direct Auth0 SDK imports
- **Stateless utilities** — `@b3/utils` has no framework deps, no side effects

## Common Workflows

| Task                  | Files to touch                                                                          |
| --------------------- | --------------------------------------------------------------------------------------- |
| New UI component      | `packages/ui/src/components/Name/Name.tsx`, `.stories.tsx`, `index.ts` + barrel exports |
| New utility function  | `packages/utils/src/<domain>.ts` + re-export from `index.ts`                            |
| New API error class   | `packages/api/src/errors.ts` + re-export from `index.ts`                                |
| New auth adapter      | `packages/auth-adapters/src/<provider>.ts` + re-export from `index.ts`                  |
| New shared config     | `packages/config/<tool>/index.ts` + add sub-path in `package.json` exports              |
| Add a Storybook story | `packages/ui/src/components/Name/Name.stories.tsx`                                      |
| Version bump          | `pnpm changeset` → `pnpm changeset version` → commit                                    |

## File Naming Conventions

- Component folders: `PascalCase` matching export name
- Story files: `ComponentName.stories.tsx`
- Utility files: `kebab-case` domain name (e.g., `array.ts`, `date.ts`)
- Config files: `index.ts` or `index.json` under the tool subfolder
- All barrel exports: `index.ts`
