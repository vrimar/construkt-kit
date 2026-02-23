# @b3/\* Shared Library - Project Guidelines

## Overview

This is a **monorepo** providing shared packages consumed by multiple applications as `@b3/*` imports.

## Package Manager & Build

- **pnpm workspaces** for dependency management
- **Turbo** for task orchestration (`pnpm turbo dev` to watch all packages)
- **Tsup** for bundling TypeScript packages
- **Changesets** for versioning

## Packages

### `@b3/ui` — Component Library

40+ Chakra UI v3 components with custom theme. Always import from `@b3/ui`, never directly from `@chakra-ui/*`.

Key exports: `DataTable`, `Button`, `Input`, `Dialog`, `DeleteDialog`, `SubmitDialog`, `Select`, `Drawer`, `Menu`, `Tabs`, `Field`, `ThemeProvider`, `Toaster`, `toaster`, `Box`, `Flex`, `Stack`, `HStack`, `Badge`, `Alert`, `ApiErrorAlert`, `LoadingOverlay`, `EmptyState`, `Avatar`, `Link`, `Tooltip`.

Hooks: `useAutoFocus`, `useDebounceQuery`, `useFileSelect`, `useRowSelection`.

DataTable types: `DataTableParams`, `DataTableDto<T>`, `DataTableFilters`, `Column<TData>`, `DataTableProps`.

### `@b3/api` — API Client Framework

Framework-agnostic HTTP client contract.

- `ApiError`, `ValidationError`, `NotFoundError`, `UnauthorizedError` — typed error classes
- `ApiErrorResponse` — `{ Message: string }`
- `createApiFactory(callFn, options?)` — factory for creating scoped API contexts

### `@b3/utils` — Utility Functions

- **Query:** `buildQueryString(obj)`, `saveBlobResponse()`, `downloadFile()`
- **Array:** `addOrRemove()`, `findInTree()`, `transformArray()`
- **String:** `toCamelCase()`, `toInt()`, `isStrictlyNumeric()`
- **Date:** `formatDateDefault()`, `formatDateRelative()`
- **Format:** `formatCurrency()`, `formatDate()`, `formatNumber()`
- **Object:** `objectKeys()`, `toKeyValue()`, `isPlainObject()`
- **Validation:** `emailSchema`, `phoneSchema`, `passwordSchema`, `loginSchema` (Zod)

### `@b3/pages` — Pre-Built Auth Pages

`LoginPage`, `RegisterPage`, `ForgotPasswordPage` — ready-made auth UI.

Types: `AuthProvider` (adapter interface), `User`, `LoginOptions`.

### `@b3/config` — Shared Tool Configs

Importable as `@b3/config/eslint`, `@b3/config/vite`, `@b3/config/typescript`, `@b3/config/prettier`, `@b3/config/playwright`, `@b3/config/oxlint`.

### `@b3/auth-adapters` — Auth Provider Adapters

`createAuth0AuthProvider()` — Auth0 implementation of `AuthProvider`.

## Conventions

- Use **named exports** (no default exports for components)
- All component source is under `packages/<name>/src/`
- Each package has its own `tsconfig.json` and `tsup.config.ts`
- This library is consumed by apps via path aliases (e.g., `@b3/ui` maps to `packages/ui/src`)
