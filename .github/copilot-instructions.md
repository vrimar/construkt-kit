# @b3/\* Shared Library

Monorepo providing `@b3/*` packages. Uses **pnpm workspaces**, **Turbo** (`pnpm turbo dev`), **Tsup**, **Changesets**.

## Packages

- **`@b3/ui`** — 55+ Chakra UI v3 components. Always import from `@b3/ui`, never `@chakra-ui/*`.
  - Components: `DataTable`, `Button`, `Input`, `Dialog`, `Select`, `Drawer`, `Menu`, `Tabs`, `Field`, `Toaster`, `toaster`, `Box`, `Flex`, `Stack`, `HStack`, `Badge`, `Alert`, `LoadingOverlay`, `EmptyState`, `Avatar`, `Link`, `Tooltip`, `Popover`, `ContextMenu`, `Accordion`, `Splitter`, `Table`, `Tree`, `TreeSelect`, `ListBox`, `DatePicker`, `ScrollArea`, `ApplyInput`, `ApplySelect`, `EditableText`, `Logo`, `NumberInput`, `Stat`, `Checkbox`, `CheckboxCard`, `Radio`, `Switch`, `Slider`, `Text`, `Image`, `Wrap`, `ToggleTip`, `DebugFontSwitcher`, `FileUpload`, `Clipboard`, `Collapsible`, `ColorPicker`, `Editable`, `Highlight`, `TagsInput`, `RadioCard`, `Actionbar`, `Form`
  - Hooks: `useAutoFocus`, `useDebounceQuery`, `useFileSelect`, `useRowSelection`
  - Theme: `designSystem` (Chakra v3 with custom tokens/recipes/slotRecipes)
  - Types: `WithRef<T, E>`
- **`@b3/api`** — `ApiError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ApiErrorResponse`
- **`@b3/utils`** — `buildQueryString`, `addOrRemove`, `findInTree`, `toCamelCase`, `toInt`, `formatDateDefault`, `formatCurrency`, `objectKeys`, `emailSchema`/`phoneSchema`/`passwordSchema` (Zod)
- **`@b3/pages`** — `LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`; types: `AuthProvider`, `User`, `LoginOptions`, `LoginPageProps`, `ForgotPasswordPageProps`, `ResetPasswordPageProps`
- **`@b3/config`** — Importable as `@b3/config/typescript`, `/vite`, `/oxlint`, `/oxfmt`, `/playwright`
- **`@b3/auth-adapters`** — `createAuth0AuthProvider()`
- **`@b3/testing`** — Test infrastructure (MSW request handlers for Storybook)

## Conventions

- Named exports only (no default exports)
- Source under `packages/<name>/src/`, each with `tsconfig.json` + `tsup.config.ts`
- Consumed via path aliases (e.g., `@b3/ui` → `packages/ui/src`)

## Ark UI MCP

Use the Ark UI MCP tools to look up Ark UI component props and examples when implementing or customizing `@b3/ui` components. Chakra UI v3 is built on Ark UI primitives, so these tools are relevant for understanding component behavior, props, and theming at the primitive level.
