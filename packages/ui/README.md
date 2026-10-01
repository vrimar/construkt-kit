# @construkt-kit/ui

60+ UI components for Construkt Kit apps, built on Panda CSS and Ark UI primitives.

> **Rule:** Consumers import from `@construkt-kit/ui`. UI implementation code imports Panda helpers from `#styled-system/*`.

## Exports

### Components

**Layout:** `Box`, `Flex`, `Stack`, `HStack`, `VStack`, `Center`, `Container`, `Grid`, `GridItem`, `Spacer`, `Float`, `Separator` (alias `Divider`), `Divider`, `Wrap`, `SimpleGrid`

**Buttons:** `Button`, `IconButton`, `TooltipIconButton`, `DeleteButton`, `EditButton`, `CloseButton`, `SelectButton`, `ButtonGroup`

**Data Display:** `DataTable`, `Badge`, `Avatar`, `Image`, `List`, `Table`, `Stat`, `EmptyState`, `Card`, `Carousel`, `Code`, `DisplayValue`, `Kbd`

**Feedback:** `Alert`, `LoadingOverlay`, `Toaster` / `toaster`, `Progress`, `Skeleton`, `Spinner`

**Overlay / Dialog:** `Dialog`, `SubmitDialog`, `DeleteDialog`, `Drawer`, `Popover`, `Tooltip`, `ToggleTip`, `InfoTip`, `HoverCard`

**Form:** `Field`, `SubmitForm`, `Fieldset`, `Input`, `Textarea`, `InputGroup`, `PasswordInput`, `SearchInput`, `NumberInput`, `Checkbox`, `CheckboxCard`, `Switch`, `Radio` / `RadioGroup`, `RadioCard`, `Slider`, `TagsInput`, `Editable`, `FileUpload`, `FormFileUpload`, `PinInput`, `ColorPicker`

**Selection / Dropdowns:** `Select`, `Listbox`, `SelectButton`, `TagSelect`, `ApplySelect`, `Combobox` — the managed `Select`/`Listbox` families take `groupBy` / `groupSort` for group headings

**Tree:** `TreeView`, `useTreeView`, `TreeSelectList`, `createTreeCollection`, `createFileTreeCollection`

**Date Pickers:** `Calendar`, `DatePicker`, `DatePickerSelect`

**Navigation & Text:** `Link`, `Tabs`, `Accordion`, `Breadcrumb`, `Menu`, `Text`, `Heading`, `Span`, `SearchHighlight`, `useHighlight`

**Misc:** `ActionBar`, `Clipboard`, `Collapsible`, `Icon`, `NumberFilter`, `Pagination`, `Portal`, `RatingGroup`, `ScrollArea`, `SegmentGroup`, `Splitter`, `ThemeToggle`, `ToggleGroup`

### Hooks

| Hook                                    | Description                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `useAutoFocus`                          | Auto-focus + optional select on mount                           |
| `useControlledMirror`                   | Mirror a controlled value into local state, ignoring its echoes |
| `useDebounceQuery`                      | Immediate + debounced search query state                        |
| `useFileSelect`                         | Opens native file picker, returns parsed files                  |
| `useMediaQuery`                         | Subscribe to a CSS media query                                  |
| `useBreakpointUp` / `useBreakpointDown` | Whether the viewport is at/above or below a breakpoint          |
| `useIsMobile`                           | Whether the viewport is below the `md` breakpoint               |
| `useRowSelection`                       | Row selection state for tables (toggle, togglePage, clear)      |

### Panda CSS Utilities

```tsx
import { css, cx, styled } from "@construkt-kit/ui";
import type { HTMLStyledProps, StyledComponent } from "@construkt-kit/ui";
import { token } from "@construkt-kit/ui"; // design token accessor
```

### Types

`WithRef<T, E>` — generic ref forwarding type. `PortalledProps` — the `portalled` / `portalRef` pair on overlay content.

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

### 1. Simple styled component (Badge, Input, Text)

One-liner. Use when wrapping a single element with a recipe:

```tsx
import { ark } from "@ark-ui/react/factory";
import { styled } from "#styled-system/jsx";
import { badge } from "#styled-system/recipes";

export type BadgeProps = ComponentProps<typeof Badge>;
export const Badge = styled(ark.div, badge);
```

For Ark UI field primitives: `export const Input = styled(Field.Input, input);`

### 2. Compound component with style context (Dialog, Menu, Tabs)

Use `createSlotRecipeContext(recipe)` to wrap Ark UI compound parts with slot-based styling:

