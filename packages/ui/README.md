# @construkt-kit/ui

60+ UI components for Construkt Kit apps, built on Panda CSS and Ark UI primitives.

> **Rule:** Consumers import components from `@construkt-kit/ui` and Panda helpers from their own generated `styled-system/`. UI implementation code imports Panda helpers from `#styled-system/*`.

## Exports

### Components

**Layout:** `Box`, `Flex`, `Stack`, `HStack`, `VStack`, `Center`, `Container`, `Grid`, `GridItem`, `Spacer`, `Float`, `Separator`, `Wrap`, `SimpleGrid`

**Buttons:** `Button`, `IconButton`, `TooltipIconButton`, `DeleteButton`, `EditButton`, `CloseButton`, `SelectButton`, `ButtonGroup`

**Data Display:** `DataTable`, `Badge`, `Avatar`, `Image`, `List`, `Table`, `Stat`, `EmptyState`, `Card`, `Carousel`, `Code`, `DisplayValue`, `Kbd`

**Feedback:** `Alert`, `LoadingOverlay`, `Toaster` / `toaster`, `Progress`, `Skeleton`, `Spinner`

**Overlay / Dialog:** `Dialog`, `SubmitDialog`, `DeleteDialog`, `Drawer`, `Sheet`, `Popover`, `Tooltip`, `ToggleTip`, `InfoTip`, `HoverCard`

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
| `useFileSelect`                         | Returns a file-picker opener; `onSelect` gets the parsed files  |
| `useMediaQuery`                         | Subscribe to a CSS media query                                  |
| `useBreakpointUp` / `useBreakpointDown` | Whether the viewport is at/above or below a breakpoint          |
| `useIsMobile`                           | Whether the viewport is below the `md` breakpoint               |

### Panda CSS Utilities

ui does not re-export Panda's runtime or types. Apps import `css`, `cx`, `styled`, `token` and Panda's types from the
`styled-system/` their own Panda build generates, through the path their `importMap` names: Panda only extracts
styles from imports it matches, and the app's `token` and types know the app's theme extensions:

```tsx
import { css, cx } from "@construkt-kit/styled-system/css";
import { styled } from "@construkt-kit/styled-system/jsx";
import { token } from "@construkt-kit/styled-system/tokens";
import type { HTMLStyledProps, SystemStyleObject } from "@construkt-kit/styled-system/types";
```

### Types

`WithRef<T, E>` — generic ref forwarding type. `PortalledProps` — the `portalled` / `portalRef` pair on overlay content.
`CssProp` — the value of a `*Css` prop, typed with ui's theme. `Unstyled<P>` — `P` without style props or `*Css`
props, plus `data-*`, for objects of props an app forwards to ui.

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

Style props on ui components go through that same runtime, which knows only the preset's conditions, utilities,
shorthands and breakpoints. An app may override token values, but a condition, utility, shorthand or breakpoint it
adds works only through its own `css` and `styled`, never as a prop on a ui component.

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

| Condition           | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_hover`, `_active` | Also match `[data-hover]`/`[data-active]`, and skip `:disabled` and `[data-disabled]`. `_hover` applies only where the device can hover and ranks below every other condition, states (`_active`, `_checked`, `_selected`, `_focusVisible`…) as well as `_dark`, `_odd`/`_even` and the like, so a state keeps its look under the pointer; nest `_hover` inside the other condition (`_dark: { _hover: … }`) to style hovering there, or use a semantic token |
| `_checked`          | Matches 5 selectors: `:checked`, `[data-checked]`, `[data-state=checked]`, `[aria-checked=true]`, `[data-state=indeterminate]`                                                                                                                                                                                                                                                                                                                                |
| `_light`            | `:where(:root, .light) &` — explicit light mode, which `_dark` overrides                                                                                                                                                                                                                                                                                                                                                                                      |

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

| Path                                   | Purpose                                           |
| -------------------------------------- | ------------------------------------------------- |
| `src/index.ts`                         | Public barrel export                              |
| `src/types.ts`                         | Shared types (`WithRef`, etc.)                    |
| `src/components/index.tsx`             | Component barrel export                           |
| `src/components/<Name>/`               | Individual component folders                      |
| `src/hooks/`                           | Shared hooks                                      |
| `../preset/src/theme/recipes/`         | All component recipes                             |
| `../preset/src/theme/tokens/`          | Primitive design tokens                           |
| `../preset/src/theme/semantic-tokens/` | Semantic tokens (light/dark)                      |
| `styled-system/`                       | Generated Panda runtime (shipped, gitignored)     |
| `panda.config.ts`                      | Panda CSS design-system config                    |
| `oxlint-panda.mjs`                     | Panda lint rules bound to `panda.config.ts`       |

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

ui is a Panda design system. Apps run `@pandacss/dev` 2.3 or later and point `designSystem` at it; the manifest
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

The entry CSS keeps the usual layer line:

```css
@layer reset, base, tokens, recipes, utilities;
```

`@fontsource-variable/inter` is an optional peer: install it unless the app replaces the preset's `globalFontface`.
`@pandacss/dev` 2 depends on `@parcel/watcher`, whose install script pnpm flags until `allowBuilds` lists it. Its
prebuilt binaries ship as optional dependencies, so the script can stay off:

```yaml
# pnpm-workspace.yaml
allowBuilds:
  "@parcel/watcher": false
