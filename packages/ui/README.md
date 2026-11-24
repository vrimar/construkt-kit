# @construkt-kit/ui

60+ UI components for Construkt Kit apps, built on Panda CSS and the kit's own React primitives.

> **Rule:** Consumers import components from `@construkt-kit/ui` and Panda helpers from their own generated `styled-system/`. UI implementation code imports Panda helpers from `#styled-system/*`.

## Exports

### Components

**Layout:** `Box`, `Flex`, `Stack`, `HStack`, `VStack`, `Center`, `Container`, `Grid`, `GridItem`, `Spacer`, `Float`, `Separator`, `Wrap`, `SimpleGrid`, `AspectRatio`, `ScaleToFit`

**Buttons:** `Button`, `IconButton`, `TooltipIconButton`, `DeleteButton`, `EditButton`, `CloseButton`, `ClearButton`, `SelectButton`, `SplitButton`, `ButtonGroup`

**Data Display:** `DataTable`, `DataTableColumnPicker`, `DataList`, `Badge`, `Tag`, `Avatar`, `Image`, `List`, `Table`, `Stat`, `EmptyState`, `Card`, `Carousel`, `Code`, `DisplayValue`, `Kbd`

**Feedback:** `Alert`, `LoadingOverlay`, `Toaster` / `toaster`, `Progress`, `Skeleton`, `Spinner` (`variant="dots"` for a typing indicator)

**Overlay / Dialog:** `Dialog`, `SubmitDialog`, `DeleteDialog`, `CommandPalette`, `Drawer`, `Sheet`, `Popover`, `ConfirmPopover`, `PromptPopover`, `Tooltip`, `ToggleTip`, `InfoTip`, `HoverCard`

**Form:** `Field`, `SubmitForm`, `Fieldset`, `Input`, `Textarea`, `InputGroup`, `PasswordInput`, `SearchInput`, `NumberInput`, `Checkbox`, `CheckboxCard`, `Switch`, `Radio` / `RadioGroup`, `RadioCard`, `Slider`, `TagsInput`, `Editable`, `FileUpload`, `FormFileUpload`, `PinInput`, `ColorPicker`, `HotkeyInput`

Inside a `Field`, the trigger of `Select`, `ApplySelect`, `TagSelect`, `DatePicker`, `DatePickerSelect` and
`ColorPicker` is named by the field's label followed by its value, described by its helper and error text, and invalid
with it.

**Selection / Dropdowns:** `Select`, `Listbox`, `SelectButton`, `TagSelect`, `ApplySelect`, `Combobox` — the managed `Select`/`Listbox` families take `groupBy` / `groupSort` for group headings

**Tree:** `TreeView`, `TreeSelectList` — both take `nodes` with `getNodeValue`, `getNodeLabel` and optional `getChildren`, `getChildrenCount` and `isNodeDisabled`; `VirtualTree` + `VirtualTreeRow` inside `TreeView.Tree` render a tree whose rows mount only in view, with keyboard navigation, tab stop and sticky branch headings intact

**Sortable:** `Sortable`, `applySortableReorder`, `DragPreview` (the drag pill, also exported as `TreeDragPreview`)

**Drag and drop:** `defineDragType`, `useDraggable`, `useDropTarget` — typed drags between any elements, such as
cards moved across lists; `getExternalData` also hands native data to `dataTransfer` readers like DataGrid's external drop

**Date Pickers:** `Calendar`, `DatePicker`, `DatePickerSelect`

**Navigation & Text:** `Link`, `Tabs`, `Accordion`, `Breadcrumb`, `Menu`, `NavRail`, `Text`, `Heading`, `Span`, `SearchHighlight`, `useHighlight`

**Misc:** `ActionBar`, `Clipboard`, `Collapsible`, `Icon`, `NumberFilter`, `formatNumberFilter`, `Pagination`, `Portal`, `RatingGroup`, `ScrollArea`, `SegmentGroup`, `Splitter`, `ThemeToggle`, `ToggleGroup`, `Toolbar`, `formatShortcut`, `matchesShortcut`, `isComposingEvent`, `isEditableTarget`, `isWithinNestedControl`

**Chat:** `Chat` — `Message`, `Citation`, `ActionLine`, `TypingIndicator`, `Suggestions`, `Suggestion`, `Composer`; callback-driven, no data fetching. Render `TypingIndicator` inside the message list's `role="log"`: screen readers don't reliably announce a live region that mounts with its text, and the log announces it as new content

### Hooks

| Hook                                    | Description                                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `useAnnouncer`                          | Live region + `announce(message, delay?)` and `cancel()`; `politeness` polite/assertive            |
| `useAutoFocus`                          | Auto-focus + optional select on mount                                                              |
| `useComposedRefs`                       | One ref callback that feeds every ref it is given                                                  |
| `useControlledMirror`                   | Mirror a controlled value into local state, ignoring its echoes                                    |
| `useFileSelect`                         | Returns a file-picker opener; `onSelect` gets the parsed files                                     |
| `useHotkeys`                            | Run a handler when a shortcut such as `Mod+K` is pressed                                           |
| `useHotkeyHandler`                      | `useHotkeys` scoped to an element: returns its `onKeyDown`                                         |
| `useLatestRef`                          | Ref to the last committed value, for stable callbacks                                              |
| `useMediaQuery`                         | Subscribe to a CSS media query                                                                     |
| `usePointerDrag`                        | Pointer drag with threshold, Escape cancel, edge auto-scroll; `onRelease` after any accepted press |
| `createEdgeAutoScroll`                  | Scroll a container while the pointer is near or past its edges                                     |
| `useBreakpointUp` / `useBreakpointDown` | Whether the viewport is at/above or below a breakpoint                                             |
| `useIsMobile`                           | Whether the viewport is below the `md` breakpoint                                                  |
| `useHasOpenOverlay` / `hasOpenOverlay`  | Whether a popup, menu or dialog is open; tooltips don't count                                      |
| `useTooltipDelegate`                    | One tooltip for elements found at run time, such as grid cells; `show`, `showAfterDelay`, `hide`   |
| `getTabbables` / `isFocusable`          | The elements in a container that Tab reaches; whether an element takes focus                       |

`hasOpenOverlay(except)` leaves out an overlay inside `except` or holding it, such as one opened from a side pane.
A closing popup, menu or dialog hands focus back only while focus is still inside it or nowhere, and not once an overlay
that takes focus has opened, so a menu's `onSelect` or a palette command can move focus, or open a confirm or a dialog,
straight away. A closing modal frees the page as it starts to close; it animates out inert, under anything opened since.

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

### Testing helpers

`@construkt-kit/ui/testing` drives ui components from an app's Playwright tests without re-spelling their markup. It
needs `@playwright/test` (an optional peer); `src/testing/*.spec.ts` keeps each helper working against the stories.

| Export                                     | Locates or does                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `popupFor(trigger)`                        | The open popup a trigger controls (Popover, Menu, Select, Dialog), through its `aria-controls`     |
| `openPopup(trigger)`                       | Presses the trigger unless its popup is open, and returns the popup; phone sheets included         |
| `menuItem(menu, name)`                     | A menu item of any kind: action, submenu, checkbox, switch, radio, segment (`toBeChecked()` reads) |
| `pickMenuItem(trigger, path)`              | Opens the menu and picks an item, through submenus: `["Owner", "Mine"]`                            |
| `dialog(scope, name)`                      | A dialog or alertdialog by name: Dialog, SubmitDialog, Drawer, Popover, ConfirmPopover, sheets     |
| `listbox(scope, name?)`                    | A Listbox's or Select's list, a `listbox` or, once items have actions, a `grid`                    |
| `listOption(list, name)`                   | An option, or a `row` in a list whose items have actions                                           |
| `selectedOptions(list)`                    | The selected options, in list order                                                                |
| `openSelect(trigger)`                      | Opens a Select, ApplySelect or TagSelect and returns its list                                      |
| `pickOption(trigger, name)`                | Opens a select and picks an option                                                                 |
| `selectSegment(scope, name)`               | Presses the SegmentGroup item holding the radio named `name`                                       |
| `setChecked(input, checked)`               | Checks or unchecks a Switch or Checkbox through the label holding its input                        |
| `hotkeyInput(scope, label)`                | A HotkeyInput by its label (its name is the label, then the value)                                 |
| `hotkeyError(input)`                       | The refusal message a HotkeyInput shows while recording                                            |
| `toastRegion(page)` / `toast(page, title)` | The Toaster's region; a toast by its title                                                         |
| `dismissToast(toast)`                      | Dismisses a toast with Escape and waits for it to leave                                            |
| `hoverTooltip(trigger)`                    | Hovers a trigger and returns the tooltip that describes it, past any open delay                    |
| `dropFiles(target, files)`                 | Drops files on a FileUpload dropzone through a synthetic `DataTransfer`                            |

Tabs need no helper: `getByRole("tab", { name })` presses one and `getByRole("tab", { selected: true })` finds the
selected one.

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
import { styled } from "#styled-system/jsx";
import { badge } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

export type BadgeProps = ComponentProps<typeof Badge>;
export const Badge = styled(renderable.div, badge);
```

`renderable.<tag>` adds the `render` prop, which swaps in another element and merges the component's props into it.

### 2. Compound component with style context (Collapsible, Tabs, Dialog)

Use `createSlotRecipeContext(recipe)` for slot-based styling, and a kit hook plus React context for the state the
parts share:

```tsx
import { createSlotRecipeContext } from "#styled-system/jsx";
import { collapsible } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";

const { withProvider, withContext } = createSlotRecipeContext(collapsible);

const StyledRoot = withProvider(renderable.div, "root"); // "root" = slot name in recipe
const StyledTrigger = withContext(renderable.button, "trigger");

function Trigger(props: TriggerProps) {
  const state = useCollapsibleContext("Collapsible.Trigger");
  return (
    <StyledTrigger
      {...mergeProps<TriggerProps>(
        {
          type: "button",
          "aria-expanded": state.open,
          onClick: (event: MouseEvent<HTMLButtonElement>) => state.toggle(event.nativeEvent),
        },
        props,
      )}
    />
  );
}

export const Collapsible = { Root, Trigger, Content, Indicator }; // Export as plain object
```

- Each sub-component is a "slot" in the recipe — Panda generates e.g. `collapsible__root`, `collapsible__trigger`
- Export as a **plain object** with capitalized properties → `<Collapsible.Root>`, `<Collapsible.Trigger>`
- Behaviour comes from `src/primitives/` — `layer` (Escape, outside press, portals), `focus`, `presence`, `position`,
  `composite` (arrow-key navigation), `field`, `locale`, `change` (`onXChange` details) and `render`
- Parts state themselves with `data-slot` and boolean `data-*` attributes (`data-open`, `data-disabled`), which the
  recipe matches with Panda conditions (`_open`, `_disabled`)
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
  - every palette is generated from one key colour (`../preset/src/theme/color/`) into `solid`, `surface`, `subtle`, `outline`, `plain` roles
  - Available palettes: `neutral`, `brand`, `red`, `orange`, `yellow`, `green`, `teal`, `cyan`, `blue`, `purple`, `pink`, plus the status palettes `danger`, `warning`, `success`, `info`
  - `neutral` is the default chrome (slate); `createConstruktKitPreset({ palettes, neutral })` swaps or adds palettes
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

| Context               | Syntax             | Example                          |
| --------------------- | ------------------ | -------------------------------- |
| In recipe definitions | Bare token paths   | `bg: "colorPalette.solid.bg"`    |
| Token references      | Curly braces       | `{colors.brand.solid.bg}`        |
| In components (JS)    | `token()` function | `token('colors.brand.fg')`       |
| In components (CSS)   | Short paths        | `css({ bg: 'brand.subtle.bg' })` |

Semantic token layers: `bg.*`, `fg.*`, `border.*`, `neutral.*`, `colorPalette.*`

### Condition Overrides

The theme redefines standard pseudo-selectors:

| Condition           | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_hover`, `_active` | Also match `[data-hover]`/`[data-active]`, and skip `:disabled` and `[data-disabled]`. `_hover` applies only where the device can hover and ranks below every other condition except `_light` (which it overrides, as it does the base style), states (`_active`, `_checked`, `_selected`, `_focusVisible`…) as well as `_dark`, `_odd`/`_even` and the like, so a state keeps its look under the pointer; nest `_hover` inside the other condition (`_dark: { _hover: … }`) to style hovering there, or use a semantic token |
| `_checked`          | Matches 5 selectors: `:checked`, `[data-checked]`, `[data-state=checked]`, `[aria-checked=true]`, `[data-state=indeterminate]`                                                                                                                                                                                                                                                                                                                                                                                                |
| `_light`            | `:where(:root, .light) &` — explicit light mode, which `_dark` overrides, except inside a `.light` scope nested in `.dark`                                                                                                                                                                                                                                                                                                                                                                                                    |

### Hover-revealed controls

`_unrevealed` hides a control until its row is in use. Mark the row with `data-reveal-group`; the condition applies
where the device can hover, while the row is neither hovered, focused within, highlighted (`data-highlighted`, the
keyboard cursor of a listbox or menu), being dragged (`data-dragging`) nor holding an open popup trigger (an `aria-haspopup` element with `aria-expanded="true"`, such as an open `Menu.Trigger`).
So the control shows with its row, while anything in the row has focus, while its menu is open, and always on touch
screens:

