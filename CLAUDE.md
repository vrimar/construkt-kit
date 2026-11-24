# Construkt Kit Frontend Shared — AI Instructions

Monorepo providing `@construkt-kit/*` packages. Uses **pnpm workspaces**, **Turbo**, **Tsdown**. Releases publish from CI on a `release-*` tag — see `.github/workflows/release.yml`. `pnpm release:prepare` gets one ready and prints the commit, push and tag commands; accepting screenshot baselines, pushing and tagging wait for the owner to ask.

> For per-package details (exports, patterns, architecture), see `README.md` in each package under `packages/`.

## Packages

- **`@construkt-kit/ui`** — 60+ UI components built on Panda CSS and the kit's own React primitives (`packages/ui/src/primitives/`). Always import components from `@construkt-kit/ui`.
- **`@construkt-kit/api`** — Kubb client configuration (`configureApiClient`), typed error classes (`ApiError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`), data-table types.
- **`@construkt-kit/utils`** — Stateless utilities: arrays, dates, enums, numbers, objects, query strings, validation schemas (Zod).
- **`@construkt-kit/pages`** — Shared auth pages (`LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`) with adapter-based auth.
- **`@construkt-kit/data-grid`** — Virtualized, Excel-like grid. Ships its `dataGrid` recipe as an opt-in Panda preset (`import { dataGridPreset } from "@construkt-kit/data-grid/preset"`, then `presets: [dataGridPreset]`); not a Panda design system.
- **`@construkt-kit/config`** — Shared tool configs: `@construkt-kit/config/typescript`, `/vite`, `/vitest`, `/tsdown`, `/oxlint`, `/oxfmt`, `/playwright`, `/kubb`.
- **`@construkt-kit/testing`** — Playwright helpers for apps' end-to-end tests: gestures, API request recording and failure injection, overlay waits, platform emulation, sign-in, per-worker servers, the requirement coverage reporter. Component helpers live beside their components as each package's `/testing` subpath.
- **`@construkt-kit/story-kit`** — Private. The Storybook preview every story imports, the typed story-id list, and the Playwright story-test harness. See `packages/story-kit/README.md`.

## Build & Dev Commands