```tsx
import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { createSlotRecipeContext } from "#styled-system/jsx";
import { dialog } from "#styled-system/recipes";

const { withRootProvider, withContext } = createSlotRecipeContext(dialog);

const Root = withRootProvider(ArkDialog.Root, { defaultProps: lazyOverlayDefaults });
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

`@construkt-kit/preset` exports `construktKitPreset`, assembled from:

- `../preset/src/theme/tokens/` — primitive tokens (colors, spacing, fonts, radii, etc.)
- `../preset/src/theme/semantic-tokens/` — light/dark mode tokens (`colors.ts`, `shadows.ts`)
  - `colorPalette(color)` generates `solid`, `surface`, `subtle`, `outline`, `plain` sub-tokens
  - Available palettes: `brand`, `slate`, `gray`, `blue`, `red`, `green`, `orange`, `yellow`
  - `neutral` is an alias palette (defaults to slate) used for default chrome
- `../preset/src/theme/recipes/` — component recipes (variants, sizes, defaults)
- `../preset/src/theme/conditions.ts` — custom Panda CSS conditions
- `../preset/src/theme/keyframes.ts`, `animation-styles.ts`, `text-styles.ts`, `layer-styles.ts`

### `styled-system/` is ui's own Panda runtime

- `panda codegen` generates it into `packages/ui/styled-system/` from `panda.config.ts`; source imports it as `#styled-system/*` through the `imports` field in `package.json`
- It ships with the package. `panda lib` exports it as `@construkt-kit/ui/{css,jsx,patterns,recipes,tokens}` and writes the design-system manifest to `panda/`
- `dist` imports it instead of bundling it, so an app on `designSystem: "@construkt-kit/ui"` generates a `styled-system/` that re-exports this runtime; an app on `@construkt-kit/pages`, a nested design system, generates a full local copy
- `@pandacss/dev` is the **build-time tool** — used in `@construkt-kit/preset`, ui, pages and app-level Panda configs

Consequence for downstream presets: shipped prop types carry construkt's own
recipe variants, frozen at build time. A preset that adds a variant value still
styles correctly — recipe class names are string-interpolated and the app's own
Panda build emits the CSS — but will not typecheck. Extend the system through
`colorPalette` and `textStyle` rather than new variant names; a new variant
_key_ is worse still, since it reaches the DOM as a stray attribute and ui's
runtime ignores downstream `compoundVariants` and `defaultVariants`.

A recipe's own properties outrank the values of a `textStyle` it applies, so
overriding a text style only changes what the recipe leaves unset. Slots that
apply the `label` text style set no color, so an app's `label` text style can.

Merging over a ckit recipe works but logs `design_system_artifact_conflict` on
every Panda run, and only a global `logLevel` silences it. Reach for a token
first — `fonts.heading` sets the `Heading` face, the `label` text style styles
form labels — and keep recipe merges for real restyles, accepting the warning.

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
| `_light`            | `:root &, .light &` — explicit light mode                                                        |

### Dark mode