```tsx
<HStack data-reveal-group>
  <Text flex="1">{name}</Text>
  <IconButton
    aria-label="More"
    _unrevealed={{ opacity: "0" }}
  >
    <EllipsisIcon />
  </IconButton>
</HStack>
```

Hide with `opacity` so the control stays focusable. `TreeView` rows, `Listbox` items and `Sortable.Item` are reveal
groups: `actionsVisibility="hover"` on `TreeView.Root`, `TreeSelectList` or `Listbox` and `handleVisibility="hover"` on
`Sortable.Root` use the condition.

A tree row with no background of its own paints its hover actions and sticky branch with `--surface-bg`, falling back
to `bg`. Popovers, menus, dialogs and drawers set it; set it on any other surface a tree sits on, such as a card.

### Dark mode

Every semantic token carries a light and a dark value, so dark mode is a token flip — no per-component work. Activation is a `dark` class on an ancestor (the `_dark` condition); light is the `:root` default (no class needed). Both themes are generated from the same key colours and solved to the same contrast ratios, so a role that passes WCAG AA in light passes in dark. `html { color-scheme }` also flips so native scrollbars, form controls, and autofill match.

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

A `light` or `dark` class on any element forces that scheme for its subtree, such as an always-light document preview
inside a dark app. Semantic tokens, `color-scheme` and text colour follow the nearest scope at any depth, and
`_light`/`_dark` styles do up to three scopes deep (dark, light, dark). A scope resets `colorPalette` to `brand`: set
`colorPalette` on the scope element to keep another. Give the scope its own background (`bg="bg"`). `_light`/`_dark`
styles on the scope element itself follow the scheme around it. A popup or dialog opened inside a scope follows the
app's mode: its top-layer element takes the document's scheme as its own scope class.

`resolveColor(color, colorScheme)` resolves a colour, such as a token's `var(--colors-brand-solid-bg)`, through such a
scope and returns `#rrggbb`, for exported images and documents that can't read CSS variables.

### Density

Control and surface sizing runs on CSS-variable knobs that `html` sets. Override one on `:root` or any container to
rescale everything inside it at runtime, or set `data-density="compact"`, `"default"` or `"relaxed"` there for a named
mode:

| Knob                 | Drives                                                         | compact | default | relaxed |
| -------------------- | -------------------------------------------------------------- | ------- | ------- | ------- |
| `--control-base-h`   | `md` control height; other sizes step by `--control-step`, 4px | 32px    | 36px    | 40px    |
| `--control-base-px`  | Control horizontal padding                                     | 10px    | 12px    | 14px    |
| `--control-base-gap` | Gap inside controls, table cell vertical padding               | 6px     | 8px     | 10px    |
| `--control-base-py`  | Multi-line control vertical padding                            | 4px     | 7px     | 10px    |
| `--surface-scale`    | Multiplier on container and overlay padding                    | 0.75    | 1       | 1.25    |

Menu and listbox rows follow `--control-base-h` one step shorter unless `--control-base-row-h` is set, and stay 44px on
a coarse pointer in every mode. Modes never touch text (`--control-base-font`, `--control-input-font-min`), icon and
checkbox boxes (`--control-base-icon`, `--control-base-box`) or `--visual-scale`, the multiplier on spinner, slider and
progress sizes. `default` restores the defaults inside a compact or relaxed ancestor.

### Highlights and hatching

`animationStyle` takes `fresh` and `changed` (a 0.9s glow on a new or edited item), `flash` (a 1.2s ring and tint),
`spot` (a 1.8s highlight on a deep-link target that bleeds `--spot-bleed`, 12px by default, past each side), `ring` (a
bell shake) and `blink` (a pulse that repeats until removed). The highlights take their colour from `colorPalette` and
fade back to the element's own styles, and every one stops under `prefers-reduced-motion`. Remount the element or
re-apply the style to replay one; to carry a glow across a render that replaces the element, set `animationDelay` to
minus its age.

`layerStyle="hatched"` draws neutral diagonal stripes for a value that can't be counted or the hidden remainder of a
stacked bar.

### recipes vs slotRecipes

Both are registered in `../preset/src/theme/recipes/index.ts`:

- **`recipes`** (simple `cva()`): `badge`, `button`, `code`, `heading`, `icon`, `input`, `kbd`, `link`, `skeleton`, `spinner`, `text`, `textarea`, etc. — single-element components
- **`slotRecipes`** (compound `sva()`): `accordion`, `dialog`, `menu`, `listbox`, `tabs`, etc. — multi-slot components using `createSlotRecipeContext()`
- Naming exception: `switchRecipe` key (not `switch` — JS reserved word)

## File Map

| Path                                   | Purpose                                       |
| -------------------------------------- | --------------------------------------------- |
| `src/index.ts`                         | Public barrel export                          |
| `src/types.ts`                         | Shared types (`WithRef`, etc.)                |
| `src/components/index.tsx`             | Component barrel export                       |
| `src/components/<Name>/`               | Individual component folders                  |
| `src/hooks/`                           | Shared hooks                                  |
| `../preset/src/theme/recipes/`         | All component recipes                         |
| `../preset/src/theme/tokens/`          | Primitive design tokens                       |
| `../preset/src/theme/semantic-tokens/` | Semantic tokens (light/dark)                  |
| `styled-system/`                       | Generated Panda runtime (shipped, gitignored) |
| `panda.config.ts`                      | Panda CSS design-system config                |
| `oxlint-panda.mjs`                     | Panda lint rules bound to `panda.config.ts`   |

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
- Colors: semantic roles (`fg.muted`, `border.control`, `brand.fg`) or the `colorPalette` prop + recipe variants; there are no raw ramp steps
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

`inter-ui` is an optional peer: install it unless the app replaces the preset's `globalFontface`. Body text turns on
Inter's tailed l and serifed I (`cv05`, `cv08`) through `--font-body-features` on `html`; set it to `normal` when
`fonts.body` names another typeface, whose `cv05` and `cv08` mean other glyphs.
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
  16px text (iOS zooms into anything smaller), and buttons and links get a 44px hit area without changing their
  layout, narrowed beside a neighbouring button or link. A `Dialog`, `Drawer`, `Popover` or toast close trigger keeps
  its hit area when `position="static"` puts it in the flow, such as a header row. `_hover` styles apply only where the device can hover. It is all CSS on the
  `--control-*` knobs, so the first server render is already right.
