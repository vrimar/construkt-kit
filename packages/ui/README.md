# @construkt-kit/ui

60+ UI components for Construkt Kit apps, built on Panda CSS and Ark UI primitives.

> **Rule:** Consumers import from `@construkt-kit/ui`. UI implementation code imports Panda helpers from `@construkt-kit/styled-system/*`.

## Exports

### Components

**Layout:** `Box`, `Flex`, `Stack`, `HStack`, `VStack`, `Center`, `Container`, `Grid`, `GridItem`, `Spacer`, `Float`, `Separator` (alias `Divider`), `Divider`, `Wrap`

**Buttons:** `Button`, `IconButton`, `TooltipIconButton`, `DeleteButton`, `EditButton`, `CloseButton`, `SelectButton`, `ButtonGroup`

**Data Display:** `DataTable`, `Badge`, `Avatar`, `Image`, `List`, `Table`, `Stat`, `EmptyState`, `Card`, `Carousel`, `Code`, `DisplayValue`, `Kbd`

**Feedback:** `Alert`, `LoadingOverlay`, `Toaster` / `toaster`, `Progress`, `Skeleton`, `Spinner`

**Overlay / Dialog:** `Dialog`, `SubmitDialog`, `DeleteDialog`, `Drawer`, `Popover`, `Tooltip`, `ToggleTip`, `HoverCard`

**Form:** `Form`, `Fieldset`, `Input`, `Textarea`, `InputGroup`, `PasswordInput`, `SearchInput`, `MultiLineInput`, `NumberInput`, `Checkbox`, `CheckboxCard`, `Switch`, `Radio` / `RadioGroup`, `RadioCard`, `Slider`, `TagsInput`, `Editable`, `FileUpload`, `PinInput`, `ColorPicker`

**Selection / Dropdowns:** `Select`, `SelectList`, `SelectListItem`, `SelectButton`, `TagSelect`, `ApplySelect`, `Combobox`

**Tree:** `TreeView`, `useTreeView`, `TreeSelectList`, `createTreeCollection`, `createFileTreeCollection`

**Date Pickers:** `Calendar`, `DatePicker`, `DatePickerSelect`

**Navigation & Text:** `Link`, `Tabs`, `Accordion`, `Breadcrumb`, `Menu`, `ContextMenu`, `Text`, `TextLabel`, `TruncatedText`, `Heading`, `Span`, `SearchHighlight`, `useHighlight`

**Misc:** `Actionbar`, `Clipboard`, `Collapsible`, `Icon`, `Logo`, `Pagination`, `RatingGroup`, `ScrollArea`, `SegmentGroup`, `Splitter`, `ToggleGroup`, `DebugFontSwitcher`, `Provider`

### Hooks

| Hook               | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `useAutoFocus`     | Auto-focus + optional select on mount                      |
| `useDebounceQuery` | Immediate + debounced search query state                   |
| `useFileSelect`    | Opens native file picker, returns parsed files             |
| `useRowSelection`  | Row selection state for tables (toggle, togglePage, clear) |

### Panda CSS Utilities

```tsx
import { css, cx, styled } from "@construkt-kit/ui";
import type { HTMLStyledProps, StyledComponent } from "@construkt-kit/ui";
import { token } from "@construkt-kit/ui"; // design token accessor
```

### Types

`WithRef<T, E>` — generic ref forwarding type.

## Variant Vocabulary

`solid` > `surface` > `subtle` > `outline` > `plain`. See `../preset/src/theme/recipes/README.md` for full reference.

## Component Structure

Each component under `src/components/<Name>/` follows this pattern:

- `index.tsx` — public exports (re-exported in `components/index.tsx`)
- `<Name>.tsx` — main component implementation
- `<Name>.stories.tsx` — Storybook stories
- `types.ts` — (optional) component-specific types

Compound components (DataTable, Dialog, Menu, etc.) may have subfolders for sub-parts (e.g. `DataTable/Header/`, `DataTable/Body/`).

## Implementation Patterns

### 1. Simple styled component (Badge, Input, Textarea)

One-liner. Use when wrapping a single element with a recipe:

```tsx
import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import { badge } from "@construkt-kit/styled-system/recipes";

export type BadgeProps = ComponentProps<typeof Badge>;
export const Badge = styled(ark.div, badge);
```

For Ark UI field primitives: `export const Input = styled(Field.Input, input);`

### 2. Compound component with style context (Dialog, Menu, Tabs)

Use `createStyleContext(recipe)` to wrap Ark UI compound parts with slot-based styling:

```tsx
import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { dialog } from "@construkt-kit/styled-system/recipes";

const { withRootProvider, withContext } = createStyleContext(dialog);

const Root = withRootProvider(ArkDialog.Root, { defaultProps: { unmountOnExit: true, lazyMount: true } });
const Content = withContext(ArkDialog.Content, "content");  // "content" = slot name in recipe
const Title = withContext(ArkDialog.Title, "title");

export const Dialog = { Root, Content, Title, ... };  // Export as plain object
```

- Each sub-component is a "slot" in the recipe — Panda generates e.g. `dialog__content`, `dialog__title`
- Export as a **plain object** with capitalized properties → `<Dialog.Root>`, `<Dialog.Content>`
- Slot recipes use `sva()` (slot variant authority)

### 3. Compound with custom context (Select, ButtonGroup)

Adds app-level React context on top of the style context pattern:

```tsx
// ButtonGroup provides variant props to all child Buttons via context
const [ButtonPropsProvider, useButtonPropsContext] = createContext<ButtonVariantProps>({
  strict: false,
});

export const ButtonGroup = ({ ref, ...props }) => {
  const [variantProps, otherProps] = button.splitVariantProps(props);
  return (
    <ButtonPropsProvider value={variantProps}>
      <Group
        ref={ref}
        {...otherProps}
      />
    </ButtonPropsProvider>
  );
};

// Child Button merges inherited props from context
export const Button = ({ ref, ...props }) => {
  const propsContext = useButtonPropsContext();
  const mergedProps = mergeProps(propsContext, { ref, ...props });
  // ...
};
```

Key utilities:

- `splitVariantProps(props)` — separates recipe variant props (`variant`, `size`) from other props
- `mergeProps()` — merges context-inherited props with local props (local wins)
- `strict: false` — context is optional; component works standalone too

## Theme Architecture

`@construkt-kit/preset` exports `construktKitPreset`, re-exported from `src/preset.ts` for compatibility, assembled from:

- `../preset/src/theme/tokens/` — primitive tokens (colors, spacing, fonts, radii, etc.)
- `../preset/src/theme/semantic-tokens/` — light/dark mode tokens (`colors.ts`, `shadows.ts`)
  - `colorPalette(color)` generates `solid`, `surface`, `subtle`, `outline`, `plain` sub-tokens
  - Available palettes: `brand`, `slate`, `gray`, `blue`, `red`, `green`, `orange`, `yellow`
  - `neutral` is an alias palette (defaults to slate) used for default chrome
- `../preset/src/theme/recipes/` — component recipes (variants, sizes, defaults)
- `../preset/src/theme/conditions.ts` — custom Panda CSS conditions
- `../preset/src/theme/keyframes.ts`, `animation-styles.ts`, `text-styles.ts`, `layer-styles.ts`

### `@construkt-kit/styled-system` is the shared Panda runtime

- `@construkt-kit/styled-system` is the generated Panda runtime package shared by `@construkt-kit/ui` and consuming apps
- Imports like `@construkt-kit/styled-system/jsx`, `@construkt-kit/styled-system/css`, and `@construkt-kit/styled-system/recipes` resolve through that workspace package
- `@pandacss/dev` is the **build-time tool** — used in `@construkt-kit/preset`, `@construkt-kit/styled-system`, and app-level Panda configs
- `@construkt-kit/ui` treats `@construkt-kit/styled-system` as an external runtime dependency during dist builds

### Token Path Syntax

| Context               | Syntax             | Example                       |
| --------------------- | ------------------ | ----------------------------- |
| In recipe definitions | Bare token paths   | `bg: "colorPalette.solid.bg"` |
| Token references      | Curly braces       | `{colors.brand.500}`          |
| In components (JS)    | `token()` function | `token('colors.brand.500')`   |
| In components (CSS)   | Short paths        | `css({ bg: 'brand.500' })`    |