Every semantic token carries a light and a dark value, so dark mode is a token flip — no per-component work. Activation is a `dark` class on an ancestor (Panda's `_dark: .dark &` condition); light is the `:root` default (no class needed). The neutral chrome (`bg`/`fg`/`border`/`neutral.*`) uses the **Radix "slate" dark ramp** (`colors.slateDark.1–12`) on the dark side while light stays Tailwind slate. `html { color-scheme }` also flips so native scrollbars, form controls, and autofill match.

The runtime lives in `@construkt-kit/ui`:

```tsx
import { ColorModeProvider, useColorMode, ThemeToggle, colorModeScript } from "@construkt-kit/ui";

// 1. Wrap the app. defaultMode: "light" | "dark" | "system" (default "system").
<ColorModeProvider defaultMode="system">
  <App />
</ColorModeProvider>;

// 2. (Optional) inline in <head> before hydration to avoid a light-mode flash:
//    <script dangerouslySetInnerHTML={{ __html: colorModeScript }} />
//    For a non-"system" default, match it: createColorModeScript({ defaultMode: "dark" }).

// 3. Read/set the mode anywhere under the provider:
const { mode, resolvedMode, setMode, toggle } = useColorMode();

// 4. Or drop in the prebuilt button:
<ThemeToggle />;
```

`ColorModeProvider` toggles the `dark` class on `<html>` (the preset flips `color-scheme` from it), resolves `"system"` via `prefers-color-scheme`, and persists the choice to `localStorage` (`construkt-color-mode`). In Storybook, use the toolbar theme switcher (`@storybook/addon-themes`) to preview any story in dark.

### recipes vs slotRecipes

Both are registered in `../preset/src/theme/recipes/index.ts`:

- **`recipes`** (simple `cva()`): `badge`, `button`, `code`, `heading`, `icon`, `input`, `kbd`, `link`, `skeleton`, `spinner`, `text`, `textarea`, etc. — single-element components
- **`slotRecipes`** (compound `sva()`): `accordion`, `dialog`, `menu`, `listbox`, `tabs`, etc. — multi-slot components using `createSlotRecipeContext()`
- Naming exception: `switchRecipe` key (not `switch` — JS reserved word)

## File Map

| Path                                   | Purpose                                         |
| -------------------------------------- | ----------------------------------------------- |
| `src/index.ts`                         | Public barrel export                            |
| `src/types.ts`                         | Shared types (`WithRef`, etc.)                  |
| `src/components/index.tsx`             | Component barrel export                         |
| `src/components/<Name>/`               | Individual component folders                    |
| `src/hooks/`                           | Shared hooks                                    |
| `../preset/src/theme/recipes/`         | All component recipes                           |
| `../preset/src/theme/tokens/`          | Primitive design tokens                         |
| `../preset/src/theme/semantic-tokens/` | Semantic tokens (light/dark)                    |
| `styled-system/`                       | Generated Panda runtime (shipped, gitignored)   |
| `panda.config.ts`                      | Panda CSS design-system config                  |
| `scripts/patch-panda-jsx-types.mjs`    | Exports slot-recipe component types after codegen |
| `oxlint-panda.mjs`                     | Panda lint rules bound to `panda.config.ts`     |
| `layers.css`                           | Cascade layer order apps import in entry CSS    |

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

ui is a Panda design system. Apps run `@pandacss/dev` 2.x and point `designSystem` at it; the manifest
supplies the preset, preflight, JSX framework, every recipe variant and ui's extracted styles:

```ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  designSystem: "@construkt-kit/ui",
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
```

`designSystem` takes one package, so apps that use `@construkt-kit/pages` name it instead — pages extends ui.
Do not list either package in `include` or add the preset by hand. Apps that import their generated `styled-system/`
through an alias (e.g. `@construkt-kit/styled-system`) set `importMap` to that alias.

The entry CSS keeps the usual layer line and imports ui's layer order after it. The import pins the recipe sublayer
order, which Panda's PostCSS plugin does not emit; without it slot recipes override plain recipes:

```css
@layer reset, base, tokens, recipes, utilities;
@import "@construkt-kit/ui/layers.css";
```

`@fontsource-variable/inter` is an optional peer: install it unless the app replaces the preset's `globalFontface`.
`@pandacss/dev` 2 depends on `@parcel/watcher`, whose install script pnpm flags until `allowBuilds` lists it. Its
prebuilt binaries ship as optional dependencies, so the script can stay off:

```yaml
# pnpm-workspace.yaml
allowBuilds:
  "@parcel/watcher": false
```

#### Upgrading from 0.7

- Replace `createConstruktPandaConfig` with `designSystem` as above, and add the `layers.css` import
- Drop `@construkt-kit/preset` from app dependencies and SSR `noExternal`; ui ships it as `panda/preset.mjs`
- Set `importMap` if the app imports its `styled-system/` through an alias
- Recipe properties now outrank the `textStyle` values they apply; see [Theme Architecture](#theme-architecture)
- Only real style props are extracted. Panda 1 also read literals passed to components whose name contains a recipe's
  (`columns={[{ width: "320px" }]}` on `StatsTable`), so `width={column.width}` got CSS by accident; use `style` for
  values that only exist at runtime

## Testing

- **Runner:** Vitest with jsdom environment
- **Setup:** `vitest.setup.ts` polyfills `ResizeObserver`, `IntersectionObserver`, `scrollTo` and `matchMedia` (not in jsdom) and registers Testing Library's `cleanup` after each test
- **Aliases:** `@` → `src` in `vitest.config.ts`; `#styled-system/*` resolves through `package.json` `imports`
- **Libraries:** `@testing-library/react` + `userEvent` for component interaction tests
- **Pattern:** Tests verify non-obvious UX (e.g., interactive descendants in Select items don't trigger selection)

## Ark UI MCP

Use the Ark UI MCP tools to look up Ark UI component props and examples when implementing or customizing components. Components are built on Ark UI primitives, so these tools are relevant for understanding component behavior, props, and theming at the primitive level.