- **Presentation** follows the viewport. Below `md`, `Select`, `ApplySelect`, `TagSelect`, `Menu`, `Popover`,
  `DatePicker`, `DatePickerSelect`, `ColorPicker` and `Combobox` open as a bottom sheet that swipes away; from `md` up
  they stay anchored. Pass `mobileLayout="popover"` to keep one anchored; an overlay with `autoFocus={false}` (a hint
  beside a focused field) and an `inline` picker always stay anchored. A sheet applies the overlay's `closeOnEscape`
  and `closeOnInteractOutside`, and its `onOpenChange` can `cancel()` the close. A submenu opens inside its parent's
  sheet behind a back row (`Menu.Content`'s `backLabel`). A phone `Combobox` field is a button that opens a
  full-height sheet with the search input on top. `Dialog` sizes `md`, `lg`, `xl` and `cover` fill the screen below
  `md`; `xs` and `sm` stay centred. A `DataTable` with `mobileLayout="cards"` also shows cards on a touch screen
  shorter than 32rem, a phone on its side, where the table would leave room for a few rows.

`Sheet` is the bottom `Drawer` with a grabber, `snapPoints`, safe-area padding and a title header whose ends
`Sheet.Content`'s `headerStart` and `headerEnd` fill. Every `Drawer` placement swipes to dismiss on touch, yielding
to anything inside it that can still scroll that way, and a mouse drags it by the grabber (`draggable` on
`Drawer.Content` lets the mouse drag the content too, and `draggable={false}` leaves only the grabber). A swipe's
position and speed decide whether it closes or settles on the snap point it points at.
On a coarse pointer a `Drawer` or `Sheet` opens with focus on itself rather than its first field, so the on-screen
keyboard stays down; mark a field `data-autofocus` or pass `initialFocusEl` to focus it. Initial focus skips a close
trigger: a `Dialog`, `Drawer` or `Popover` with nothing else to focus opens with focus on its content. A `DataTable` in
`mobileLayout="cards"` applies its Sort and Filters sheets on Done; dismissing a sheet discards its edits.

Tooltips and hover cards never open from touch. Keep tooltip text a label for something already labelled (an icon
button's `aria-label`), put anything a phone user needs in `ToggleTip` or `InfoTip`, and make `HoverCard` content
reachable another way.

Give the app `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
`viewport-fit=cover` lets sheets and `ActionBar` pad for the home indicator. Leave out `maximum-scale` and
`user-scalable=no`: they block pinch zoom, and 16px inputs no longer need them.

#### Upgrading from 0.15

- `whenOverlaysSettle` is gone: call what it wrapped directly. A closing modal no longer keeps the page inert while it
  animates out, and a closing popup, menu or dialog no longer takes focus back from where code moved it
- A `Popover`, `Menu`, `DatePicker` or `ColorPicker` that mounts open moves focus in, as a modal already did. Pass a
  `Popover` `autoFocus={false}` to leave focus where it is
- A modal returns focus as it starts to close, not once it has animated out. With `restoreFocus={false}` it leaves
  focus alone, where the browser used to put it back on the element focused before it opened
- `useLatestRef` holds the new value before layout effects and their cleanups run, not once they have

#### Upgrading from 0.14

- Every component and part that took `asChild` takes `render` in its place; Panda's layout components (`Box`, `Flex`,
  `Stack` and the rest) take `as`. Pass the element to render as, and keep the content as the component's children:

  ```tsx
  // before
  <Menu.Trigger asChild>
    <IconButton aria-label="More" icon={<EllipsisIcon />} />
  </Menu.Trigger>
  <Button asChild>
    <a href="/export">Export</a>
  </Button>

  // after
  <Menu.Trigger render={<IconButton aria-label="More" icon={<EllipsisIcon />} />} />
  <Button render={<a href="/export" />}>Export</Button>
  ```

  `npx jscodeshift -t node_modules/@construkt-kit/ui/codemods/as-child-to-render.ts --extensions=tsx,ts src` rewrites
  each `asChild` with a single element child, or an expression child such as `{children}` or a ternary of two
  elements, and prints the file and line of any it leaves, such as a dynamic `asChild={…}`. A link whose children are a render function keeps them, and the component wraps that function's output

  Every codemod here rewrites only elements imported from `@construkt-kit/ui`, under any name or through a namespace
  import. An element from Ark, Radix or the app's own re-export is left as it is

- `render` also takes a function, `render={(props) => <a {...props} />}`, for an element that needs the props spread by
  hand. The render element's own defined props win over the component's, its handlers run before the component's, and
  its own children replace the component's
- `Menu.CheckboxItem`, `Menu.RadioItem`, `Menu.SwitchItem` and `Menu.TriggerItem` take no `render`, as they took no
  `asChild`, and neither do `Splitter.Group`, `Splitter.Panel` and `Splitter.Separator`, whose elements the resizable
  panels library renders
- `Popover`, `ConfirmPopover`, `PromptPopover`, `Tooltip`, `HoverCard`, `ToggleTip`, `InfoTip` and `ActionBar` no
  longer run on Ark. Their `onOpenChange` takes `(open, details)`; `details` has the `reason`, the `event` and a
  `cancel()` that keeps the overlay as it is:

  ```tsx
  // before
  <Popover.Root onOpenChange={({ open }) => setOpen(open)}>
  // after
  <Popover.Root onOpenChange={(open) => setOpen(open)}>
  ```

  `npx jscodeshift -t node_modules/@construkt-kit/ui/codemods/open-change-args.ts --extensions=tsx,ts src` rewrites
  inline handlers on these components and prints the file and line of any it leaves, such as a handler passed by name

- `positioning` is gone from them. `placement` takes one placement or a list, the first preferred and the rest tried
  when it doesn't fit (`placement={["right", "top", "bottom"]}` for Ark's `flip: ["top", "bottom"]`). `Tooltip` and
  `Popover.Root` take `anchor`, an element or `{ getBoundingClientRect }`, in place of `positioning.getAnchorRect`. A
  `ConfirmPopover` given `anchor` needs no trigger, for one opened from elsewhere, such as a menu item
- They render in place in the browser's top layer instead of portalling to `<body>`, so nothing on the page can cover
  or clip them and `z-index` no longer orders them. `portalled` and `portalRef` are gone from them, except
  `ActionBar.Content`, whose `bottom` bar still portals. A popup takes CSS variables (density, `--control-*`) from where
  it is rendered; its text styles, palette and colour mode reset to the page's, so one opened inside a `.dark` scope
  still follows a light app
- A tooltip's open delay counts from when the pointer enters its trigger, and a press keeps it closed until the pointer
  leaves, asking `onOpenChange` once per press. Hovering another trigger within 300 ms of a tooltip closing shows its
  tooltip at once
- `ToggleTip` keeps its trigger in the same element whether or not `label` is set, and a `HoverCard` opens on focus only
  when the focus is visible, never from a tap
- Removed with Ark: `Popover.Positioner`, `Popover.Context`, the `Tooltip.*` parts (`Tooltip` is props only),
  `HoverCard.RootProvider`, `HoverCard.Positioner`, `HoverCard.Context`, `useHoverCard`, `Tooltip`'s `ids`, and the Ark
  root props `modal`, `lazyMount`, `unmountOnExit`, `onEscapeKeyDown`, `onInteractOutside`, `onPointerDownOutside`,
  `onFocusOutside` and `finalFocusEl`. Use `details.cancel()` in `onOpenChange` where an outside handler kept the
  overlay open, and `returnFocusTo` on `Popover.Root`, `ConfirmPopover`, `Dialog.Root`, `Drawer.Root` and
  `Sheet.Root` in place of `finalFocusEl`

  `npx jscodeshift -t node_modules/@construkt-kit/ui/codemods/overlay-props.ts --extensions=tsx,ts src` drops
  `lazyMount`, `unmountOnExit`, `portalled` and `portalRef` where they are gone, moves `positioning={{ placement }}` to
  `placement` and a `positioning.getAnchorRect` that takes no argument to `anchor`, and prints the file and line of any
  it leaves, such as another `positioning` key or a `lazyMount` that kept a shown panel mounted

- Their elements carry `data-slot`, `data-open` or `data-closed`, `data-side` and `data-align` instead of `data-scope`,
  `data-part`, `data-state`, `data-placement` and `data-expanded`; style them with `_open`, `_closed` and
  `_sideTop`/`_sideRight`/`_sideBottom`/`_sideLeft`. Their positioner sets `--anchor-width` in place of
  `--reference-width`
- A press that starts inside one of them and ends outside no longer closes it, and Escape closes an open tooltip before
  the popover under it
- `Popover.Root` and `Menu.Root` take `onExitComplete`, called once the overlay has gone and handed focus back, as
  `Dialog.Root`'s is
- `ActionBar` takes Escape only while no popup or dialog is open above where it renders, so Escape closes a popover
  opened before the bar, and a bar inside a dialog clears before the dialog closes
- `Toolbar.Button` and `NavRail.Item` no longer get a generated `id`
- `Toolbar` takes its arrow-key direction from `LocaleProvider` instead of the computed `dir`, as other components do;
  an app that sets `dir="rtl"` without a `LocaleProvider` wraps the toolbar in one
- `Menu` no longer runs on Ark either. `Menu.Root`'s `onOpenChange` takes `(open, details)`, `onSelect` takes the
  selected item's value and `onHighlightChange` the highlighted value or `null`; `Menu.RadioItemGroup` and
  `Menu.SegmentGroup` take `onValueChange(value)`. The `open-change-args` codemod rewrites inline handlers on them:

  ```tsx
  // before
  <Menu.Root onSelect={({ value }) => run(value)}>
  // after
  <Menu.Root onSelect={(value) => run(value)}>
  ```

- `Menu.Root` takes `anchor` in place of `positioning.getAnchorRect` and `anchorPoint`, and `placement` in place of
  the rest of `positioning`. `Menu.Content` renders in place in the top layer, without `portalled` or `portalRef`, and
  a submenu opens beside its trigger item as before
- Removed with Ark: `Menu.Context`, `MenuSelectionDetails`, `Menu.Trigger`'s `value` with the root's `triggerValue`,
  `defaultTriggerValue` and `onTriggerValueChange`, and the root props `id`, `ids`, `aria-label` (set it on
  `Menu.Content`), `composite`, `typeahead`, `navigate`, `lazyMount`, `unmountOnExit`, `onEscapeKeyDown`,
  `onInteractOutside`, `onPointerDownOutside`, `onFocusOutside` and `onRequestDismiss`. Enter on a link item clicks
  the link, so a router link's own click handler navigates
- Menu elements carry `data-slot`, `data-open` or `data-closed`, `data-checked` or `data-unchecked` and
  `data-highlighted` instead of `data-scope`, `data-part` and `data-state`; style option items with `_checked` and the
  preset's new `_unchecked`
- A context menu returns focus to the element that had it when the menu opened, after Escape, a press outside or a
  select
- `Listbox`, `Select`, `ApplySelect`, `TagSelect`, `Combobox` and `CommandPalette`'s list no longer run on Ark. The
  managed `Listbox` and the `Select` family keep their props. `Combobox.Root` and `Listbox.Root` take `items` with
  `getItemValue` and `getItemLabel` (and `isItemDisabled`) in place of a `collection`; `Combobox.Item` and
  `Listbox.Item` keep `item`. Filter a combobox's `items` yourself from `onInputValueChange`:

  ```tsx
  // before
  const { collection, filter } = useListCollection({ initialItems: frameworks, filter: contains });
  <Combobox.Root
    collection={collection}
    onInputValueChange={({ inputValue }) => filter(inputValue)}
    onValueChange={({ value }) => setFramework(value[0] ?? null)}
  >
  // after
  const shown = frameworks.filter((item) => contains(item.label, query));
  <Combobox.Root
    items={shown}
    getItemValue={(item) => item.value}
    getItemLabel={(item) => item.label}
    onInputValueChange={(inputValue) => setQuery(inputValue)}
    onValueChange={(value) => setFramework(value)}
  >
  ```

- A combobox's `value` is the picked item's value, or `null`, like `Select`'s; `selectionMode="multiple"` takes the
  place of `multiple` and makes it an array. `Combobox.Root` takes `onValueChange(value)`,
  `onInputValueChange(inputValue, { reason })`, `onOpenChange(open, details)` and `onHighlightChange(value)`, and
  `Listbox.Root` takes `onValueChange(value)`; the `open-change-args` codemod rewrites inline handlers on both
- `Combobox.Root` takes `placement` in place of `positioning`; for `positioning.sameWidth`, give `Combobox.Content`
  `w="var(--anchor-width)"`. Its content renders in place in the top layer, without `portalled`, `portalRef` or
  `lazyMount`, and its live regions follow it
- Removed with Ark: `createListCollection`, `useListCollection`, `CollectionItem`, `ListCollection`, `useListbox`,
  `useCombobox` and their `Use*Props`/`Use*Return` types, `Listbox.RootProvider`, `Listbox.Context`,
  `Combobox.RootProvider`, `Combobox.Context` and `Combobox.Positioner`; `Combobox.Root`'s `onSelect`, `ids`,
  `composite`, `disableLayer`, `navigate`, `scrollToIndexFn`, `translations`, `placeholder` (set it on
  `Combobox.Input`), `onFocusOutside`, `onPointerDownOutside` and `onInteractOutside` (use `details.cancel()`); and
  the `Listbox`/`Listbox.Root` props `ids`, `orientation`, `highlightedValue`, `defaultHighlightedValue`,
  `onHighlightChange`, `onSelect`, `selectOnHighlight`, `scrollToIndexFn`, `deselectable`, `disallowSelectAll` and
  `composite`. Enter on a link option clicks the link, so a router link's own click handler navigates
- Their elements carry `data-slot`, `data-selected` on picked options, `data-checked` or `data-unchecked` on item
  indicators, `data-highlighted` and `data-open` or `data-closed` instead of `data-scope`, `data-part` and
  `data-state`; style options with `_selected`. The combobox content reads `--anchor-width` in place of
  `--reference-width`
- `TreeView`, `TreeSelectList`, `VirtualTree` and the tree drag and drop no longer run on Ark. `TreeView.Root` and
  `TreeSelectList` take the top-level `nodes` with `getNodeValue` and `getNodeLabel` in place of a `collection`, and
  `getChildren`, `getChildrenCount` and `isNodeDisabled` where a node keeps them anywhere but `children`,
  `childrenCount` and `disabled`. The tree re-reads every node when one of these functions changes identity, so define
  them outside the component or memoize them:

  ```tsx
  // before
  const collection = createTreeCollection({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: { id: "root", name: "", children: files },
  });
  <TreeSelectList
    collection={collection}
    value={picked}
    onValueChange={setPicked}
  />;
  // after
  const fileValue = (node: File) => node.id;
  const fileLabel = (node: File) => node.name;

  <TreeSelectList
    nodes={files}
    getNodeValue={fileValue}
    getNodeLabel={fileLabel}
    value={picked}
    onValueChange={setPicked}
  />;
  ```

- Controlled `expandedValue` and `selectedValue` on `TreeView.Root` replace `TreeView.RootProvider` and
  `useVirtualTreeView`. `VirtualTree` drops `tree` and shows the nodes of the `TreeView.Root` around it; annotate its
  render function's entry with your node type:

  ```tsx
  // before
  const tree = useVirtualTreeView({
    collection,
    selectedValue: selected,
    onSelectionChange: ({ selectedValue }) => setSelected(selectedValue),
    expandedValue: expanded,
    onExpandedChange: ({ expandedValue }) => setExpanded(expandedValue),
  });
  <TreeView.RootProvider value={tree.api}>
    <TreeView.Tree aria-label="Chapters">
      <VirtualTree
        tree={tree}
        rowHeight={32}
      >
        {({ node }) => <VirtualTreeRow>{node.label}</VirtualTreeRow>}
      </VirtualTree>
    </TreeView.Tree>
  </TreeView.RootProvider>;
  // after
  const chapterValue = (node: Chapter) => node.id;
  const chapterLabel = (node: Chapter) => node.label;

  <TreeView.Root
    nodes={chapters}
    getNodeValue={chapterValue}
    getNodeLabel={chapterLabel}
    selectedValue={selected}
    onSelectionChange={setSelected}
    expandedValue={expanded}
    onExpandedChange={setExpanded}
  >
    <TreeView.Tree aria-label="Chapters">
      <VirtualTree rowHeight={32}>
        {({ node }: VirtualTreeEntry<Chapter>) => <VirtualTreeRow>{node.label}</VirtualTreeRow>}
      </VirtualTree>
    </TreeView.Tree>
  </TreeView.Root>;
  ```

  The hook's `scrollTo` and `focus` move to `TreeView.Root`'s `actionsRef`, which renders a `VirtualTree` row before it
  scrolls to or focuses it. Its `visibleNodes` and `tabStopIndex` have no replacement; work out the shown rows from
  your nodes and `expandedValue`

- The tree callbacks take values: `onExpandedChange(expandedValue, { expandedNodes, focusedValue })`,
  `onSelectionChange(selectedValue, { selectedNodes, focusedValue })`, `onCheckedChange(checkedValue)`,
  `onRenameComplete(value, { label, indexPath })`, `loadChildren(node, { indexPath, valuePath, signal })`,
  `onLoadChildrenComplete(nodes)` and `onLoadChildrenError(error, { node, indexPath, valuePath })`. The
  `open-change-args` codemod rewrites inline handlers on `TreeView.Root` and `TreeSelectList`; rewrite
  `onLoadChildrenError` by hand
- Trees hand back nodes. `TreeSelectList` and `TreeViewDndProvider` take `onNodesChange(nodes)` in place of
  `onCollectionChange`, `TreeDropDetails` has `nextNodes` and `previousNodes` in place of `nextCollection` and
  `previousCollection`, and `applyTreeDrop(tree, args)` and `moveNodeByKeyboard(tree, value, move)` take
  `{ nodes, getNodeValue, getNodeLabel, … }` and return nodes (`moveNodeByKeyboard`'s `nodes` replaces `next`). Drops
  and loads write a node's new children to `children`, so a tree they change keeps its children there
- Removed with Ark: `createTreeCollection`, `createFileTreeCollection`, `treeViewAnatomy`, `TreeCollection`,
  `TreeNode`, `useTreeView`, `useTreeViewContext`, `useTreeViewNodeContext`, `useVirtualTreeView`, `VirtualTreeView`,
  `VirtualTreeViewProps`, `TreeView.RootProvider`, `TreeView.Context` and `TreeView.NodeContext`; the
  `TreeViewLoadChildren*Details` types (now `TreeLoadChildrenDetails` and `TreeLoadChildrenErrorDetails`); and the
  root props `focusedValue`, `defaultFocusedValue`, `onFocusChange`, `onRenameStart`, `onBeforeRename`,
  `scrollToIndexFn`, `translations`, `id`, `ids`, `lazyMount` and `unmountOnExit`
- Tree elements carry `data-slot`, `data-expanded`, `data-selected`, `data-disabled`, `data-loading` and, on
  `NodeCheckbox`, `data-checked`, `data-unchecked` or `data-indeterminate` instead of `data-scope`, `data-part` and
  `data-state`; style branch indicators with `_expanded`. The pinned branch heading carries `data-pinned` in place of
  `data-part="sticky-branch"`, rows read `--tree-depth` in place of `--depth`, and `TreeDropIndicator` sets
  `--tree-drop-level` in place of `--drop-level`. `TreeView.NodeCheckbox` takes `checked` to show a state other than
  the root's
- `*` expands only the sibling branches, so leaves no longer join `expandedValue`, typeahead skips disabled rows, and
  a rename submitted by leaving its input no longer moves focus back to the row
- `Dialog`, `SubmitDialog`, `DeleteDialog`, `Drawer`, `Sheet`, `CommandPalette` and every phone sheet no longer run
  on Ark. Each renders in place as a `<dialog>` opened with `showModal()`, in the browser's top layer: the rest of the
  page is inert to clicks, Tab and find-in-page, the backdrop is that `<dialog>`'s `::backdrop`, and `z-index` no
  longer orders it. Like the popups, it takes CSS variables from where it is rendered and resets its text styles and
  palette to the page's. Its `<dialog>` is a DOM descendant of where it is rendered, so render one outside any
  `<form>` whose fields it shouldn't join
- `Dialog.Root`, `Drawer.Root`, `Sheet.Root` and `CommandPalette.Root` take `onOpenChange(open, details)`, and the
  drawers `onSnapPointChange(snapPoint)`; `details.reason` is `"swipe"` when a drawer is swiped away. The
  `open-change-args` codemod rewrites inline handlers on them
- The roots need a name: `title`, with an optional `description`, renders the header `Dialog.Header` and
  `Dialog.Title` used to, and `aria-label` names a dialog without one. `Dialog.Content`, `Drawer.Content` and
  `Sheet.Content` take `headerStart` and `headerEnd` for the title header's ends, such as an icon, a back button or
  actions; a `Dialog.CloseTrigger` given in `headerEnd` sits in line with them:

  ```tsx
  // before
  <Dialog.Root>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Archive project?</Dialog.Title>
        <Dialog.Description>Archived projects are read-only.</Dialog.Description>
      </Dialog.Header>
      <Dialog.Body>…</Dialog.Body>
    </Dialog.Content>
  </Dialog.Root>
  <Sheet.Root>
    <Sheet.Content>
      <Sheet.Header endElement={<Sheet.ActionTrigger>Done</Sheet.ActionTrigger>}>
        <Sheet.Title>Filters</Sheet.Title>
      </Sheet.Header>
    </Sheet.Content>
  </Sheet.Root>
  // after
  <Dialog.Root title="Archive project?" description="Archived projects are read-only.">
    <Dialog.Content>
      <Dialog.Body>…</Dialog.Body>
    </Dialog.Content>
  </Dialog.Root>
  <Sheet.Root title="Filters">
    <Sheet.Content headerEnd={<Sheet.ActionTrigger>Done</Sheet.ActionTrigger>} />
  </Sheet.Root>
  ```

  The header parts stay for a header laid out another way; give that root an `aria-label`, which a rendered
  `Dialog.Title` then overrides. `SubmitDialog`'s `title` no longer takes `null`, `undefined` or a boolean.
  `npx jscodeshift -t node_modules/@construkt-kit/ui/codemods/dialog-header-title.ts --extensions=tsx,ts src` moves a
  header that holds only a title and a description to its root, and a `Sheet.Header`'s `startElement` and `endElement`
  to `headerStart` and `headerEnd`, and prints the file and line of a plain header whose root is in another component

- Removed with Ark: `useDialog`, `useDrawer`, `useSheet` and their `Use*Props`/`Use*Return` types,
  `DrawerRootProviderProps`, `Dialog.RootProvider`, `Drawer.RootProvider`, `Sheet.RootProvider`, `Dialog.Context`,
  `Drawer.Context`, `Sheet.Context`, `Dialog.Backdrop`, `Dialog.Positioner`, `Drawer.SwipeArea`, `Dialog.Trigger`'s
  `value`, `Dialog.Content`'s `portalled` and `portalRef`, and the root props `id`, `ids`, `modal`, `trapFocus`,
  `preventScroll`, `finalFocusEl` (use `returnFocusTo`), `lazyMount`, `unmountOnExit`, `present`, `immediate`,
  `skipAnimationOnMount`, `persistentElements`, `triggerValue`, `defaultTriggerValue`, `onTriggerValueChange`,
  `onEscapeKeyDown`, `onInteractOutside`, `onPointerDownOutside`, `onFocusOutside`, `onRequestDismiss`,
  `swipeDirection`, `snapToSequentialPoints`, `swipeVelocityThreshold`, `closeThreshold` and `preventDragOnScroll`. Use
  `details.cancel()` in `onOpenChange` where `onEscapeKeyDown` or an outside handler kept the dialog open;
  `details.reason` tells Escape (`"escape-key"`) from a press outside (`"outside-press"`)
- Their elements carry `data-slot`, `data-open` or `data-closed`, `data-starting-style` and `data-ending-style`
  instead of `data-scope`, `data-part` and `data-state`; the `<dialog>` is the `positioner` slot and the `backdrop`
  slot is gone, so style the backdrop with `_backdrop` on the positioner. Content behind a nested dialog carries
  `data-nested-dialog-open` and reads `--nested-dialogs` in place of `data-nested-drawer-open` and
  `--nested-drawers`. A drawer moves by an inline `transform`, sets `--drawer-swipe-progress` on its `<dialog>`, keeps
  `data-swiping` and `data-swipe-direction` on its content, and no longer sets `--drawer-translate-*`,
  `--drawer-swipe-movement-*`, `--drawer-snap-point-offset-*`, `--drawer-swipe-strength`, `--drawer-height` or
  `--drawer-frontmost-height`
- A modal moves focus in also when it mounts open, keeps Tab inside it, and returns focus to its trigger, or to what
  had focus before it opened, once it has animated out; while it animates out it is inert. Escape and a press
  outside go to the topmost layer only, so a popover, menu or select open inside a dialog closes before the dialog.
  A modal `<dialog>` the page shows itself, inside or over a kit dialog, takes Escape before the kit dialog, and a
  press inside a modal opened over another one never closes the one below. Toasts move into the topmost open modal so they stay clickable
- The page lock sets `overflow: hidden` and, where scrollbars take space, `scrollbar-gutter: stable` on `<html>`;
  `<body>` no longer gets `data-scroll-lock` and `<html>` no longer gets `--scrollbar-width`
- A press on a scrollbar no longer closes the popup or dialog it is outside of
- `Field`, `Fieldset`, `Input`, `Textarea`, `Checkbox`, `CheckboxCard`, `Switch`, `RadioGroup`, `Radio`,
  `RadioCard`, `NumberInput`, `Slider`, `PinInput`, `TagsInput`, `Editable` and `RatingGroup` no longer run on Ark.
  Their value and checked callbacks take the value first and `details` second, with the `reason`, the `event`, a
  `cancel()` that keeps the control as it is, and any other key the old object had:

  ```tsx
  // before
  <Checkbox onCheckedChange={({ checked }) => setAgreed(checked)}>Agree</Checkbox>
  <RadioGroup onValueChange={({ value }) => setPlan(value)}>…</RadioGroup>
  <NumberInput.Root onValueChange={({ value, valueAsNumber }) => setQty(valueAsNumber)}>
  // after
  <Checkbox onCheckedChange={(checked) => setAgreed(checked)}>Agree</Checkbox>
  <RadioGroup onValueChange={(value) => setPlan(value)}>…</RadioGroup>
  <NumberInput.Root onValueChange={(value, { valueAsNumber }) => setQty(valueAsNumber)}>
  ```

  The `open-change-args` codemod rewrites inline handlers on them. The callbacks are `onCheckedChange` on `Checkbox`,
  `Checkbox.Root`, `CheckboxCard` and `Switch`, and `onValueChange` on `RadioGroup` and `RadioCard.Root`
  (`Checkbox.Group`'s already took the array, and now also gets `details`); on `NumberInput.Root`, `onValueChange(value, { valueAsNumber })`,
  `onValueCommit(value, { valueAsNumber })`, `onValueInvalid(value, { reason, valueAsNumber })` and
  `onFocusChange(focused, { value, valueAsNumber })`; on `Slider`, `onValueChange(value)`,
  `onValueChangeEnd(value)` and `onFocusChange(focusedIndex, { value })`; on `PinInput.Root`,
  `onValueChange(value, { valueAsString })`, `onValueComplete(value, { valueAsString })` and
  `onValueInvalid(value, { index })`; on `TagsInput.Root`, `onValueChange(value)`,
  `onInputValueChange(inputValue)`, `onHighlightChange(highlightedValue)` and `onValueInvalid(reason)`; on
  `Editable.Root`, `onValueChange`, `onValueCommit` and `onValueRevert`, each `(value)`; and on `RatingGroup.Root`,
  `onValueChange(value)` and `onHoverChange(hoveredValue)`

- `Editable.Root` takes `editing`, `defaultEditing` and `onEditingChange(editing, details)` in place of `edit`,
  `defaultEdit` and `onEditChange({ edit })`; the `open-change-args` codemod renames them. Controlled `value` and
  `editing` replace `useEditable` with `Editable.RootProvider`: set `editing` to `true` where you called `api.edit()`:

  ```tsx
  // before
  const editable = useEditable({ value, onValueChange: ({ value }) => setValue(value) });
  editable.edit();
  <Editable.RootProvider value={editable}>…</Editable.RootProvider>;
  // after
  const [editing, setEditing] = useState(false);
  setEditing(true);
  <Editable.Root
    value={value}
    onValueChange={setValue}
    editing={editing}
    onEditingChange={setEditing}
  >
    …
  </Editable.Root>;
  ```

- `onValueCommit` and `onValueRevert` run once editing has ended, after `onEditingChange(false)`, and focus then goes to
  `finalFocusEl`, the edit trigger or the preview. A press outside submits on release rather than on press, an
  editable inside a popover or dialog stops editing before the overlay closes, and Escape while editing restores the
  value
- `PinInput.Root` takes `masked` in place of `mask`, which Panda read as the CSS property; the `open-change-args`
  codemod renames it
- A control's `id` is its input's: `Checkbox`, `CheckboxCard` and `Switch` put it on their `<input>`, and inside a
  `Field` the label points at whichever control sets its own `id`. `Field` loses `ids` and `target`, and adds its
  description to a control's own `aria-describedby` instead of replacing it. A `TagsInput` inside a `Field` gives its
  visible input the field's id, so the label focuses it, and a `Slider` takes the field's `disabled`, `readOnly`,
  `invalid` and label
- `onValueInvalid` on `NumberInput.Root` fires when the value moves outside `min`–`max`, no longer also when it moves
  back. `TagsInput`'s `onHighlightChange` gets the highlighted tag's value, not its element id. `RatingGroup`'s
  `autoFocus` focuses the checked item, or the first, as it mounts
- `Slider`'s `onValueChangeEnd` runs only after a drag or key press that changed the value
- A `TagsInput` renders its `role="alert"` live region at the end of its root, while it is neither `disabled` nor
  `readOnly`, instead of appending one to `<body>` for every instance, so it still announces inside a modal
- With `addOnPaste`, a `TagsInput` skips empty entries, and existing tags unless `allowDuplicates`, and adds no more
  than `max` allows unless `allowOverflow`
- Removed with Ark: `useCheckbox`, `useRadioGroup`, `useFieldset`, `usePinInput`, `useTagsInput`, `useEditable`,
  `useRatingGroup` and their `Use*Props`/`Use*Return` types; `Checkbox.RootProvider`, `Checkbox.Context`,
  `RadioCard.RootProvider`, `RadioCard.Context`, `Fieldset.RootProvider`, `Fieldset.Context`,
  `NumberInput.Context`, `PinInput.RootProvider`, `PinInput.Context`, `TagsInput.RootProvider`,
  `TagsInput.Context`, `Editable.RootProvider`, `Editable.Context`, `RatingGroup.RootProvider`,
  `RatingGroup.Context` and `RatingGroup.ItemContext`; the root props `ids` and `getRootNode`; and `TagsInput.Root`'s
  and `Editable.Root`'s `onFocusOutside`, `onPointerDownOutside` and `onInteractOutside` (use `details.cancel()` in
  `onEditingChange`)
- Their elements carry `data-slot`, `data-checked`, `data-unchecked` or `data-indeterminate`, `data-disabled`,
  `data-read-only`, `data-invalid` and `data-focus-visible` instead of `data-scope`, `data-part`, `data-state`,
  `data-readonly`, `data-hover`, `data-active` and `data-focus`. An indeterminate checkbox no longer matches
  `_checked`; style it with `_indeterminate`. `Checkbox.Indicator` renders nothing while unchecked. A rating's two
  icons are the `itemIndicatorBg` and `itemIndicatorFg` slots in place of `[data-bg]` and `[data-fg]`, a slider mark's
  label is the `markerLabel` slot in place of `data-has-mark-label`, and an `autoResize` editable takes its layout from
  the recipe's `autoResize` variant
- `RadioCard.Indicator` reads `--indicator-left`, `--indicator-top`, `--indicator-width` and `--indicator-height` in
  place of `--left`, `--top`, `--width` and `--height`. The slider root no longer sets `--slider-thumb-offset-N`,
  `--slider-thumb-transform`, `--slider-range-start`, `--slider-range-end`, `--slider-thumb-width` or
  `--slider-thumb-height`; thumbs, marks and the range are placed by inline geometry
- The preset's `_readOnly` matches `[readonly]`, `[data-read-only]` and `[aria-readonly=true]`, no longer `:read-only`,
  which every element that isn't an editable field matches. New: `_half`, for a half-filled rating star
- ui depends on `@internationalized/number` for `NumberInput`'s locale-aware parsing
- `Tabs`, `ToggleGroup`, `SegmentGroup`, `Accordion` and `Collapsible` no longer run on Ark. `onValueChange` takes
  `(value, details)`: the selected tab's value on `Tabs.Root`, the pressed or open items' values on
  `ToggleGroup.Root` and `Accordion.Root`, and the picked value or `null` on `SegmentGroup.Root`. `Collapsible.Root`
  takes `onOpenChange(open, details)`. The `open-change-args` codemod rewrites inline handlers on them:

  ```tsx
  // before
  <Tabs.Root onValueChange={({ value }) => setTab(value)}>
  <ToggleGroup.Root multiple onValueChange={({ value }) => setParts(value)}>
  <Collapsible.Root onOpenChange={({ open }) => setOpen(open)}>
  // after
  <Tabs.Root onValueChange={(value) => setTab(value)}>
  <ToggleGroup.Root multiple onValueChange={(value) => setParts(value)}>
  <Collapsible.Root onOpenChange={(open) => setOpen(open)}>
  ```

- A hidden panel unmounts: `Tabs.Content` while another tab is selected, and `Accordion.ItemContent` and
  `Collapsible.Content` while closed, where Ark kept every panel mounted with `hidden`. `keepMounted` on a panel keeps
  its DOM and state, hidden in an `<Activity>` that pauses its effects until it shows again. It replaces the roots'
  `lazyMount` and `unmountOnExit`; drop those:

  ```tsx
  // before: every panel stayed mounted
  <Tabs.Content value="settings">…</Tabs.Content>
  // after: keep a hidden panel's state, such as a half-filled form
  <Tabs.Content value="settings" keepMounted>…</Tabs.Content>
  ```

- ui, pages and data-grid peer on `react` and `react-dom` `^19.3.0`, for `<Activity>`
- Removed with Ark: `useTabs`, `useToggleGroup`, `useSegmentGroup`, `useAccordion`, `useCollapsible` and their
  `Use*Props`/`Use*Return` types; `Tabs.RootProvider`, `Tabs.Context`, `ToggleGroup.RootProvider`,
  `ToggleGroup.Context`, `ToggleGroupRootProviderProps`, `SegmentGroup.RootProvider`, `SegmentGroup.Context`,
  `Accordion.RootProvider`, `Accordion.Context`, `Collapsible.RootProvider` and `Collapsible.Context`; `Tabs.Root`'s
  `deselectable`, `composite`, `navigate`, `translations` (set `aria-label` on `Tabs.List`) and `onFocusChange`;
  `Accordion.Root`'s `onFocusChange`; `Collapsible.Root`'s `collapsedHeight`, `collapsedWidth` and `onExitComplete`;
  and their `ids`
- With no tab selected, Tab reaches the first enabled tab, where the tab list used to be unreachable, and arrow keys
  across a tab list's orientation scroll the page again. A toggle group's root is no longer focusable: Tab lands on
  its first enabled item, or the item focused last while focus stays in the group. Accordion arrow keys skip disabled
  triggers, wrap, and swap left and right in a right-to-left horizontal accordion. A disabled `Collapsible.Trigger` is
  a disabled `<button>`, and a trigger whose panel is unmounted has no `aria-controls`
- Their elements carry `data-slot` instead of `data-scope`, `data-part`, `data-state`, `data-focus` and
  `data-ownedby`. Toggle items carry `data-pressed` in place of `data-state="on"`/`"off"`; style them with `_pressed`
  (the preset's `_on` matches `data-pressed`, and no longer `data-state="on"`). Tab triggers carry `data-selected`, `data-disabled`,
  `data-orientation` and `data-value`, and tab panels `data-selected` while shown. Segment items carry `data-checked`
  or `data-unchecked`, `data-disabled`, `data-read-only`, `data-invalid` and `data-focus-visible`. Accordion items,
  triggers, indicators and panels, and the collapsible's root, trigger, indicator and panel carry `data-open` or
  `data-closed` and `data-disabled`. Panels carry `data-starting-style` and `data-ending-style`
- `Button` and `IconButton` take `pressed` for a toggle button. It sets `aria-pressed`, and `data-pressed` while on,
  which the button recipe's `_on` styles; give it in place of `aria-pressed` with `data-state="on"`
- A resting open panel keeps `data-open`, where Zag dropped `data-state` once its open animation ended, and carries an
  inline `animation-name: none`, so mounting open or an ancestor showing it again doesn't replay the animation
- `Tabs.Indicator` and `SegmentGroup.Indicator` read `--indicator-left`, `--indicator-top`, `--indicator-width` and
  `--indicator-height` in place of `--left`, `--top`, `--width` and `--height`, take their position and transition from
  the recipe instead of inline styles, and also slide when the list resizes. Panels read `--collapsible-height` and
  `--collapsible-width` in place of `--height` and `--width`, as do the preset's `expand-height` and `collapse-height`
  keyframes, and a closing panel holds its collapsed frame until it unmounts
- New preset conditions: `_afterChecked` and `_afterPressed`, for an item that follows a checked or pressed one (the
  segmented controls' dividers), and `_filled`
- `FileUpload` and `FormFileUpload` no longer run on Ark. `FileUpload.Root` takes `value`, `defaultValue` and
  `onValueChange(files, details)` in place of `acceptedFiles`, `defaultAcceptedFiles`, `onFileChange` and
  `onFileAccept`, and `onFileReject(rejectedFiles, details)`. `details.rejectedFiles` holds the files refused alongside
  and `details.cancel()` keeps the files as they are; `onValueChange` runs only when the accepted files change. The
  `open-change-args` codemod renames the props and rewrites inline handlers, and reports a root with both
  `onFileChange` and `onFileAccept`. `FormFileUpload` keeps its `onFileChange(file)`
- `FileUpload.Context` and `setClipboardFiles` give way to the root's `render` state: a function `render` gets
  `{ value, rejectedFiles, dragging, disabled, readOnly, invalid, required, addFiles }`. `addFiles(files)` runs files
  through the same transform and validation as a pick and returns whether any were accepted:

  ```tsx
  // before
  <FileUpload.Root maxFiles={5} acceptedFiles={files} onFileAccept={(details) => setFiles(details.files)}>
    <FileUpload.HiddenInput />
    <FileUpload.Dropzone>Drop or paste files here</FileUpload.Dropzone>
    <FileUpload.Context>
      {(upload) => (
        <>
          <PastedFiles upload={upload} />
          <RefusedFiles rejected={upload.rejectedFiles} />
        </>
      )}
    </FileUpload.Context>
  </FileUpload.Root>
  // after: PastedFiles calls addFiles([...dataTransfer.files]) where it called upload.setClipboardFiles(dataTransfer)
  <FileUpload.Root
    maxFiles={5}
    value={files}
    onValueChange={(next) => setFiles(next)}
    onFileReject={(rejected) => setRejected(rejected)}
    render={(props, { addFiles }) => (
      <section {...props}>
        <PastedFiles addFiles={addFiles} />
        {props.children}
      </section>
    )}
  >
    <FileUpload.HiddenInput />
    <FileUpload.Dropzone>Drop or paste files here</FileUpload.Dropzone>
    <RefusedFiles rejected={rejected} />
  </FileUpload.Root>
  ```

- Removed with Ark: `useFileUpload`, `UseFileUploadProps`, `UseFileUploadReturn`, `FileUpload.RootProvider` and the
  root props `ids`, `getRootNode` and `translations`; the locale comes from `LocaleProvider`. Inside a `Field` the
  hidden input still takes the field's id, `disabled`, `readOnly`, `invalid` and `required`, and it picks up
  `defaultValue` files as it mounts
- File upload elements carry `data-slot`, `data-disabled`, `data-read-only`, `data-invalid`, `data-dragging` and
  `data-required` instead of `data-scope`, `data-part` and `data-readonly`; style read-only parts with `_readOnly`.
  A `transformFiles` that rejects surfaces as an unhandled rejection, and `ItemPreviewImage` on a file that isn't an
  image throws an error that names the fix
- `Clipboard`, `Avatar`, `Progress`, `Pagination` and `Highlight` no longer run on Ark. `Clipboard.Root` takes `value`,
  `timeout` and `translations.triggerLabel`, and `onStatusChange(copied, details)`; `details.reason` is
  `"trigger-press"` or `"input-copy"`, and `details.cancel()` keeps the value off the clipboard; a copy the browser
  refuses calls `onStatusChange(false, details)` with `"copy-error"` and never shows as copied. `Avatar.Root` takes
  `onStatusChange(status)`, `"loaded"` or `"error"`. The `open-change-args` codemod rewrites inline handlers on both
- `Pagination.Root` takes `value`, `defaultValue` and `onValueChange(page, details)` in place of `page`,
  `defaultPage` and `onPageChange`, since Panda read `page` as the CSS property; `details` has the `pageSize`. The
  `open-change-args` codemod renames them and rewrites inline handlers:

  ```tsx
  // before
  <Pagination.Root count={120} page={page} onPageChange={({ page }) => setPage(page)}>
  // after
  <Pagination.Root count={120} value={page} onValueChange={(page) => setPage(page)}>
  ```

- `Progress.Root` takes `value` (`null` while indeterminate, the midpoint of `min` and `max` when left out), `min`,
  `max`, `formatOptions`, `orientation` and `translations.value`; the locale comes from `LocaleProvider`, and a value
  outside `min`–`max` no longer throws
- Removed with Ark: `useClipboard`, `useAvatar`, `useProgress`, `usePagination` and their `Use*Props`/`Use*Return`
  types; `Clipboard.RootProvider`, `Clipboard.Context`, `Avatar.RootProvider`, `Avatar.Context`,
  `Progress.RootProvider`, `Progress.Context`, `Pagination.RootProvider` and `Pagination.Context`; `Clipboard.Root`'s
  `defaultValue` and `onValueChange`, `Progress.Root`'s `defaultValue`, `onValueChange` and `locale`,
  `Pagination.Root`'s `defaultPageSize` and `onPageSizeChange` (`pageSize` is a plain prop) and
  `Pagination.Ellipsis`'s `index`; and their `ids`. `useHighlight`, `HighlightChunk` and `UseHighlightProps` keep their
  signatures
- Their elements carry `data-slot` instead of `data-scope` and `data-part`. The clipboard input carries
  `data-read-only` in place of `data-readonly="true"`, and the avatar's image and fallback lose `data-state` (read
  their `hidden` attribute). A progress part's `data-state="indeterminate"`, `"loading"` or `"complete"` becomes
  `data-indeterminate`, `data-loading` or `data-complete`; style it with `_indeterminate`, and a filled segment with
  `_filled`. The progress root sets `--progress-percent` in place of `--percent`, the circle reads `--progress-radius`
  and `--progress-circumference` in place of `--radius`, `--circumference` and `--offset`, and its
  `fill: transparent` comes from the recipe
- `Stat`'s trend arrow is a text node in the trend indicator instead of `::before` content; `data-direction` stays
- `Calendar`, `DatePicker` and `DatePickerSelect` no longer run on Ark. `onValueChange` takes `(value, details)`, where
  `details` has the `reason` (`"item-press"`, `"preset-press"` or `"clear-press"`), the `event` and a `cancel()` that
  keeps the dates, and `onOpenChange` takes `(open, details)`. A handler that takes only the value or the open state
  keeps working
- `parseDate` is no longer re-exported. Import it from `@internationalized/date`, which ui depends on; add it to your
  app's dependencies:

  ```tsx
  // before
  import { DatePicker, parseDate } from "@construkt-kit/ui";
  import { DatePicker } from "@construkt-kit/ui";
  // after
  import { parseDate } from "@internationalized/date";
  ```

  `DateValue`, `DateView` and `DateRangePreset` stay exported from ui

- `DatePicker` and `DatePickerSelect` render their calendar in place in the top layer, without `portalled` or
  `portalRef`, and take `placement` for where it opens against the trigger. Each picker renders its `role="alert"` live
  region at the end of its root instead of appending one to `<body>`, so it still announces inside a modal. Only the
  current view's grid renders, where Ark kept the day, month and year views mounted with `hidden`
- Calendar elements carry `data-slot` instead of `data-scope`, `data-part` and `data-state`. Day, month and year buttons
  carry `data-selected`, `data-today`, `data-in-range`, `data-range-start`, `data-range-end`, `data-unavailable`,
  `data-disabled`, `data-outside-range`, `data-in-hover-range`, `data-hover-range-start`, `data-hover-range-end` and,
  on days, `data-weekend` and `data-value`; they no longer carry `data-focus`, `data-selectable` or `data-view` (the
  grid keeps `data-view`, and the day the arrow keys move from has `tabindex="0"`). The root carries `data-disabled`,
  `data-read-only` and `data-empty`. Style in-range days with `_inRange`
- A preset closes an uncontrolled `DatePicker` through `onOpenChange(false, details)`, where Ark closed it without
  calling `onOpenChange`
- `ColorPicker` no longer runs on Ark. `ColorPicker` and `ColorPicker.Root` take `onValueChange(value, details)` and
  `onValueChangeEnd(value, details)`, where `details` has `valueAsString` and, on `onValueChange`, the `reason`, the
  `event` and a `cancel()` that keeps the color; `onFormatChange(format)`; and `onOpenChange(open, details)`. The
  `open-change-args` codemod rewrites inline handlers on them:

  ```tsx
  // before
  <ColorPicker onValueChange={({ value }) => setColor(value)} />
  // after
  <ColorPicker onValueChange={(value) => setColor(value)} />
  ```

- `parseColor` moves to `@construkt-kit/utils`. A color is a plain object (`{ format: "rgba", red, green, blue, alpha }`,
  or `hsla`/`hsba` with `hue`, `saturation` and `lightness`/`brightness`), and its methods are functions:

  ```tsx
  // before
  import { parseColor } from "@construkt-kit/ui";
  const hex = value.toString("hex");
  const hue = value.getChannelValue("hue");
  // after
  import { formatColor, getColorChannelValue, parseColor } from "@construkt-kit/utils";
  const hex = formatColor(value, "hex");
  const hue = getColorChannelValue(value, "hue");
  ```

  `toFormat` is `convertColor`, `withChannelValue` `setColorChannelValue`, `getChannelRange` `getColorChannelRange`,
  `getChannels` `getColorChannels`, `isEqual` `isColorEqual`, `incrementChannel`/`decrementChannel`
  `incrementColorChannel`/`decrementColorChannel`, `formatChannelValue` `formatColorChannelValue`,
  `getChannelValuePercent`/`getChannelPercentValue` `getColorChannelValuePercent`/`getColorChannelPercentValue`, and
  `getFormat()` is `color.format`; `toHexInt`, `clone` and `toJSON` are gone

- `ColorPicker.Root` takes `placement` in place of `positioning`. Its content renders in place in the top layer, without
  `portalled` or `portalRef`
- Removed with Ark: `useColorPicker`, `UseColorPickerProps`, `UseColorPickerReturn`, `ColorPicker.RootProvider`,
  `ColorPicker.Context` and `ColorPicker.Positioner`; `portalled` and `portalRef` on `ColorPicker` and
  `ColorPicker.Content`; and the root props `id`, `ids`, `dir` (it comes from `LocaleProvider`), `getRootNode`,
  `openAutoFocus`, `lazyMount`, `unmountOnExit`, `onInteractOutside`, `onPointerDownOutside` and `onFocusOutside` (use
  `details.cancel()` in `onOpenChange`)
- `onValueChangeEnd` also runs after a key press on a thumb and a swatch press, and only when the value changed. Page Up and Page Down on a channel slider
  step by ten of its steps, and a channel slider's keys and value text read the same color space as its track, so a hue
  slider no longer throws on an RGB color. Inside a `Field` the trigger is named by the field's label and then its own
  name, and takes the field's messages and invalid state
- Color picker elements carry `data-slot`, `data-open` or `data-closed`, `data-disabled`, `data-read-only` and
  `data-invalid` instead of `data-scope`, `data-part`, `data-state`, `data-readonly` and `data-focus`; swatches and
  swatch triggers carry `data-checked` or `data-unchecked`, and the content `data-dragging` while a thumb is dragged.
  Parts set variables the recipe paints with instead of inline colors: `--color-picker-color` in place of `--color` on
  thumbs and swatches, `--color-picker-value` in place of the root's `--value`, `--color-picker-grid-size` in place of
  the transparency grid's `--size`, and `--color-picker-area-bg`, `--color-picker-area-gradient`,
  `--color-picker-area-mask` and `--color-picker-track-bg` on the area, its background and the slider tracks
- `Field`'s root carries `data-slot`, `data-disabled`, `data-invalid` and `data-read-only` instead of
  `data-scope="field"`, `data-part="root"` and `data-readonly`; it keeps its `id` and no longer has `role="group"`,
  since a Field wraps one control its label names; group related fields in a `Fieldset`
- `Toaster` and `toaster` no longer run on Ark. `toaster` keeps `create`, `success`, `error`, `info`, `warning`,
  `loading`, `promise`, `update`, `dismiss`, `remove`, `pause`, `resume`, `expand`, `collapse`, `isVisible`,
  `isDismissed`, `getVisibleToasts` and `getCount`. It is typed `ToastStore` in place of Ark's `CreateToasterReturn`,
  and ui exports `Toast`, `ToastOptions`, `ToastType`, `ToastStatus`, `ToastAction`, `ToastPriority` and
  `ToastPromiseOptions`:

  ```tsx
  // before
  import type { CreateToasterReturn } from "@construkt-kit/ui";
  // after
  import type { ToastStore } from "@construkt-kit/ui";
  ```

- A toast's `type` is `"success"`, `"error"`, `"info"`, `"warning"` or `"loading"`, and `onStatusChange` takes the
  status, `"visible"`, `"dismissing"` or `"unmounted"`:

  ```tsx
  // before
  toaster.create({ title: "Saved", onStatusChange: ({ status }) => log(status) });
  // after
  toaster.create({ title: "Saved", onStatusChange: (status) => log(status) });
  ```

- `success`, `error`, `info`, `warning` and `loading` return the toast's id, and `promise` always returns
  `{ id, unwrap }`. Removed with Ark: `removeDelay` (a toast unmounts once its exit transition ends) and the store's
  `attrs`, `subscribe` and `subscribeLayout`
- Toasts render in the browser's top layer, inside the topmost open modal while one is open, so popovers and menus no
  longer cover them and they take clicks under a modal dialog. A press, focus or Escape in the toaster no longer
  closes the popover, menu or dialog under it, and Escape on a toast dismisses that toast. Swiping a toast up or
  towards the inline end dismisses it. Focus that moves from a toast to another element stays there; Ark sent it back
  to where it was before the toaster
- Toast elements carry `data-slot`, `data-open` or `data-closed`, `data-expanded` or `data-collapsed`, `data-paused`,
  `data-type`, `data-starting-style` (the first frame of a new toast), `data-swiping` and `data-swipe-direction` instead
  of `data-scope`, `data-part`, `data-state`, `data-mounted`, `data-first`, `data-sibling`, `data-stack`,
  `data-overlap`, `data-placement`, `data-side` and `data-align`, and the region has no `id`. The toast recipe reads
  `--toast-index`, `--toast-offset-y`, `--toast-height`, `--toast-frontmost-height` and `--toast-swipe-movement-x`/`-y`
  in place of Zag's inline `--x`, `--y`, `--scale`, `--opacity`, `--height`, `--z-index`, `--index`, `--offset`,
  `--initial-height`, `--first-height`, `--gap`, `--lift`, `--duration` and `--remove-delay`; style the stack with
  `_expanded`, `_collapsed`, `_swiping` and `_swipeUp`/`_swipeRight`/`_swipeLeft`, and a new toast's entry with
  `_startingStyle`. The toaster's position and insets come from the recipe, and `--toaster-inset-x` is gone
- `ScrollArea` and its parts no longer run on Ark. `ScrollArea`, `VirtualScrollArea` and their props are unchanged.
  `ScrollArea.Root` loses Ark's `ids`, `id`, `dir` and `getRootNode`; the direction comes from `LocaleProvider`, and a
  viewport rendered as your own element is found without an id:

  ```tsx
  // before
  <ScrollArea.Root ids={{ viewport: "results" }}>
    <ScrollArea.Viewport render={<ul id="results" />}>
  // after
  <ScrollArea.Root>
    <ScrollArea.Viewport render={<ul id="results" />}>
  ```

- Scroll area elements carry `data-slot` instead of `data-scope`, `data-part` and `data-ownedby`. The root and viewport carry `data-overflow-x`, `data-overflow-y`, `data-at-top`,
  `data-at-bottom`, `data-at-left` and `data-at-right`. A scrollbar whose axis doesn't overflow, and the corner unless
  both axes overflow, carry `hidden` in place of the corner's `data-state`. Style them with `_overflowX`, `_overflowY`,
  `_atTop`, `_atBottom`, `_atLeft`, `_atRight` and `_scrolling`, and a left-pinned cell with `_pinnedLeft`
- The root's `--thumb-width`, `--thumb-height`, `--corner-width` and `--corner-height` become
  `--scroll-area-thumb-width` and `--scroll-area-thumb-height` on the thumb, and `--scroll-area-corner-width` and
  `--scroll-area-corner-height` on the corner and scrollbars. `--scroll-area-thumb-offset` replaces the thumb's inline
  `transform`. These variables and `--scroll-area-overflow-*` are registered and don't inherit
- The scrollbars' and corner's `position` and insets, the viewport's `overflow` and the content's `min-width` come from
  the recipe instead of inline styles, so `css` on those parts now overrides them
- A scrollbar shows `data-scrolling` only while you scroll (wheel, touch, keys, a thumb drag), not when a script
  scrolls. `data-hover` is set for mouse and pen only. Pressing a scrollbar no longer takes focus from the page
- `Carousel` no longer runs on Ark. `Carousel.Root` takes `value`, `defaultValue` and `onValueChange(page, details)` in
  place of `page`, `defaultPage` and `onPageChange`, since Panda read `page` as the CSS property, and `peek` in place of
  `padding`, which Panda read as the root's padding. `details` has the `reason` (`"prev-press"`, `"next-press"`,
  `"indicator-press"`, `"keyboard"`, `"autoplay"`, `"scroll"` or `"layout-change"`), the `event` and a `cancel()` that
  stays on the current page. The `open-change-args` codemod renames them and rewrites inline handlers:

  ```tsx
  // before
  <Carousel.Root slideCount={5} page={page} padding="2rem" onPageChange={({ page }) => setPage(page)}>
  // after
  <Carousel.Root slideCount={5} value={page} peek="2rem" onValueChange={(page) => setPage(page)}>
  ```

- Removed with Ark: `useCarousel`, `UseCarouselProps`, `UseCarouselReturn`, `Carousel.RootProvider`,
  `Carousel.Context`, `translations.progressText`, and the root props `id`, `ids`, `onAutoplayStatusChange` and
  `onDragStatusChange`; the direction comes from `LocaleProvider`. Control the page with `value`, and draw the autoplay
  trigger from its `render` state:

  ```tsx
  <Carousel.AutoplayTrigger
    render={(props, { playing }) => (
      <button {...props}>{playing ? <PauseIcon /> : <PlayIcon />}</button>
    )}
  />
  ```

- Autoplay pauses while the pointer is over the carousel, focus is inside it (except on the autoplay trigger) or the
  page is hidden, and resumes after; a swipe or wheel on the slides stops it, as a drag or a page move does. Arrow keys
  on the slides follow `orientation` (Up and Down on a vertical carousel), mirror in right-to-left, and leave text
  fields, sliders, selects and radios inside a slide alone. `autoSize` and `snapType` are recipe variants on
  `Carousel.Root`. The previous, next and autoplay triggers render a plain large `IconButton`, so the autoplay trigger
  shows as pressed while it plays
- Carousel elements carry `data-slot` instead of `data-scope` and `data-part`, and an indicator carries
  `data-read-only` in place of `data-readonly`. The item group sets `--carousel-slides-per-page`, `--carousel-spacing`
  and `--carousel-peek` in place of the root's `--slides-per-page`, `--slide-spacing` and `--slide-item-size`, and each
  slide sets `--carousel-snap-align`; the item group's grid, overflow and scroll-snap styles move from inline styles
  into the recipe
- ui depends on `@internationalized/date` and no longer on `@ark-ui/react` or `@zag-js/dismissable`. An app that
  imports Ark itself adds `@ark-ui/react` to its own dependencies, and wraps the Ark components that format by locale
  in Ark's `LocaleProvider`: the kit's no longer provides Ark's locale context
- `Portal` is the kit's own. It takes `target` in place of Ark's `container`, and `disabled`. Without `target` it
  mounts into the nearest `PortalContainer`, else the topmost open modal, else `<body>`, so what it holds stays
  interactive while a `Dialog` or `Drawer` is open. It renders nothing until the first client render has committed,
  where Ark's rendered its children in place on the server. `ActionBar.Content`'s `bottom` bar mounts the same way.
  The codemod renames `container`
- `Skeleton` no longer reads `--duration` or `--fade-duration`; set `animationDuration` instead
- `Popover.Root` takes `disabled`, which keeps the popover closed and leaves its trigger plain; `SubmitDialog` takes
  `destructive`; `PromptPopover` takes `tooltip`; `DeleteDialog` takes the rest of `SubmitDialog`'s props
- A `Tooltip` stays closed while its trigger has `aria-expanded="true"`, and closes when its trigger expands while it
  shows, so an open menu's or an expanded accordion's trigger shows no tooltip over its content
- `Dialog`, `Drawer`, `Sheet`, `CommandPalette` and `ActionBar` don't call `onOpenChange` for a request that would leave
  them as they are, such as a close pressed during the exit animation. An uncontrolled `CommandPalette` calls
  `onQueryChange("")` and `onPagesChange` on exit when they changed, and an uncontrolled `Drawer` calls
  `onSnapPointChange` with its default snap point when it closes away from it
- A part given `render={<button />}` without a `type` no longer gets `type="button"`, as `Button` already didn't; inside
  a `<form>` that button submits, so give the render element `type="button"`. The same holds for `NumberInput`'s
  steppers, `TagsInput`'s clear and delete triggers, `Pagination`'s items and triggers and `Sortable.Handle`, and
  `Sortable.Root`, `Sortable.Item` and `Sortable.Handle` take `render`
- `Select.Trigger` uses its `render` element in place of the default button, as the codemod's output expects.
  `Checkbox.Indicator`, `ColorPicker.HiddenInput`, `Listbox.ItemHint`, `Select.Footer`, `ApplySelect.Footer` and
  `Table.ScrollArea` take `render`, and the types of `FileUpload.FileText`, `RatingGroup.ItemIndicator`,
  `HotkeyInput`, `ScrollArea`, `VirtualScrollArea`, `VirtualTree`, `Select.List` and `ApplySelect.List` accept it.
  `SelectListProps` drops `role`, which the list always sets, and `HotkeyInputProps` drops the root's `ref`
- `RadioGroup`, `RadioCard`, `SegmentGroup` and `Checkbox.Group` take `disabled`, `readOnly`, `invalid` and `required`
  from an enclosing `Field`, and a `Combobox` or `PinInput` inside a disabled `Fieldset` is disabled. A radio group or
  `Checkbox.Group` without a label of its own is named by the Field's label and described by its helper and error
  text, while each checkbox in the group keeps its own id and label. Read-only radios are no longer `disabled`: they
  submit their value and stay in the Tab order. A radio group without a `name` submits nothing, where it submitted
  under a generated name. A `required` Field around a `Checkbox.Group` needs at least one box checked
- Pressing a Field's label focuses its control when no element carries the label's `for`, without opening or checking
  anything: a `Select`, `DatePicker` or `ColorPicker` trigger, the checked or first radio of a radio group, the first
  enabled checkbox of a `Checkbox.Group`, a `Slider`'s first thumb, or an inline `Calendar`'s or `ColorPicker`'s
  control. A `ColorPicker` or `DatePicker` trigger given its own `id` stays named by the Field's label
- A part given its own `id` keeps every reference to it: labels, titles, descriptions, legends, helper and error
  texts, inputs, content, triggers, items and options. An input given its own `id` inside a `Field` is the one the
  Field's label points at. Put the `id` on the part, not on its `render` element, which no other part sees. A
  reference is left off while the part it points at isn't rendered, and `htmlFor`, a trigger's `aria-controls` and
  the `aria-labelledby` of tab and accordion content are set after hydration
- `HotkeyInput` takes its id, label, description, `disabled` and `invalid` from an enclosing `Field`, so pressing the
  Field's label starts recording. An open `Select` inside a `Field` is named by the Field's label, and its trigger keeps
  the selected value in its name when `triggerProps` sets an `id`
- `Combobox` and `PinInput` go back to their initial value when their form resets, with the reason `"form-reset"`.
  Leaving a `Combobox` whose list is closed puts the selected item's label back in place of typed text that matches no
  item, with the reason `"revert"`, unless `allowCustomValue` is set
- `RatingGroup.HiddenInput` and `TagsInput.HiddenInput` are visually hidden instead of `hidden`, so an empty `required`
  one blocks submit and focuses the stars or the text input. An unrated `RatingGroup` submits `""` in place of `"-1"`;
  `RatingGroup.Root` sets `dir` from `LocaleProvider`, and a disabled one is dimmed. `data-checked` marks only the
  rated item and `data-unchecked` the others, on items and on `RatingGroup.ItemIndicator`
- `useAnnouncer` returns `cancel()`, and `announce(message, delay?)` lands at least 100 ms later and no sooner than
  200 ms after the region mounts, so VoiceOver reads it; a message equal to the last one is announced again
- `usePointerDrag` takes `onRelease(point, { dragged, cancelled })`, called after every press it accepted; a context
  menu cancels a drag, and a mouse move with no button held ends a drag whose release was lost. On iOS a drag holds
  text selection off until just after it ends, in every control built on it
- `Slider`: all four arrow keys step a thumb whatever its orientation, a press on a thumb grabs it where pressed
  instead of jumping, and a drag cut short by `disabled` still calls `onValueChangeEnd` when the value moved.
  `ColorPicker`: the alpha slider of an `rgba` picker edits in rgba, and a press on a thumb off its centre no longer
  moves the color
- `Collapsible.Trigger` reads `aria-expanded="false"` as soon as it closes, while the content animates out, and
  `Collapsible.Indicator` is `aria-hidden`
- `TreeView.Root` takes `isNodeCheckable(node)` and `selectionMode="none"`. Shift+click and Shift+arrows extend from
  the last row picked and skip disabled rows, and Ctrl+A selects every enabled node, as in `Listbox`. A
  click on a branch row that isn't a link calls `preventDefault`. A lazy-loading `TreeView` keeps its loaded branches
  across a drag-and-drop reorder
- In a `TreeView` or a multiple-selection `Listbox`, with no row pressed yet, or once that row is collapsed away or
  dropped from `items`, Shift+arrows extend from the focused row and Shift+click acts as a plain click. A plain arrow,
  Home or End move keeps the anchor, so Shift+Space after one selects from the last row picked. Extending a
  range drops every row the previous range selected, hidden ones included. Shift+Space extends the selection, and in a
  `TreeView` Ctrl/⌘+Space toggles a row and Space on a link row no longer scrolls the page
- Drag and drop hands back a branch it empties with `childrenCount: 0`, so a custom `getChildrenCount` falls back to
  that field. `TreeViewDndProvider`'s `isBranchLoaded` defaults to whether `loadChildren` has loaded the branch, or,
  without `loadChildren`, whether it is expanded
- Drag auto-scroll, in `Sortable` and tree drag and drop, starts within 40 px of an edge and keeps
  scrolling while the pointer is past it; ui no longer depends on `@atlaskit/pragmatic-drag-and-drop-auto-scroll`
- `DataTable` takes `defaultParams`, and `params` and `onParamChange` are optional. Its card view's sort list is a
  radio group that arrow keys move through. The column sorter and resize handle carry `data-slot="columnSorter"` and
  `data-slot="columnResizeHandle"` in place of `data-part`. Its header, cards and pagination mirror in right-to-left
- `Calendar` and `DatePicker` join a range with " – " and several dates with ", ", in labels and announcements. Month
  and year cells set `aria-selected="false"` when unselected, their cell no longer carries `data-selected` (the button
  inside keeps it), and month names follow the date's calendar in every locale
- `TagsInput` validates each pasted tag on its own and drops the ones `validate` refuses, refuses a typed tag once
  the value is over `max`, keeps typed text that `validate` refuses in the input, and no longer announces a duplicate
  as added. An edited tag goes through `sanitizeValue` and `validate` too, and one they refuse stays open with
  `onValueInvalid("invalidTag")`. A disabled `TagsInput.Item` can't be deleted or edited from the keyboard, carries
  `data-disabled` on its parts and is dimmed; clearing keeps disabled tags, and the clear trigger hides once only they
  are left. Form reset and a disabled `<fieldset>` reach a `TagsInput` without `TagsInput.HiddenInput`
- `ToggleGroup`: Tab lands on the checked item of a single-select group, and turning `rovingFocus` off puts every item
  back in the Tab order
- `Carousel` with `allowMouseDrag`: a mouse drag of more than 10 px no longer clicks the slide it started on, and a
  press anywhere inside a focusable element on a slide, such as a button's icon, is left to that element. The default
  slide spacing is in the `carousel` recipe, so the item group sets `--carousel-spacing` inline only for a `spacing`
  prop. Keys and the previous and next triggers step from the page shown
- A `Drawer`'s swipe direction follows the drawer's own computed direction, a `dir` on an ancestor included, not
  `LocaleProvider`
- `InputGroup`'s start and end boxes let presses through to the field, except on links, buttons, form controls and
  focusable elements inside them, so `SearchInput`'s icon focuses the input and `FormFileUpload`'s file icon and the
  empty end of the field open the picker. `FormFileUpload`'s cursor follows the trigger's disabled state, a disabled
  `Field` or `Fieldset` included
- `NumberInput` without `formatOptions` writes and reads its value in the locale's number format, without grouping:
  `value`, `defaultValue`, the strings `onValueChange` and `onValueCommit` pass and the form value use the locale's
  decimal separator, digits and minus sign (`"2,5"` in `de-DE`), and typed text is read by the locale's rules, so
  `1,500` in `en-US` is 1500. Under a comma-decimal `LocaleProvider`, pass values formatted with
  `new NumberFormatter(locale, { useGrouping: false, maximumFractionDigits: 20 })` in place of `String(n)`, and read
  numbers from `valueAsNumber`. The input no longer has a default `pattern`
- `NumberInput`: an empty value is valid whatever `min`, PageUp and PageDown step by `largeStep`, and Home and End jump
  only when `min` or `max` is set. It commits and calls `onFocusChange(false)` when focus leaves the whole root, so
  tapping away after a stepper commits, and Enter commits without calling `onFocusChange(false)`. A touch on a stepper
  that turns into a scroll no longer focuses the input, and `data-focus` and `onFocusChange` follow real focus. A
  disabled one is dimmed once, and its steppers show the not-allowed cursor
- A `NumberInput` stepper press or scrub that leaves focus outside the control, as with `focusInputOnChange={false}`,
  calls `onValueCommit` on release
- `NumberInput` without `min` or `max` sets no `aria-valuemin` or `aria-valuemax`, keeps both steppers enabled while
  the value is empty, and refuses a typed `-` when `min` is 0 or more and `+` when `max` is 0 or less, unless
  `allowOverflow`. `NumberInput.Scrubber` scrubs from a mouse or pen only, and a lost release ends it
- `ColorPicker`'s css channel input keeps a typed alpha, and a color typed without one gets alpha 1; a hex with an
  alpha digit pair keeps it. The area thumb's `aria-valuemin` and `aria-valuemax` follow its x channel's range, and
  focus that lands on `ColorPicker.HiddenInput`, as a failed form check sends it, moves to the trigger
- `Alert.Indicator` shows the icon of the root's `status`. `Skeleton` pulses at the `pulse` token's 2 s and stops
  animating under reduced motion
- `Popover.CloseTrigger` lets its click bubble, as the other close triggers do. A `Toolbar` keeps one Tab stop when CSS
  alone shows or hides its items. `Chat.Composer`'s mic shows `Button`'s pressed style while it listens
- `FileUpload` treats a file modified at another time as a different file
- `Textarea` with `preventNewline` and `PinInput` with `autoSubmit` submit a form through its submit button, not at all
  while that button is disabled, and on their own when the form has none
- `Combobox` throws when two items share a value, as `Listbox` and `Select` do. Enter on a `Listbox` or
  `CommandPalette` option that is a link follows the link, and a list keeps the option a user moved to highlighted when
  its items change
- A new-tab click (Ctrl, ⌘ or Alt) or Ctrl/⌘+Enter on a link item in a `Combobox` or `CommandPalette` opens the link
  without picking the item, and a click on a text field inside an item no longer picks it. A list group sets
  `aria-labelledby` only while its label renders
- New exports: `ClearButton`, `getTabbables`, `isFocusable`, `isWithinNestedControl`, `useTooltipDelegate`,
  `useVirtualList` (the windowing behind `VirtualScrollArea`, for a list inside a scroll container of its own) and
  `SelectionItemSource`

#### Upgrading from 0.13

- `VirtualScrollArea`'s render function takes `(item, index)`; it no longer gets the `VirtualItem`. A rendered row
  re-runs it only when its item, its index or the function itself changes, so pass a new function whenever what a row
  shows depends on other state
- New: `TooltipGroup` runs one tooltip for every plain `Tooltip` inside it. Wrap long lists and grids in it so rows
  don't each mount a tooltip; a `Tooltip` with root props, `ref`, `portalled` or `portalRef` keeps its own

#### Upgrading from 0.12

- ui depends on Ark UI `~5.40.0`. A partly filled `PinInput` now blocks form submission, Escape closes an overlay
  right after it opens, and each `TagsInput` and `Combobox` mounts a hidden `role="alert"` live region
- `Menu.ItemGroup` takes its heading as `label`; `title` is the native attribute again. Rename `title=` to `label=`
- A `.light` or `.dark` scope nested in the other resolves its own scheme: it resets `colorPalette` to `brand` and
  `color` to `fg`, and `_light` matches inside it. Set either on the scope element to keep the outer values
- `DataTable` column defs take `enableHiding` again, for `columnVisibility` and `DataTableColumnPicker`;
  `meta.isVisible: false` still removes a column outright. Column resizing (`enableColumnResizing`) is opt-in
- `TreeDragPreview` is `DragPreview` from `Sortable`; the old name is still exported
- `Tooltip` keeps its child in the same element whether or not `label` is set, so toggling the label no longer
  remounts it, and the tooltip's open state no longer sets `data-state` on the trigger. A text child is wrapped in a
  `span` even without a label
- A nested `ButtonGroup` inherits the `variant`, `size` and `colorPalette` of the group around it unless it sets its
  own
- `Listbox` items reserve the check column on every row, so trailing hints and actions no longer shift when a row is
  selected. A managed item's accessible name is its text alone. Item actions render in the `itemActions` slot
  instead of a `data-listbox-item-action` wrapper
- `Popover.Content` takes its accessible name and description from `Popover.Title` and `Popover.Description`
- Under `prefers-reduced-motion`, overlays fade without sliding or scaling
- `Editable`'s placeholder uses `fg.subtle` at every size
- `Splitter.Group`'s `onLayoutChanged` reports a double-click reset as a user interaction
- A `loading` `Button` renders `aria-disabled` instead of `disabled` and stays focusable, so it keeps focus while it
  loads; it still ignores clicks, presses and keys. Assert `aria-disabled` rather than `disabled` in tests
- New: `VirtualScrollArea` `scrollPaddingStart`, the space a sticky header covers, and `onVisibleItemsChange`
- `TooltipIconButton`'s `ref` reaches its button (`HTMLButtonElement`) instead of the tooltip content
- `Stat.ValueText` formats `value` in the `LocaleProvider` locale, `en-US` without one, instead of the runtime's, so
  server and client render the same text. New: `LocaleProvider` is exported
- `LoadingOverlay` takes `loading` in place of `isActive`
- `NumberInput` is a plain compound like `PinInput`: render `NumberInput.Root`. `NumberInput.Field` is
  `NumberInput.Input` and `NumberInputProps` is `NumberInputRootProps`
- `Checkbox` and `Alert` take `indicator` in place of `icon`, like `CheckboxCard`; `indicator={null}` leaves
  `Alert`'s out and a `Checkbox`'s box empty
- `Alert` drops `closable`: `onClose` alone shows the close button
- `Pagination.Items` takes only `render` and `ellipsis`. Each gap is a `Pagination.Ellipsis` that `ellipsis` fills,
  no longer a focusable button
- `VirtualScrollArea` takes `ref` in place of `viewportRef`, like `ScrollArea`
- `TreeViewDndProvider` takes `disabled` in place of `enabled`, like `Sortable`
- `SimpleGrid` `columns` wins over `minChildWidth`, as in `Grid`
- `RadioCard.Item` takes `label`, `description`, `icon`, `addon`, `indicator`, `indicatorPlacement`, `inputProps` and
  `rootRef` like `CheckboxCard` and renders its own hidden input, text and control; drop those children. Its
  `indicator` is drawn inside the radio in place of the `RadioCard.ItemIndicator` dot, and `null` leaves the radio out.
  `RadioCard.ItemText`, `RadioCard.ItemHiddenInput` and `RadioCard.ItemControl` are gone
- The `radioCardGroup` recipe draws the dot in an `itemIndicator` slot instead of `itemControl`'s `::after`
- `ActionBar` drops `mobileLayout`, which never had an effect, and `DatePicker` drops `triggerEndElement`
- `CloseButton`, `DeleteButton` and `EditButton` take no `children`; pass `icon`
- `DeleteDialog`'s confirm button reads "Delete" instead of "Submit"
- `Stat.UpTrend` and `Stat.DownTrend` must sit inside `Stat.Root`
- `StyledRootProps`, `CreateToasterProps` and `useDebounceQuery` are gone, and ui no longer depends on `react-use`.
  `toaster` is typed `CreateToasterReturn`
- `PointerDragInset` and `PointerDragAutoScroll` are `EdgeAutoScrollInset` and `EdgeAutoScrollOptions`
- `useControlledMirror` returns `{ applied, emit }`
- A label, hint, description or shortcut of `true` renders nothing. A `List` `icon` or `description` of `0` renders,
  and a `value` of `""` doesn't
- `DatePicker`'s default trigger is a `SelectButton`: neutral palette, dimmed placeholder, tooltip when truncated
- `Calendar`'s Clear hides while empty. A read-only `Calendar` hides Clear and presets and a disabled one disables
  them; a read-only `DatePickerSelect` shows no clear button
- `DatePicker` and `DatePickerSelect` triggers are named by their value or placeholder, not "Open calendar"
- Clearing `SearchInput`, `NumberFilter` or `DatePickerSelect` returns focus to the field (a `between` `NumberFilter`'s
  first), and clearing a `Calendar` moves it to the focused day
- Switching `NumberFilter` to or from `between` keeps focus on its operator trigger
- `NumberFilter` takes `fromLabel` and `toLabel` in place of `fromPlaceholder` and `toPlaceholder`; in `between` mode
  they also name the two inputs, which sit in a `role="group"` named by `inputProps` `aria-label`/`aria-labelledby` or
  the enclosing `Field`'s label. An `inputProps` `ref` reaches the first input only
- `ScrollArea` `height` and `maxHeight` apply as inline styles
- Unmeasured `VirtualScrollArea` rows sit in normal flow, and scroll padding and `firstVisible` count a sticky header
  in the flow
- Info toasts show an info icon
- `SelectButton`'s `active` look overrides `variant`, which sets the inactive look
- `indicatorPlacement="inside"` on a `CheckboxCard` or `RadioCard.Item` with no label, description or icon still
  renders the control, and `"end"` puts it at the end
- `FileUpload.FileText` shows its fallback in the placeholder colour
- A disabled `FileUpload` dims its dropzone and delete buttons; a read-only one hides its dropzone, trigger, delete and
  clear buttons and keeps the file list
- `ColorModeProvider` resolves `"system"` to light where `matchMedia` is missing, such as jsdom, instead of throwing
- `ToggleGroup.RootProvider` joins a `Toolbar`'s arrow keys and tab stop like `ToggleGroup.Root`
- New: `ToggleGroup` `variant="enclosed"`, SegmentGroup's track and thumb, and `SegmentGroup` `variant="outline"`,
  ToggleGroup's default look. `SegmentGroup` defaults to `enclosed`, its look so far
- A `SegmentGroup` item's focus ring sits inside the item, where the track no longer clips its top and bottom
- `DataTable` takes the `table` recipe's look: a 12px semibold muted header, cell padding from the density knobs and
  `neutral.surface.bg.hover` row hover. `stickyHeader` sticks the head element
- The `table` recipe styles `Table.Row` and `Table.Cell` by `data-slot`, so raw `tr` and `td` lose striping, hover
  and the last-row border. Cells take their padding from `--table-cell-px` and `--table-cell-py`
- `DataTable` cell content may paint into the cell padding, so focus rings show; text still truncates at the content
  edge. The loading overlay sits in the body, below the sticky header, and it and the empty state centre on the
  visible width while the table scrolls sideways
- `DataTable` clears a malformed date or number filter param even when no filter control is mounted, and a column's
  `meta` always has `type`
- `TreeSelectList` never offers make-child into an unloaded lazy branch, an empty loaded one accepts it, and sticky
  branch rows follow `clampText`
- `CommandPalette.Item` keeps the check column for `checked={false}` and shows none when `checked` is left out
- `Combobox` content unmounts while closed, and a highlight moved by the pointer no longer scrolls a `Select` or
  `Combobox` list
- Home and End in `Combobox.Input` move the text cursor, like `CommandPalette.Input`
- A `CommandPalette.Item` is named by its label alone; `meta` and `shortcut` are read as its description
- `Select`'s `search.onQueryChange` no longer fires on close when the query is already the default
- Close triggers are named "Close", `Toast`'s included, unless they have an `aria-label` or content
- A phone sheet opened through `RootProvider` applies the outside handlers given to `useColorPicker` or
  `useCombobox`
- `--menu-z-index`, `--dialog-z-index` and `--drawer-z-index` are gone; overlays stack on `--z-index-*` plus
  `--layer-index`
- A lone child of an attached `ButtonGroup` keeps its corner radius and margin
- Items in a `Menu.ItemGroup` sit as far apart as ungrouped items
- `SegmentGroup.Items` renders no empty item control, so each item is narrower and its label centred
- A `CheckboxCard`'s `description` describes its checkbox to screen readers
- `SearchInput` takes `onClear` only with a `value`, since its clear button shows only for a non-empty `value`.
  `SearchInputProps` is a type alias; replace `interface X extends SearchInputProps` with an intersection
- Shift+Enter in a `Textarea` with both `onEnter` and `preventNewline` does nothing instead of submitting the form
- A disabled `RadioCard.Root` or `RadioCard.Item` dims like a disabled `CheckboxCard`
- `RadioCard.Root` `orientation="horizontal"` lays the cards out in a row below the label
- `useFileSelect`'s options type is `UseFileSelectOptions`, and `UseFileUploadProps`/`UseFileUploadReturn` are exported
  beside `useFileUpload`
- New: `createEdgeAutoScroll`, `isComposingEvent`, `isEditableTarget`, `formatNumberFilter`, `useColorPicker`, `usePointerDrag`
  `claimPress` and `activeAttribute`, `Alert.CloseTrigger`, `Progress.Context`, `HiddenInputControlProps`,
  `CheckboxCard` `rootRef`, `TreeViewDndProvider` `isBranchLoaded` and `TreeKeyboardMoveResult`, `InputGroupClearButton`
  `field`, and `DataTableLabels` `numberFrom`, `numberTo` and `numberOperators` for the number filter
- New: a hook for each `RootProvider` that lacked one: `useAccordion`, `useAvatar`, `useCarousel`, `useCheckbox`,
  `useClipboard`, `useCollapsible`, `useDialog`, `useEditable`, `useFieldset`, `useHoverCard`, `useListbox`,
  `usePagination`, `usePinInput`, `useProgress`, `useRadioGroup`, `useRatingGroup`, `useSegmentGroup`, `useTabs`,
  `useTagsInput`, `useToggleGroup`
- A `ScrollArea` or `VirtualScrollArea` that overflows takes keyboard focus itself while nothing inside it is focusable,
  so it can be scrolled with the keyboard, and re-checks as its content changes
- A phone sheet's frame carries no `aria-modal`
- `ColorPicker.Content` is named "Color picker" unless given `aria-label`, and the hidden form input is hidden from
  assistive technology
- `ToggleTip` and `InfoTip` content is named by its trigger
- `FileUpload.Dropzone` is named by its visible text instead of "dropzone"; pass `aria-label` to name it otherwise
- The `Combobox` list part no longer carries an `aria-labelledby`; the listbox content keeps it
- A `DataTable` column with an empty header names itself with visually hidden text instead of `aria-label`, and a
  grouped header's placeholder above an ungrouped column is a cell, not a column header
- The `DataTable` empty and loading status sits in a row and cell while it shows
- `TreeView.NodeCheckbox` is decorative. Set `checkable` on `TreeView.Root` so each row is announced as checked and
  Space toggles it instead of selecting the row
- A `Listbox` or `Select` with `renderItemActions` is a `grid` of rows rather than a `listbox` of options; query
  `getByRole("grid")` and `getByRole("row")` in tests
- Unchecked `surface`, `subtle` and `outline` checkboxes and radios draw a `colorPalette.control` edge, the subtle
  `Slider` range uses it too, and an outline circular `Progress` track is `subtle.bg`
- Light theme: greys are lighter, text greys are slate-tinted, `fg` is softer (13:1) and `fg.subtle` 5:1. Input,
  checkbox, radio and switch edges (`border.control`) match outline buttons (`neutral.outline.border`), 1.7:1 light
  and 2:1 dark, below WCAG 1.4.11's 3:1, for a lighter look
- `SelectButton` defaults to `variant="outline"`, so `Select`, `ApplySelect` and the DataTable select and date
  filters share the input edge. Pass `variant="surface"` for the previous look

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
- Drags leave out disabled nodes and nodes `isNodeDraggable` rejects, and nesting into a lazy branch that hasn't loaded its children is
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
- Invalid `Checkbox`, `CheckboxCard`, `RadioGroup` and `RadioCard.Root` controls show a red ring in every variant
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
- A `Menu` with both a `ContextTrigger` and a `Trigger` opens at the button when the button opens it; it used to open
  off-screen
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
- **Setup:** `jsdomSetup` from `@construkt-kit/story-kit/vitest` calls `installDomPolyfills()` from
  `@construkt-kit/config/vitest`, installs a `matchMedia` that matches nothing, and registers Testing Library's
  `cleanup` after each test; `browserProjects()` from the same entry runs the `*.browser.test.tsx` files in Chromium
- **Media queries:** `mockMatchMedia(matches)` from `src/_shared/matchMedia.ts` replaces `matchMedia` for one test;
  pass a boolean, a `(query) => boolean`, or `viewportWidth(px)` to match the breakpoint queries a viewport that wide
  would. Its `setMatches(next)` changes the answer and notifies listeners
- **Aliases:** `#styled-system/*` resolves through `package.json` `imports`
- **Libraries:** `@testing-library/react` + `userEvent` for component interaction tests
- **Pattern:** Tests verify non-obvious UX (e.g., interactive descendants in Select items don't trigger selection)

### Stories and behaviour specs

Every story under `src/**/*.stories.tsx` is also a test: `pnpm test:stories` renders it at desktop and phone width,
runs axe, and compares its accessibility tree and screenshot with committed baselines. Write stories in the factory
form (`preview.meta(…)`, `meta.story(…)`) against the preview from `@construkt-kit/story-kit/preview`; they hold
states only, with no `play`.

Focus, keyboard and dismissal behaviour that needs a real browser lives in `*.spec.ts` beside the component, driven
through `@construkt-kit/story-kit/test`. Overlays that open as phone sheets are listed once in
`src/components/sheetFrame.cases.ts`, and `sheetFrame.spec.ts` checks all of them. See
`packages/story-kit/README.md` for the rules and commands.