```

### Phones and touch

Two things adapt, each on its own signal:

- **Touch density** follows the primary pointer, `(pointer: coarse)`, at any width, so a tablet in landscape gets it
  too. Controls keep their desktop height; menu rows and checkbox, radio and switch rows grow to 44px, text inputs to
  16px text (iOS zooms into anything smaller), and buttons get a 44px hit area without changing their layout, narrowed
  beside a neighbouring button. `_hover` styles apply only where the device can hover. It is all CSS on the
  `--control-*` knobs, so the first server render is already right.
- **Presentation** follows the viewport. Below `md`, `Select`, `ApplySelect`, `TagSelect`, `Menu`, `Popover`,
  `DatePicker`, `DatePickerSelect`, `ColorPicker` and `Combobox` open as a bottom sheet that swipes away; from `md` up
  they stay anchored. Pass `mobileLayout="popover"` to keep one anchored; an overlay with `autoFocus={false}` (a hint
  beside a focused field) and an `inline` picker always stay anchored. A sheet applies the overlay's `closeOnEscape`,
  `closeOnInteractOutside` and outside/Escape handlers. A submenu opens inside its parent's sheet
  behind a back row (`Menu.Content`'s `backLabel`). A phone `Combobox` field is a button that opens a full-height sheet
  with the search input on top. `Dialog` sizes `md`, `lg`, `xl` and `cover` fill the screen below `md`; `xs` and `sm`
  stay centred.

`Sheet` is the bottom `Drawer` with a grabber, `snapPoints`, safe-area padding and a `Header` that takes
`startElement`/`endElement`. Every `Drawer` placement swipes to dismiss on touch, and a mouse drags it by the grabber
(`draggable` on `Drawer.Content` lets the mouse drag the content too); for `Drawer.RootProvider`, pass the placement
to `useDrawer`, which sets the swipe direction and the provider's styling, and give `Sheet.RootProvider` `useSheet()`.
On a coarse pointer a `Drawer` or `Sheet` opens with focus on itself rather than its first field, so the on-screen
keyboard stays down; mark a field `data-autofocus` or pass `initialFocusEl` to focus it. A `DataTable` in
`mobileLayout="cards"` applies its Sort and Filters sheets on Done; dismissing a sheet discards its edits.

Tooltips and hover cards never open from touch. Keep tooltip text a label for something already labelled (an icon
button's `aria-label`), put anything a phone user needs in `ToggleTip` or `InfoTip`, and make `HoverCard` content
reachable another way.

Give the app `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
`viewport-fit=cover` lets sheets and `ActionBar` pad for the home indicator. Leave out `maximum-scale` and
`user-scalable=no`: they block pinch zoom, and 16px inputs no longer need them.

#### Upgrading from 0.11

- On a coarse pointer, controls keep their desktop height instead of growing to 44px; buttons keep their 44px hit
  area and menu, checkbox, radio and switch rows stay 44px. An app that sized controls up for touch (`md` on touch,
  `sm` on desktop) can drop that and pass one size
- Apps need `@pandacss/dev` 2.3 or later. Remove the `@construkt-kit/ui/layers.css` import from the entry CSS: Panda
  emits the recipe sublayer order itself

#### Upgrading from 0.10

