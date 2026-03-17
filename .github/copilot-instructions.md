# @b3/\* Shared Library

Monorepo providing `@b3/*` packages. Uses **pnpm workspaces**, **Turbo** (`pnpm turbo dev`), **Tsdown**, **Changesets**.

## Packages

- **`@b3/ui`** — 60+ UI components built on Panda CSS + Ark UI primitives. Always import from `@b3/ui`, never `@ark-ui/*` or `styled-system/*`.
  - Components: `DataTable`, `Button`, `IconButton`, `TooltipIconButton`, `DeleteButton`, `EditButton`, `CloseButton`, `SelectButton`, `ButtonGroup`, `Input`, `Textarea`, `InputGroup`, `PasswordInput`, `SearchInput`, `MultiLineInput`, `Dialog`, `SubmitDialog`, `DeleteDialog`, `Select`, `SelectList`, `SelectListItem`, `TagSelect`, `Combobox`, `Drawer`, `Menu`, `ContextMenu`, `Tabs`, `Accordion`, `Breadcrumb`, `Form`, `Fieldset`, `Toaster`, `toaster`, `Box`, `Flex`, `Stack`, `HStack`, `VStack`, `Center`, `Container`, `Grid`, `GridItem`, `Spacer`, `Float`, `Separator`, `Divider`, `Wrap`, `Badge`, `Alert`, `LoadingOverlay`, `EmptyState`, `Avatar`, `Link`, `Tooltip`, `ToggleTip`, `HoverCard`, `Popover`, `Splitter`, `Table`, `TreeView`, `useTreeView`, `TreeSelectList`, `createTreeCollection`, `createFileTreeCollection`, `DatePicker`, `RangeDatePicker`, `DatePickerSelect`, `ScrollArea`, `ApplyInput`, `ApplySelect`, `EditableText`, `Editable`, `Logo`, `NumberInput`, `Stat`, `Checkbox`, `CheckboxCard`, `Radio`, `RadioGroup`, `RadioCard`, `Switch`, `Slider`, `Text`, `TextLabel`, `TruncatedText`, `Heading`, `Span`, `Image`, `ToggleGroup`, `DebugFontSwitcher`, `FileUpload`, `Clipboard`, `Collapsible`, `ColorPicker`, `SearchHighlight`, `useHighlight`, `TagsInput`, `Actionbar`, `Card`, `Carousel`, `Code`, `DisplayValue`, `Kbd`, `List`, `Pagination`, `PinInput`, `Progress`, `RatingGroup`, `SegmentGroup`, `Skeleton`, `Spinner`, `Icon`, `Provider`
  - Hooks: `useAutoFocus`, `useDebounceQuery`, `useFileSelect`, `useRowSelection`
  - Panda CSS utilities: `css`, `cx`, `styled`, `token`; types: `HTMLStyledProps`, `StyledComponent`
  - Theme: `b3Preset` (from `@b3/ui/preset`) — Panda CSS preset with brand tokens and semantic tokens.
  - Variant vocabulary: `solid` > `surface` > `subtle` > `outline` > `plain` (no `ghost`). See `src/theme/recipes/README.md`.
  - Types: `WithRef<T, E>`
- **`@b3/api`** — `createApiClient`, `setApiConfig`, `ApiError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ApiErrorResponse`, `DataTableParams`, `DataTableFilters`, `DataTableSortType`; re-exported types: `Client`, `RequestConfig`, `ResponseConfig`, `ResponseErrorConfig`
- **`@b3/utils`** — `buildQueryString`, `addOrRemove`, `addOrRemoveByKey`, `transformArray`, `findInTree`, `getFirstItemId`, `getLastItemId`, `toCamelCase`, `toInt`, `isStrictlyNumeric`, `formatDateDefault`, `formatDateRelative`, `isValidNumber`, `objectKeys`, `toKeyValue`, `isPlainObject`, `saveBlobResponse`, `downloadFile`, `isEnumKey`, `enumToKeys`, `enumToValues`, `enumToEntries`, `enumToOptions`, `enumValueToKey`, `fromEnum`, `mapEnumToFlags`, `toListItems`, `getEnumKeyByValue`, `emailSchema`/`phoneSchema`/`passwordSchema`/`loginSchema` (Zod)
- **`@b3/pages`** — `LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`; types: `AuthProvider`, `User`, `LoginOptions`, `LoginPageProps`, `ForgotPasswordPageProps`, `ResetPasswordPageProps`
- **`@b3/config`** — Importable as `@b3/config/typescript`, `/vite`, `/oxlint`, `/oxfmt`, `/playwright`, `/kubb`
- **`@b3/auth-adapters`** — `createAuth0AuthProvider()`
- **`@b3/testing`** — Test infrastructure (MSW request handlers for Storybook)

## Conventions

- Named exports only (no default exports)
- Source under `packages/<name>/src/`, each with `tsconfig.json` + `tsdown.config.ts`
- Consumed via path aliases (e.g., `@b3/ui` → `packages/ui/src`)

## Linting

- `@pandacss/eslint-plugin` configured in `.oxlintrc.json` — enforces `no-hardcoded-color`, `no-invalid-token-paths`, etc.
- Run `pnpm lint` (uses `oxlint -c .oxlintrc.json src`) to check for violations.

## Ark UI MCP

Use the Ark UI MCP tools to look up Ark UI component props and examples when implementing or customizing `@b3/ui` components. Components are built on Ark UI primitives, so these tools are relevant for understanding component behavior, props, and theming at the primitive level.