Semantic token layers: `bg.*`, `fg.*`, `border.*`, `neutral.*`, `colorPalette.*`

### Condition Overrides

The theme redefines standard pseudo-selectors:

| Condition           | Behavior                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `_hover`, `_active` | Exclude `:disabled` — disabled elements don't show hover/active                                  |
| `_checked`          | Matches 4 selectors: `:checked`, `[data-checked]`, `[data-state=checked]`, `[aria-checked=true]` |
| `_focusVisible`     | Uses `[data-focus-visible]` NOT `:focus-visible` — Ark UI keyboard-only detection                |
| `_light`            | `:root &, .light &` — explicit light mode                                                        |

### recipes vs slotRecipes

Both are registered in `../preset/src/theme/recipes/index.ts`:

- **`recipes`** (simple `cva()`): `badge`, `button`, `code`, `heading`, `icon`, `input`, `kbd`, `link`, `skeleton`, `spinner`, `text`, `textarea`, etc. — single-element components
- **`slotRecipes`** (compound `sva()`): `accordion`, `dialog`, `menu`, `select`, `tabs`, etc. — multi-slot components using `createStyleContext()`
- Naming exception: `switchRecipe` key (not `switch` — JS reserved word)

## File Map

| Path                                   | Purpose                                         |
| -------------------------------------- | ----------------------------------------------- |
| `src/index.ts`                         | Public barrel export                            |
| `src/preset.ts`                        | Compatibility re-export of `construktKitPreset` |
| `src/types.ts`                         | Shared types (`WithRef`, etc.)                  |
| `src/components/index.tsx`             | Component barrel export                         |
| `src/components/<Name>/`               | Individual component folders                    |
| `src/hooks/`                           | Shared hooks                                    |
| `../preset/src/theme/recipes/`         | All component recipes                           |
| `../preset/src/theme/tokens/`          | Primitive design tokens                         |
| `../preset/src/theme/semantic-tokens/` | Semantic tokens (light/dark)                    |
| `../styled-system/dist/`               | Shared Panda CSS generated runtime              |
| `panda.config.ts`                      | Panda CSS config                                |

## Common Patterns

### Creating a new component

1. Create folder `src/components/<Name>/`
2. Add `index.tsx` with named exports
3. Add recipe in `../preset/src/theme/recipes/<name>.ts` if styling is needed
4. Register recipe in `../preset/src/theme/recipes/index.ts` (in `recipes` or `slotRecipes`)
5. Re-export from `components/index.tsx`
6. Re-export from `src/index.ts` (if not already covered by `components/` barrel)

### Styling

- Use `css()` for one-off styles, `styled()` for styled components, recipes for variants
- Colors: `token('colors.brand.500')` or `colorPalette` prop + recipe variants
- Never use hardcoded colors (`#fff`, `rgb(...)`) — the Panda linter will reject them

### Consuming @construkt-kit/ui in apps

Apps configure `panda.config.ts` with `presets: ["@pandacss/preset-base", construktKitPreset]` and `importMap: "@construkt-kit/styled-system"`.
Path alias `@construkt-kit/ui` → `packages/ui/src` resolved by Vite/tsconfig.

Published consumers that do not scan `@construkt-kit/ui` source can include `@construkt-kit/ui/panda.buildinfo.json`
in their Panda `include` list instead.

## Testing

- **Runner:** Vitest with jsdom environment
- **Setup:** `vitest.setup.ts` polyfills `ResizeObserver` and `IntersectionObserver` (not in jsdom)
- **Aliases:** `@construkt-kit/styled-system` → `../styled-system/dist` in `vitest.config.ts`
- **Libraries:** `@testing-library/react` + `userEvent` for component interaction tests
- **Pattern:** Tests verify non-obvious UX (e.g., interactive descendants in Select items don't trigger selection)

## Ark UI MCP

Use the Ark UI MCP tools to look up Ark UI component props and examples when implementing or customizing components. Components are built on Ark UI primitives, so these tools are relevant for understanding component behavior, props, and theming at the primitive level.