- `DataTableProps` is a union on `clientSide`: a server table still passes `totalItems`. Code that reads the server
  props picks that branch with `Extract<DataTableProps<T>, { totalItems: number }>`
- New: `DataTable` `clientSide` filters, sorts and pages `data` itself by `params`, from each column's `meta.type`, and
  takes no `totalItems`. A select filter without `selections` lists the column's values across every row. A column's
  `filterFn` can name `input`, `select`, `number` or `date`, and its `sortFn` `alphanumeric`, `text`, `datetime` or
  `basic`. A select column sorts by its `selectProps.getItemLabel` labels. Only `undefined` cells sort last; `null`
  sorts as a value. `parseNumberFilter` and `matchesNumberFilter` are exported for a custom number `filterFn`
- New: `labels.item` names the count when one row matches; without it a custom `labels.items` is used for both

#### Upgrading from 0.9

- On phones and touch screens, see [Phones and touch](#phones-and-touch): `_hover` styles apply only where the device
  can hover, coarse-pointer controls and rows are 44px with 16px input text (drop app-level `--control-base-h`
  overrides), and below `md` the pickers open as bottom sheets — pass `mobileLayout="popover"` to keep one anchored —
  while `Dialog` sizes `md` and up fill the screen
- `Drawer` is built on Ark's drawer: every placement swipes to dismiss on touch, `Drawer.Root` takes `snapPoints`, and
  a bottom drawer stops at 90dvh with a rounded top and safe-area padding. `Drawer.RootProvider` takes its placement
  from `useDrawer({ placement })` instead of a `placement` prop
- On phones `Combobox.Input` renders a button that opens the sheet, so a `ref` passed to it attaches to the sheet's
  input only while the sheet is open
- `_dark` overrides `_light` in dark mode, and `_hover`/`_active` also match `[data-hover]`/`[data-active]` and never
  `[data-disabled]`; see [Condition Overrides](#condition-overrides)
- `Carousel.Root` `padding` is the carousel's own, a CSS length that insets the slides, not a style prop; pad the root
  with `p`
- `ActionBar.Content` floats in a fixed bar at the bottom centre of the viewport instead of a popover positioner, so
  `ActionBar.Root` drops `placement` and `positioning`. The bar is a region labelled "Selection actions" (pass
  `aria-label` to rename it) rather than a dialog, and no longer closes on an outside click or takes focus when it opens
- Solid `green`, `orange`, `yellow`, `teal` and `cyan`, and so `success` and `warning`, take dark text and hover
  lighter in light mode: white text on them fell below WCAG AA
- While `loading`, `SubmitDialog`, `DeleteDialog` and `SubmitForm` disable Cancel and the close button, and the dialog
  ignores Escape and outside clicks
- `Calendar`, `DatePicker` and `DatePickerSelect` default `timeZone` to the user's zone instead of UTC, which moves
  "today" and the range presets for users away from UTC
- Under SSR, `ColorModeProvider` renders `defaultMode` and switches to the stored mode once hydrated
- Ctrl/Cmd+A in a multiple `Listbox` or `Select` selects the enabled items the search shows and keeps hidden
  selections, like the select-all button
- `TreeSelectList`: Space checks a row and Enter a leaf. A branch checkbox toggles only the checkable, enabled leaves
  under it, a branch with none has no checkbox, and select-all skips disabled leaves
- Drags leave out nodes `isNodeDraggable` rejects, and nesting into a lazy branch that hasn't loaded its children is
  refused; `applyTreeDrop` takes `isBranchLoaded` for branches you know have loaded
- `Tooltip` with an empty `label` renders only its children, and text children get a `<span>` trigger. `ToggleTip`
  puts text children in a button
- `DataTable` keeps the page when a filter reset changes nothing, and a `style` from `getRowProps` no longer replaces
  the row's grid columns
- `DataTable` moves to the last page through `onParamChange` when `params.page` is past it once loading ends
- `Pagination.Root` takes `page`, which used to go to CSS
- `useFileSelect` leaves each `ParsedFile.source` to you: revoke it with `URL.revokeObjectURL` once you are done
- `DisplayValue` shows the dash when `formatValue` returns `null` or `undefined`. `formatValue` is required unless the
  value is a string, number, bigint, boolean or an array of those, so `Date` and object values need one, and
  `DisplayValueProps` is a type alias
- `NumberFilter` reads a single comma as the decimal separator (`2,5`) unless exactly three digits follow it (`1,000`
  stays invalid)
- `VirtualScrollArea` counts the content above the list, such as `header`, in each `virtualItem`'s `start` and `end`
- Invalid `Checkbox`, `CheckboxCard`, `RadioGroup` and `RadioCardGroup` controls show a red ring in every variant
  instead of a red fill on solid only
- `Fieldset.Root` stacks its children at every width, with the root's gap below the legend
- Pinned and sticky `Table` cells take their background from `--table-row-bg`: set it instead of `bg` on a row so its
  pinned cells match
- New: `useCombobox` for `Combobox.RootProvider`, `VirtualScrollArea` `scrollToIndexRef` and `keepMountedIndex`, and
  color roles for `purple`, `teal`, `cyan`, `pink`, `yellow`, `gray` and `slate`, which fell back to `brand`

#### Upgrading from 0.8

- `Tooltip` and `ToggleTip` take `label` in place of `content`, and `InfoTip` takes its text as children. Panda reads
  `content` on any component as the CSS property, so a string `content` emitted invalid CSS and a colon in it failed
  the build
- Import `css`, `cx`, `styled`, `token` and Panda's types from the app's `styled-system/` (see
  [Panda CSS Utilities](#panda-css-utilities)); Panda never extracted styles written with ui's copies
- `Select` and `SubmitDialog` `contentWidth` apply inline and take px numbers, size tokens or CSS lengths
- Renamed for the same reason as `content`: `DataTable` `columns` → `columnDefs`, `LoadingOverlay` `fill` →
  `backdrop`, `SubmitDialog` `width` → `contentWidth`, `TreeSelectList` `maxHeight` → `listHeight`
- Removed, because Panda never extracts styles nested in an object:

  | Removed                                                             | Use                                                                              |
  | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
  | `contentProps`, `listProps` on `Select`, `ApplySelect`, `TagSelect` | `contentWidth`, `listMaxHeight`, `contentCss`, `listCss`                         |
  | `contentProps` on `Listbox`, `ScrollArea`, `VirtualScrollArea`      | `contentCss`; `listMaxHeight` on `Listbox`                                       |
  | `listboxProps` on `Select`, `ApplySelect`, `TagSelect`              | style props on the select                                                        |
  | `buttonProps` widths                                                | nothing: the trigger fills the select                                            |
  | `Tooltip` `contentProps`                                            | `Tooltip.Content`                                                                |
  | `PasswordInput` `containerProps`                                    | style props, `className` and `style` on `PasswordInput`; they style the group    |
  | `SkeletonText` `rootProps`                                          | style props on `SkeletonText`, which style the stack; `lineCss` styles each line |
  | `ApplySelectTrigger`, `ApplySelectContent`                          | `ApplySelect.Trigger`, `ApplySelect.Content`                                     |

- Removed from the public API:

  | Removed                                                 | Use                                                                    |
  | ------------------------------------------------------- | ---------------------------------------------------------------------- |
  | `Divider`, `DividerProps`                               | `Separator`, `SeparatorProps`                                          |
  | `CheckboxCardIndicator`                                 | `Checkbox.Indicator`                                                   |
  | `Context` (Tooltip's root-level export)                 | `Tooltip.Context`                                                      |
  | `FileUpload.List`                                       | `FileUpload.Items` inside `FileUpload.ItemGroup`                       |
  | `Select.EmptyState`, `ApplySelect.EmptyState`           | `emptyMessage` on the select                                           |
  | `ApplySelectRoot`, `ApplySelectActions`                 | `ApplySelect.Root`, `ApplySelect.Actions`                              |
  | `ApplySelect{Actions,Trigger,Content,Search,List}Props` | `ApplySelectActionOptions`, `Select{Trigger,Content,Search,List}Props` |
  | `ListboxItemRenderProps`                                | `SelectionItemState`                                                   |
  | `inputGroupButtonSize`, `InputGroupSize`                | `inputGroupButtonSizeFor(size)`                                        |
  | `DraggableTreeNodeRenderDetails`                        | `TreeNodeRenderDetails`                                                |
  | `TreeSelectListSearchMode`                              | `SelectionSearchOptions["mode"]`                                       |
  | `dataTableFeatures`                                     | `createDataTableColumnHelper`; the `DataTableFeatures` type stays      |

- The tree helpers `filterTreeCollection`, `collectLeafValues`, `collectBranchValues`, `collectCheckedLeafValues`,
  `collectBranchesWithLeafDescendants` and `mergeFilteredValue` are gone; use `TreeCollection`'s `filter`,
  `getDescendantValues` and `visit`
- Gone with no replacement: `useRowSelection`, and the internals `getItemMode`, `ItemMode`, `isDescendantValue`,
  `isLastChildOfParent`, `useTreeDndContext`, `TreeRowIndentGuides`, `DataTableInstance`, `DataTableHeaderType`,
  `DataTableCell`, `DataTableTableMeta`, and DatePicker's `toArkValue`, `toArkDefaultValue`, `fireValueChange` and
  `fireClear`
- New exports: `createDataTableColumnHelper`, `createListCollection` and `useListCollection` (0.8's build dropped
  both), and the types `ManagedSelectionProps`, `TooltipContentProps`, `TreeCanDropDetails`, `ColumnFilterType`,
  `SelectionMode`, `CalendarMode` and `HiddenInputProps`, which `inputProps` on `Checkbox`, `CheckboxCard`, `Radio`
  and `Switch` takes
- The remaining objects of props (`triggerProps`, `buttonProps`, `scrollAreaProps`, `submitButtonProps`,
  `NumberFilter` `inputProps`, what `getRowProps`/`getItemProps` return, column `meta.selectProps`) take no style
  props. `className`, `style`, `data-*` and `colorPalette` still work
- `contentCss` styles the dropdown of `Select`, `ApplySelect` and `TagSelect` and the scrolled content of `Listbox`,
  `ScrollArea` and `VirtualScrollArea`; `listCss` styles the `Select` family's list. Write them as JSX literals and
  compose with arrays (`contentCss={[base, contentCss ?? {}]}`), never spreads, which Panda cannot extract
- `Select`, `ApplySelect`, `TagSelect`, `DataTable`, `DatePicker` and `DatePickerSelect` take style props for the whole
  control (`<Select w="200px">`)
- `SearchInput` and `PasswordInput` put style props, `className` and `style` on the group, so the icon and buttons stay
  inside a sized field. `PasswordInput` drops `type`, which its visibility toggle owns
- `SearchInput`, `Calendar`, `DatePicker` and `DatePickerSelect` take `clearLabel` to name their clear controls
- `Tooltip.Content` renders its own portal and positioner like `Popover.Content`: drop a wrapping `Tooltip.Positioner`,
  and pass `portalled={false}` to render in place
- `placement` on `Popover`, `Menu`, `HoverCard`, `ToggleTip` and `Tooltip` survives a `positioning` prop, which used to
  replace it
- Virtual lists cap at the listbox's `maxH` (24rem) like other lists, and `ApplySelect` honours a `contentWidth` below
  its 256px minimum
- `ApplySelect.Root` autofocuses its search like `ApplySelect`
- `SubmitDialog` and `SubmitForm` take `loading` and `submitDisabled` in place of `isSubmitLoading` and
  `isSubmitDisabled`, and `SubmitDialog` takes `open` in place of `isOpen`, matching `Button`, `DataTable` and `Select`.
  `SubmitForm` takes `submitLabel` and `cancelLabel` like `SubmitDialog`
- Put links inside `Menu.Item asChild` rather than wrapping `Menu.Item` in a link, which put the `<a>` between the menu
  and its item. Enter on a link item clicks it as a pointer does, so a router link's handler runs and the menu closes;
  pass `navigate` to `Menu.Root` to route by `href` instead
- `Menu.TriggerItem` no longer takes `value` or `disabled`, which zag never read; drop them. It takes `icon` in place of
  `startIcon`, like `Menu.Item`
- `Menu.CheckboxItem`, `Menu.RadioItem` and `Menu.TriggerItem` no longer take `asChild`
- `ScrollArea` with `scrollbars="vertical"` sizes its content to the viewport and hides horizontal overflow.
  `TreeSelectList` scrolls that way, so long labels truncate instead of scrolling sideways
- Single-mode `onValueChange` on `Listbox` and `Select` receives `V`, never `null`; clear by passing `value={null}`.
  Clearing through `Listbox.Context` (`clearValue()`, `setValue([])`) no longer emits
- `SelectProps`, `SelectRootProps`, `ListboxProps`, `SelectionProps`, `CalendarProps`, `DatePickerProps` and
  `DatePickerSelectProps` cover one selection mode, single unless you pass another (`SelectProps<T, V, "multiple">`,
  `DatePickerProps<"range">`), instead of a union of every mode. With style props in the union, `Omit` and `Pick` on
  it failed with "Expression produces a union type that is too complex to represent". For the same reason
  `Select.Root`, `DatePicker` and `DatePickerSelect` take one call signature per mode like `Select`: `ComponentProps`
  on them gives multiple mode, and props typed for every mode no longer spread into them
- `Listbox` drops `defaultValue`, which it always ignored
- The search field in `Listbox` and `Select` drives the list: arrows move the highlight, Enter picks, and typing
  highlights the first match. The list element takes the listbox content id, so set a custom one through the root's
  `ids.content`
- A custom search `filter` on `Listbox`, `Select` or `TreeSelectList` receives the trimmed, lowercased query and isn't
  called while the query is blank. `search.mode: "external"` shows the items as given, so `onQueryChange` can filter
  them server-side
- `Select.Search` and `ApplySelect.Search` no longer take `onClear`, which the field always overrode
- `TagSelect` takes `placeholder` in place of `tagPlaceholder`. An empty `TagSelect` or `ApplySelect` shows the
  placeholder, "Select item" by default (`ApplySelect` showed "Select")
- `ApplySelect`'s select-all reads "Select all"/"Deselect all" instead of "Select All"/"Clear All" and acts only on the
  enabled items the search shows
- `TreeSelectListProps` is a type alias; replace `interface X extends TreeSelectListProps<T>` with an intersection
- `TreeSelectList` takes `search={{ placeholder, filter, showInput, query, defaultQuery, onQueryChange, mode }}` in
  place of `searchPlaceholder`, `searchPredicate`, `showSearch`, `query`, `defaultQuery`, `onQueryChange` and
  `searchMode`, like `Listbox` and `Select`. `listHeight` also takes px numbers
- While a query is active, `TreeSelectList` expands every branch with matches and disables drag-and-drop. Collapsing a
  branch mid-search lasts until the query changes and skips `onExpandedChange`; pass `expandOnSearch={false}` to keep
  the stored expansion
- `TreeSelectList` select-all acts on the displayed leaves `isNodeCheckable` accepts: during a search it adds or removes
  only the matches, and it keeps `value` ids that aren't in the collection. During a search, a matching branch with no
  matching children can't be checked
- `TreeViewDndProvider` reorders the collection of the `TreeView.Root` or `RootProvider` around it: move it inside, and
  drop its `collection` and `indentPerLevel`
- `TreeDropInstruction` is ui's own union, without `instruction-blocked` or `indentPerLevel`. `TreeDropIndicator` drops
  `colorPalette`, and `useTreeNodeDnd` drops `dragHandleRef`
- Keyboard reordering moves every node `getDragValues` returns, like a pointer drag, and indent inserts the node first
  in the target branch and expands it (`moveNodeByKeyboard` inserts first too). Drags skip `getDragValues` ids missing
  from the collection instead of cancelling
- Build `DataTable` columns with `createDataTableColumnHelper<T>()` instead of TanStack's
  `createColumnHelper<DataTableFeatures, T>()`. Widths come only from `meta.width` and `meta.minWidth`: column `size`,
  `minSize`, `maxSize` and `enableHiding` went with TanStack's sizing and visibility features
- `DataTable` sorting or filtering returns to page 1, an emptied search filter applies at once, and a malformed date
  filter param is cleared. A click or Enter on an input, select, label or other control in a clickable row doesn't fire
  `onRowClick`
- `DataTable`'s sorter is a button named "Sort by" plus the column name, the date filter's placeholder reads "Filter by"
  plus the column name like the others, and mobile cards render non-string headers. `DataTableLabels` adds `sortBy`,
  `clearSearch`, `clearNumber` and `clearDate`
- A `Calendar`, `DatePicker` or `DatePickerSelect` given `value={undefined}` is controlled and shows no date; omit
  `value` to leave it uncontrolled. `maxSelectedDates` takes effect
- `Clipboard.Indicator` and `Clipboard.CopyText` render the children you pass in place of their default icon or "Copy"

#### Upgrading from 0.7

- Replace `createConstruktPandaConfig` with `designSystem` as above
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