| Command                     | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| `pnpm install`              | Install all workspace dependencies                    |
| `pnpm dev`                  | Dev mode (watch + rebuild all pkgs)                   |
| `pnpm build`                | Build all packages (`dist/`)                          |
| `pnpm test`                 | Run all tests                                         |
| `pnpm test:browser`         | Run Vitest browser-mode tests (all three engines)     |
| `pnpm test:stories`         | Test every story and behaviour spec                   |
| `pnpm test:stories:changed` | Only what a change since `origin/main` affects        |
| `pnpm check:stories`        | Every export has a story; overlays covered            |
| `pnpm typecheck`            | Type-check all packages                               |
| `pnpm lint`                 | Build what lint reads, then lint in one pass          |
| `pnpm format`               | Format the repo in one pass (oxfmt)                   |
| `pnpm verify`               | Format, lint, typecheck, test, build and checks       |
| `pnpm verify:node`          | `verify` without browser tests (CI's `verify` job)    |
| `pnpm storybook`            | Start Storybook dev server                            |
| `pnpm release:prepare`      | Bump, changelog and gate a release; lists what's left |
| `pnpm release`              | Build, gate exports, publish to npm                   |

Build/dev/test/typecheck go through Turbo per package (`turbo run <task>` via root scripts).
Lint is a single root-level pass over the whole repo — the root task `//#lint:oxlint`, which
`pnpm lint` runs once the builds its type-aware rules read are done — because oxlint honours
`options.typeAware` only in the config it loads as its root.

## Conventions

- Named exports only (no default exports)
- Source under `packages/<name>/src/`, each with `tsconfig.json` + `tsdown.config.ts`
- React 19 peer dep (`^19.3.0`)
- No `@ark-ui/*` or `@zag-js/*` in the kit — build behaviour on `packages/ui/src/primitives/`; lint bans the imports
- Consuming apps import `css`/`cx`/`styled`/`token` and Panda's types from their own generated `styled-system/`, through the specifier their Panda `importMap` names (an alias such as `@construkt-kit/styled-system/*` is fine) — never from `@construkt-kit/ui` or `@construkt-kit/pages`, which Panda doesn't extract from and whose `token` knows only the kit's theme
- Inside `packages/data-grid/src`: no `css()`, `styled`, patterns, `*Css` props or style props on components — no Panda build extracts that source. Style through the `dataGrid` recipe, inline geometry and CSS variables; `construkt/no-literal-style-props` and `no-restricted-imports` enforce it. `*.stories.tsx` may use style and `*Css` props (Storybook's Panda extracts them), not the imports. `src/core/**` imports no `react`, `react-dom`, `@construkt-kit/ui` or Panda
- Don't name a non-style component prop after a CSS property (`content`, `width`, `fill`, …) — Panda extracts it as a style from every PascalCase JSX element, and free text there emits invalid CSS. `construkt/no-style-prop-name` enforces this in the kit and, through `@construkt-kit/config/oxlint`, in consuming apps
- Never use hardcoded colors — use Panda tokens
- Never import between packages via relative paths — use `@construkt-kit/*` aliases
- `react` / `react-dom` are peer deps — never add to `dependencies`
- `styled-system/` directories are Panda CSS generated output — never edit manually

## Story Tests

Every story is a test: `pnpm test:stories` renders each one alone at desktop (1280×900) and phone (390×844, touch),
runs axe, compares its accessibility tree and, in the pinned browser container, a full-page screenshot. Behaviour
specs (`packages/*/src/**/*.spec.ts`) drive stories with real keyboard, mouse and touch.

- After any UI change run `pnpm test:stories:changed`; before finishing run `pnpm test:stories`
- A failure is real. Read `apps/storybook/.stories-report/report.md` and, for a visual failure, open its image
  (reference | actual | diff). Fix the code
- Never pass `-u`/`--update-snapshots`, copy PNGs into `__baselines__`, loosen screenshot options, disable an axe
  rule to get green, or tag a story out of a device. For an intended visual change, report the story
  ids and the reason; when the owner says accept, run `pnpm stories:accept <story id>… --reason "…"` yourself
- An intended accessibility-tree change: `pnpm stories:aria <story id>…`, then commit the `.aria.yml` diff
- An `unstable` failure means the story is not deterministic; fix the story, never accept it
- No Docker means a functional run only (no pixels); say so when reporting
- A new exported component gets a story. A new overlay gets an `open-state` story, and if it opens as a phone sheet,
  a case in `packages/ui/src/components/sheetFrame.cases.ts`. After adding or renaming stories run `pnpm stories:ids`
- Stories hold states only, never `play`. A change to focus, keyboard, dismissal or open/close logic the kit owns adds
  or extends a behaviour spec, and you must be able to name the wrong change it catches that nothing else does

## Package Dependency Graph

```
@construkt-kit/config         ← all packages (tool configs)
@construkt-kit/utils          ← @construkt-kit/api, @construkt-kit/ui, @construkt-kit/pages, @construkt-kit/data-grid, consuming apps
@construkt-kit/ui             ← @construkt-kit/pages, @construkt-kit/data-grid, consuming apps  (depends on @construkt-kit/utils)
@construkt-kit/pages          ← consuming apps  (defines AuthProvider interface, depends on @construkt-kit/ui)
@construkt-kit/data-grid      ← consuming apps  (depends on @construkt-kit/utils, peer-depends on @construkt-kit/ui; preset opt-in)
@construkt-kit/api            ← consuming apps  (configures the generated Kubb fetch client)
@construkt-kit/testing        ← story-kit, consuming apps' e2e suites  (peer-depends on @playwright/test)
```

## Design Principles

- **Adapter pattern** — auth pages accept interfaces, not specific SDKs
- **Callback-driven** — pages/components use callbacks for navigation, never import a router
- **Factory functions** — configs export `createXConfig()`, API exports `configureApiClient()`
- **Stateless utilities** — `@construkt-kit/utils` has no framework deps, no side effects
