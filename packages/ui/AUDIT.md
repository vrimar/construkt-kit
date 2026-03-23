# @b3/ui — Code Audit

Findings from a full read-only scan of all components and Panda CSS recipes in `packages/ui/src`.
Issues are numbered sequentially across five scan sessions.

---

## Severity key

| Label | Meaning |
|-------|---------|
| **Bug** | Incorrect runtime behaviour |
| **Smell** | Code quality / consistency issue that doesn't cause immediate breakage |

---

## Scan 1

### Bugs

**1. `Alert/Alert.tsx` — `icon` prop is silently ignored**
`Indicator` always renders `<InfoIcon />` as hardcoded JSX children, overriding anything passed via `props.children`. In `AlertComponent`, `{icon}` is passed as children to `Indicator`, but those children are discarded:
```tsx
function Indicator({ ref, ...props }) {
  return (
    <StyledIndicator ref={ref} {...props}>
      <InfoIcon />  // always overrides props.children
    </StyledIndicator>
  );
}
// In AlertComponent:
{startElement || <Indicator>{icon}</Indicator>}  // icon is discarded
```

**2. `Buttons/SelectButton.tsx:49` — Clear button click propagates to parent button**
The X-clear `<Box onClick={handleClear}>` sits inside the `<Button>` with no `e.stopPropagation()`. Clicking clear fires both the clear handler and the button's own `onClick` (which opens the dropdown).

**3. `EditableText/index.tsx` — Stale state after external `text` prop change**
State is initialised from the `text` prop with no sync mechanism:
```tsx
const [state, setState] = useState({ text, isEditing: false });
// no useEffect to sync when `text` prop changes
```
If a parent saves and re-fetches new data, the component retains the old text.

**4. `theme/recipes/menu.ts` — `xs`/`sm` text styles are inverted**
`xs` size uses `textStyle: "sm"` and `sm` size uses `textStyle: "xs"`. The larger size renders smaller text.

**5. `theme/recipes/tabs.ts` — Hardcoded `bg: "white"` and palette name**
`enclosed` variant sets `bg: "white"` (breaks dark mode) and `color: "brand.solid.bg"` (hardcodes the palette name, breaks `colorPalette` abstraction).

**6. `theme/recipes/popover.ts` — References undefined CSS variable**
`positioner` uses `var(--z-index-popover)` which is never defined in the recipe. `menu.ts` defines `--menu-z-index` and `dialog.ts` defines `--dialog-z-index`, but popover never sets its own variable.

---

### Code smells

**7. `theme/recipes/checkbox.ts` — Only `solid` variant has `_checked` / `_indeterminate` states**
`surface`, `subtle`, `outline`, and `plain` variants define no visual checked state. Users of those variants see no feedback when checking a checkbox.

**8. `theme/recipes/button.ts` / `textarea.ts` — Conflicting transition declarations**
Both recipes declare `transition: "colors"` and `transitionProperty: "background-color, border-color, color, box-shadow"` on the same element. One will silently override the other depending on CSS specificity.

**9. `theme/recipes/input.ts` — Uses `satisfies RecipeConfig` without `defineRecipe`**
Every other recipe uses `defineRecipe(...)`. `input.ts` uses a plain object `satisfies RecipeConfig` to allow `combobox.ts` and others to spread `input.base` / `input.variants.*`. Intentional but diverges from the established pattern and loses Panda's inference.

**10. `theme/recipes/drawer.ts` — Mixed viewport units**
Backdrop and positioner widths use `100vw`; backdrop height and content `maxH` use `100dvh`. Should be consistent. Also mixes logical (`insetInlineStart: "0"`) and physical (`left: 0`) properties within the same file (compare `dialog.ts` which uses `left: 0` throughout).

**11. `theme/recipes/dialog.ts` — Duplicate CSS variable definition**
`"--dialog-z-index": "zIndex.modal"` is defined identically in both the `positioner` and `content` slots. One is sufficient.

**12. `theme/recipes/accordion.ts` — Raw CSS focus ring**
Uses `outline: "2px solid"` / `outlineColor: "colorPalette.focusRing"` instead of Panda's `focusVisibleRing: "outside"` shorthand. `colorPalette.focusRing` is also a non-standard token path.

**13. `theme/recipes/switch.ts` — Raw CSS units and bare numbers**
`control: { gap: "0.5rem" }` uses a raw `rem` unit (should be Panda token `"2"`). `indicator: { flexShrink: 0 }` uses a bare number while all other recipes use string `"0"`.

**14. `theme/recipes/text.ts` — Empty stub**
`variants: {}` — no variants defined. The recipe exists but applies no variant styles.

**15. `theme/recipes/pagination.ts` — Empty stub**
`base: {}` — completely empty. All styling is presumably done inline in the `Pagination` component.

**16. `Dialog/SubmitDialog.tsx` — Inline style and double positioning**
`<Dialog.Content style={{ maxWidth: width }}>` uses an inline style instead of the Panda `maxWidth` prop. The manually rendered `<CloseButton position="absolute" top="2" insetEnd="2">` conflicts with the recipe's `closeTrigger` slot which already applies `pos: "absolute", top: "3", insetEnd: "3"`, producing competing absolute-position declarations.

**17. `Buttons/TooltipIconButton.tsx` — `ref` forwarded to Tooltip root, not the button**
Consumers expecting a ref to the underlying `<IconButton>` element receive the Tooltip root element instead.

**18. `theme/recipes/button.ts` — `ButtonGroup` in the `jsx` array**
`ButtonGroup` is listed in the `button` recipe's `jsx` array, but `ButtonGroup` uses the separate `group` recipe. This is incorrect and may cause Panda to incorrectly apply button styles to `ButtonGroup`.

**19. `ApplyInput/index.tsx` — Mixed `useState` import styles**
Uses `useState` (named import) and `React.useState` (namespace access) in the same component body.

---

## Scan 2

### Bugs

**20. `Input/MultiLineInput.tsx:9` — Enter key always prevented**
`e.preventDefault()` fires unconditionally on every `Enter` keypress before calling `onKeyDown`. A textarea named `MultiLineInput` can never produce a newline; the user is permanently locked out of multi-line input unless the consumer manually re-inserts `\n` inside `onKeyDown`.

**21. `theme/recipes/pin-input.ts:50` — `flushed` variant is a silent no-op**
`variant.flushed` spreads `input.variants?.variant?.flushed`, but `input.ts` defines only `outline`, `surface`, and `subtle` — no `flushed`. The optional chain silently resolves to `undefined`, so the variant exists in the API but applies no styles.

**22. `theme/recipes/alert.ts:122` — `status="neutral"` leaves `colorPalette` tokens unresolved**
`status.neutral: {}` is an empty object. All `colorPalette.*` tokens in the active variant slot remain unresolved and inherit from the nearest ancestor — whatever that happens to be. Should set `root: { colorPalette: "neutral" }`.

**23. `theme/recipes/date-picker.ts:78` — `colorPalette.contrast` is not a standard token**
`tableCellTrigger._selected._before.color: "colorPalette.contrast"` — the standard token for text on a solid background is `colorPalette.solid.fg`. Unless `contrast` is explicitly defined in the project theme, this resolves to nothing.

**24. `Highlight/SearchHighlight.tsx:22` — Hardcoded `yellow.100` breaks dark mode**
`style={{ background: token("colors.yellow.100") }}` always resolves to the light-mode yellow value. Highlighted text in dark mode gets the same yellow with potentially insufficient contrast. Should use a semantic token.

**25. `Input/MultiLineInput.tsx` / `DatePickerSelect.tsx:11` — Date label missing zero-padding**
`${date.month}-${date.day}` renders `"2024-1-5"` for January 5th. ISO-8601 and user expectation is `"2024-01-05"`. Month and day integers need `.toString().padStart(2, "0")`.

**26. `tags-input.ts:50` — Invalid CSS cursor value**
`clearTrigger.cursor: { base: "button" }` — `"button"` is not a valid CSS `cursor` value. Should be `"pointer"`.

---

### Hardcoded palette names (no `colorPalette` support)

These recipes hardcode palette names (`neutral`, `brand`) instead of using `colorPalette.*` tokens, preventing consumers from theming via the `colorPalette` prop.

**27. `theme/recipes/tooltip.ts:14`**
`color: "neutral.solid.fg"` — tooltip text color is fixed to the neutral palette.

**28. `theme/recipes/card.ts:52,57,63`**
All three variants use `bg: "neutral.surface.bg"` / `"neutral.subtle.bg"`. The card recipe has no `colorPalette` theming support at all, unlike `badge`, `avatar`, `alert`, etc.

**29. `theme/recipes/toast.ts:11,56`**
`background: "neutral.surface.bg"` and `actionTrigger.color: "brand.plain.fg"` both hardcode palette names.

**30. `theme/recipes/hover-card.ts:9`**
`"--hovercard-bg": "colors.neutral.surface.bg"` hardcodes neutral.

**31. `theme/recipes/editable.ts:26`**
`preview._hover.bg: "neutral.plain.bg.hover"` hardcodes neutral; doesn't follow the `colorPalette.*` pattern used in all other hover states.

**32. `theme/recipes/tree-view.ts:11`**
`root.colorPalette: "brand"` bakes the brand color in at the recipe level. Consumers cannot override the palette via a `colorPalette` prop.

**33. `theme/recipes/color-picker.ts:46,113`**
`background: "neutral.surface.bg"` in two slots (`content`, `swatchGroup`). Additionally, `areaThumb.boxShadow` and `channelSliderThumb.boxShadow` hardcode CSS color names `white` and `black`, breaking dark mode.

---

### Recipe inconsistencies / code smells

**34. `theme/recipes/slider.ts:76-102` — All three `size` variants are identical**
`sm`, `md`, and `lg` all set exactly the same CSS variable values (`--slider-thumb-size: sizes.5`, `--slider-track-size: sizes.2`, etc.). The `size` prop is a complete no-op.

**35. `theme/recipes/table.ts:11,37` — Mixed logical/physical `textAlign`**
`root.textAlign: "start"` (logical property) vs `header.textAlign: "left"` (physical property) in the same recipe. Also uses bare integer `zIndex: 1` / `zIndex: 2` rather than string tokens.

**36. `theme/recipes/date-picker.ts:23` / `color-picker.ts:58` — Raw `animation:` shorthand**
`_open: { animation: "fadeIn 0.25s ease-out" }` / `_closed: { animation: "fadeOut 0.2s ease-out" }`. Both recipes use raw CSS animation shorthand strings; all other animated recipes use `animationStyle: "scale-fade-in"` / `"slide-fade-in"` Panda tokens.

**37. `theme/recipes/date-picker.ts:21` — `width: "344px"` magic pixel value**
Not on the Panda spacing/size scale. Other popover-style components use size tokens.

**38. `theme/recipes/code.ts:47-48` — `md` and `lg` share `textStyle: "sm"`**
`md: { textStyle: "sm", height: "5" }` and `lg: { textStyle: "sm", height: "5.5" }` differ only in height; text size is identical across two size steps.

**39. `theme/recipes/tree-view.ts` / `file-upload.ts` / `segment-group.ts` — `transition: "backgrounds"` is not a valid Panda token**
Panda's built-in transition tokens are `"common"` and `"all"`. `"backgrounds"` will not resolve to anything.

**40. `theme/recipes/tree-view.ts:52,116` — Raw outline focus ring**
`_focusVisible: { outline: "2px solid", outlineColor: "border.emphasized" }` instead of `focusVisibleRing: "outside"`. Same pattern flagged in `accordion.ts` (issue 12 above).

**41. `theme/recipes/number-input.ts:62,64` — Physical border-radius properties**
`borderTopRightRadius` / `borderBottomRightRadius` should be logical equivalents `borderStartEndRadius` / `borderEndEndRadius`. The same recipe uses logical `insetEnd`, `pe` elsewhere.

**42. `theme/recipes/empty-state.ts:42,48,54` — `"& svg"` selector instead of `_icon`**
Icon sizing uses raw `"& svg": { width, height }` selectors; all other recipes uniformly use `_icon: { boxSize }`.

**43. `theme/recipes/field.ts:26` — `colorPalette` used with no default set**
`requiredIndicator.color: "colorPalette.solid.fg"` depends on an ancestor having set `colorPalette`. The field recipe defines no `defaultVariants` and sets no `colorPalette`, so the required indicator's color is inherited non-deterministically.

**44. `theme/recipes/clipboard.ts:19` — `gap` on a non-flex element**
`label: { gap: "0.5" }` with no `display: flex` or `display: grid` on the label. The style has no effect.

**45. `theme/recipes/color-picker.ts:120` — Raw `var(--colors-*)` in `boxShadow`**
`swatch.boxShadow: "0 0 0 1px var(--colors-border-emphasized), ..."` references Panda's internal generated CSS variable names directly. This bypasses the type-safe token system and is fragile to Panda version changes that rename variables.

**46. `theme/recipes/hover-card.ts:37-38` — Sub-pixel arrow border inconsistent with tooltip**
`arrowTip.borderTopWidth: "0.5px"` / `borderInlineStartWidth: "0.5px"` — `tooltip.ts` uses `"1px"` for the same slots.

**47. `theme/recipes/progress.ts:17` — `--track-color` used in base but never defined**
`range.bgColor: "var(--track-color)"` in the base style, but `--track-color` is never set. The variants override `bgColor` directly with real tokens, so it only matters if a new variant is added without setting `bgColor`. Also, the `striped` variant uses `rgba(255, 255, 255, 0.3)` / `rgba(0, 0, 0, 0.3)` hardcoded colors.

**48. `theme/recipes/avatar.ts:143` — `square` shape variant is an empty object**
`shape.square: {}` provides no styles. The root/fallback/image all apply `borderRadius: "var(--avatar-radius)"`, but `square` never sets that variable. The result depends on the CSS variable being unset, which is brittle.

**49. `DataTable/Pagination.tsx:38` — `alignContent` should be `alignItems`**
`alignContent="center"` on a single-row flex container has no effect; `alignItems="center"` was intended. Also uses raw `<b>` HTML tags and `fontSize="md"` instead of design-system tokens (`textStyle`).

**50. `Input/PasswordInput.tsx:19` / `DatePicker/DatePickerSelect.tsx:28` — `width="100%"` should be `width="full"`**
Both use the raw CSS string `"100%"` instead of the Panda token `"full"`.

**51. `Actionbar/index.tsx:2` — Bypasses `@b3/ui` Popover wrapper**
`import { Popover } from "@ark-ui/react/popover"` — uses the raw Ark Popover rather than the `@b3/ui` Popover wrapper. Any styles or behaviour applied in `@b3/ui`'s Popover are absent from ActionBar.

---

## Scan 3

### Bugs

**52. `Dialog/Dialog.tsx:66` — `ActionTrigger.onClick` overrides consumer's `onClick`**
`{...props}` is spread before the hardcoded `onClick`, so any `onClick` passed by the consumer is silently replaced:
```tsx
<StyledButton {...props} ref={ref} onClick={() => dialog.setOpen(false)} />
```
Consumers who need to run logic (validation, async work) before closing the dialog cannot.

**53. `Form/SubmitForm.tsx:26` — Enter key handler submits inside textarea elements**
`SubmitDialog.tsx` guards against Enter-in-textarea with `target.tagName !== "TEXTAREA"` before calling `onSubmit`. `SubmitForm.tsx` has the same Enter handler but no such guard. Pressing Enter inside a textarea within a `SubmitForm` triggers form submission.

**55. `DatePicker/DatePicker.tsx:39` — `min` hardcoded to today**
`min: parseDate(new Date())` makes it impossible to select any past date. A general-purpose date picker should not restrict past dates by default. There is no `min`/`max` prop to override this constraint.

**57. `DatePicker/RangeDatePicker.tsx:43` — `onValueChange` never fires for `mode="single"` or `mode="multiple"`**
The callback is only invoked when `props.value.length === 2`. For `mode="single"` (max 1 item) or `mode="multiple"` (arbitrary count), this condition is never satisfied. The `mode` prop is silently broken for any value other than `"range"`.

**63. `DataTable/Header/HeaderFilterCellContent.tsx:21` — Unsafe cast on column header**
`const name = column.columnDef.header as string` — `header` can be a `string`, `ReactNode`, or render function. When a consumer provides a JSX element header, `name` becomes an object. It is then passed as `label={name}` to `ApplySelect.Trigger`, rendering as `[object Object]`.

---

### Code smells

**54. `Form/SubmitForm.tsx` — Cancel and Submit labels are hardcoded**
Labels "Cancel" and "Submit" are hardcoded with no props to override them, while `SubmitDialog.tsx` exposes `cancelLabel` and `submitLabel` props. The two submit components are inconsistent.

**56. `DatePicker/DatePicker.tsx:32` — `Intl.DateTimeFormat()` instantiated on every selection**
`new Intl.DateTimeFormat().resolvedOptions().timeZone` is called inside `onValueChange` on every date selection. The timezone doesn't change between selections; this should be obtained once outside the component.

**58. `TagsInput/index.tsx:39` — `key={index}` for tag items**
Array index keys cause React to reuse DOM nodes incorrectly when tags are deleted from the middle of the list. The inline `ItemInput` editing state can leak to the wrong tag. Keys should be derived from the tag value.

**59. `theme/recipes/splitter.ts:15` — `panel.background` hardcodes neutral**
`background: "neutral.surface.bg"` — no `colorPalette` support.

**60. `theme/recipes/rating-group.ts:45` — Hardcoded neutral and physical property**
`"& [data-bg]": { color: "neutral.subtle.bg" }` hardcodes neutral. `_icon.left: 0` uses a bare integer and a physical property (`left`) where `insetInlineStart: "0"` should be used.

**61. `theme/recipes/skeleton.ts:30` — Raw `!important` string and hardcoded neutral**
`loading.false.animation: "fade-in ... !important"` embeds `!important` inside a raw animation string rather than using Panda's `!` postfix convention. The `pulse` and `shine` animation backgrounds hardcode `neutral.subtle.bg` / `neutral.subtle.bg.active`.

**62. `theme/recipes/scroll-area.ts:10-11` — `"100%"` instead of `"full"` token**
`root.width: "100%"` and `root.height: "100%"` use raw CSS strings instead of the Panda token `"full"`.

**64. `DataTable/Header/ColumnSorter.tsx:23-24` — Hardcoded brand color and raw pixel**
`color: "brand.fg"` and `_hover: { color: "brand.fg" }` hardcode the brand palette name. The icon sizing uses `css={{ "& svg": { width: "18px", height: "18px" } }}` with a raw pixel value; should use `_icon: { boxSize: "4.5" }`.

**65. `theme/recipes/input-addon.ts` — Hardcoded neutral and duplicate size styles**
All three variants hardcode neutral tokens (`neutral.outline.border`, `neutral.surface.bg`, etc.) with no `colorPalette` theming. `md` and `lg` sizes share the same `textStyle: "md"` and `_icon: { boxSize: "5" }` — the two steps are visually identical.

---

## Scan 4

### Bugs

**66. `ApplySelect/index.tsx:91` — `handleReset` calls `onApply([])` on Cancel**
When the user clicks Cancel, `handleReset` correctly resets `tempSelected` back to the original `selected` values and closes the popover — but then also calls `onApply([])`, which clears the parent's selection state. Cancel should not apply anything.
```tsx
const handleReset = () => {
  setTempSelected(Array.isArray(selected) ? selected : []);
  setIsOpen(false);
  onApply([]);  // clears parent selection on Cancel
};
```

**67. `Buttons/TooltipIconButton.tsx:17` — `tooltipProps` destructured but never spread**
The `tooltipProps` prop is accepted and destructured but never passed to the `<Tooltip>` component. Consumers passing tooltip configuration (placement, offset, etc.) will find it silently ignored.
```tsx
const TooltipIconButton = ({ ref, label, children, tooltipProps, ...props }) => {
  return (
    <Tooltip ref={ref} content={label}>  // tooltipProps not spread here
      <IconButton {...props}>{children}</IconButton>
    </Tooltip>
  );
};
```

**68. `ContextMenu/ContextMenu.tsx:50` — `CheckboxItem` missing `cursor="pointer"`**
`ContextMenuCheckboxItem` has no `cursor="pointer"`, while `ContextMenuRadioItem` (line 69) and `ContextMenuItem` (line 95) both set it. The checkbox item doesn't visually signal clickability. The same pattern inconsistency exists in `Menu/Menu.tsx` where `MenuCheckboxItem` does set `cursor="pointer"` but ContextMenu's copy does not.

**69. `Select/TagSelect.tsx:84` — `key={index}` for tag items**
Uses array index as key when the tag value `id` is available. When tags are removed from the middle, React reuses wrong DOM nodes and the inline `ItemInput` editing state can leak to the wrong tag. Same anti-pattern as issue #58 in `TagsInput`.
```tsx
{value.map((id, index) => {
  return (
    <TagsInput.Item key={index} index={index} value={id}>  // should be key={id}
```

---

### Code smells

**70. `HoverCard/index.tsx` — Missing `unmountOnExit`/`lazyMount` defaults**
Unlike Popover, Menu, Dialog, and Drawer, `HoverCard.Root` sets no `defaultProps` for `unmountOnExit` and `lazyMount`. HoverCard content remains mounted in the DOM even when closed, causing DOM bloat and inconsistency with all other floating components.
```tsx
// HoverCard — no defaults
const Root = withRootProvider(ArkHoverCard.Root);

// vs Popover, Menu, Dialog, Drawer — all have:
const Root = withRootProvider(ArkPopover.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
```

**71. `ToggleTip/index.tsx:27` — Consumer's `positioning.gutter` silently overridden**
The gutter is always forced to `4`, overriding any consumer-provided value. Should default rather than override.
```tsx
positioning={{ ...rest.positioning, gutter: 4 }}
// should be: gutter: rest.positioning?.gutter ?? 4
```

**72. `Buttons/Button.tsx:31` — `useMemo` with rest-spread `props` in deps is ineffective**
`props` is a new object on every render due to `({ ref, ...props })` rest spreading, so `useMemo(() => mergeProps(...), [propsContext, ref, props])` recomputes every render, providing zero memoization benefit.

**73. `ApplySelect/index.tsx:107-116` — `useMemo` deps include non-memoized handlers**
`handleApply`, `handleReset`, and `handleToggleAll` are plain functions recreated every render. Including them in the `useMemo` dependency array makes the context value recompute every render, defeating memoization.

**74. `Menu/Menu.tsx` / `ContextMenu/ContextMenu.tsx` — `CheckboxItem` children lack `<Box flex="1">` wrapper**
`MenuItem` and `MenuRadioItem` wrap children in `<Box flex="1">` for consistent flex layout. `MenuCheckboxItem` and `ContextMenuCheckboxItem` render children directly, creating inconsistent spacing when menu items mix types.

**75. `Toast/Toast.tsx:48-53` — Hardcoded pixel offsets**
`top: "80px"` and `right: "40px"` are magic numbers not derived from theme tokens. If the app header height changes, toasts may overlap or be mispositioned.

**76. `Toast/Toast.tsx:65` — Loading spinner hardcodes `brand.plain.fg`**
`<Spinner color="brand.plain.fg" />` hardcodes the brand palette name. Same class of issue as #27–33.

**77. `ToggleTip/index.tsx:61` — `InfoTip` `aria-label="info"` is too generic**
The hardcoded label doesn't describe what the info is about. A general-purpose info button should accept a descriptive `aria-label` to meet accessibility guidelines.

**78. `FileUpload/FileUpload.tsx:54` — `key={file.name}` is not unique**
If a user uploads multiple files with the same name from different directories, they share the same React key, causing incorrect reconciliation.

**79. `Slider/index.tsx:65,79` — `key={index}` for thumbs and markers**
Slider thumbs and markers use array index as key. If the value array changes length, React may reuse wrong DOM nodes for thumbs.

---

## Scan 5

### Bugs

**80. `hooks/useFileSelect.ts:44` — Object URLs never revoked (memory leak)**
`URL.createObjectURL(file)` is called for every selected file, but `URL.revokeObjectURL()` is never called anywhere — neither in the hook nor documented for consumers. Each object URL holds a blob reference in memory until the page is unloaded.
```tsx
const parsed: ParsedFile[] = Array.from(input.files).map((file) => ({
  source: URL.createObjectURL(file),  // never revoked
  ...
}));
```

**81. `hooks/useDebounceQuery.ts:5-6` — `immediateQuery` and `debouncedQuery` out of sync on mount**
`debouncedQuery` is initialized to `initialQuery` (e.g. `"saved search"`) but `immediateQuery` is initialized to `""`. On mount, the hook reports `query: ""` while `debouncedQuery: "saved search"`. After the debounce delay fires, `debouncedQuery` is overwritten with `""`, losing the initial query.
```tsx
const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);   // "saved search"
const [immediateQuery, setImmediateQuery] = useState("");             // always ""
useDebounce(() => setDebouncedQuery(immediateQuery), delay, [immediateQuery]);
// After delay: debouncedQuery becomes "" — initialQuery silently lost
```

**82. `DatePicker/DayView.tsx:41` — Hardcoded `brand.50` in selected-day style**
The `[aria-selected="true"]` style uses `bg: "brand.50"`, a raw palette step that hardcodes the brand color and bypasses both `colorPalette` theming and semantic tokens. Should use a semantic token like `colorPalette.subtle.bg`.
```tsx
css={{
  '[aria-selected="true"] &': {
    bg: "brand.50",  // hardcoded brand palette step
  },
}}
```

---

### Code smells

**83. `DatePicker/DayView.tsx:14` — Dead code: `getTableRowProps()` return value discarded**
`datePicker.getTableRowProps()` is called as a statement with no assignment. The return value is thrown away. Either the call is dead code or a side-effect was intended but the method has none.

**84. `Input/SearchInput.tsx:36-40` — Clear button renders when `onClear` is not provided**
The clear button is conditionally rendered based on `props.value` being truthy, but when `onClear` is undefined the button renders as a non-functional UI element. Should also require `onClear` for the button to appear.
```tsx
endElement={
  props.value && (          // shows button when value exists
    <IconButton onClick={onClear}>  // onClear may be undefined → dead button
      <XIcon />
    </IconButton>
  )
}
```

**85. `Input/SearchInput.tsx:46` — `width="100%"` should be `width="full"`**
Raw CSS string instead of Panda token. Same pattern as issue #50.

**86. `src/index.ts:5-6` — Duplicate comment line**
`// Panda CSS utilities for consumers who need ad-hoc styling` is duplicated on consecutive lines. Copy-paste artifact.

**87. `preset.ts:15` — `colorPaletteValues` missing defined palettes**
`purple`, `teal`, `cyan`, and `pink` are defined in `tokens/colors.ts` but not included in `colorPaletteValues`. Panda's `staticCss` won't pre-generate `colorPalette` utilities for these colors, so `colorPalette="purple"` etc. may not work unless used with JIT.

---

## Full summary table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | **Bug** | `Alert/Alert.tsx` | `icon` prop silently ignored — `InfoIcon` always renders |
| 2 | **Bug** | `Buttons/SelectButton.tsx` | Clear button click propagates to parent button |
| 3 | **Bug** | `EditableText/index.tsx` | State not synced when `text` prop changes |
| 4 | **Bug** | `theme/recipes/menu.ts` | `xs`/`sm` text styles inverted |
| 5 | **Bug** | `theme/recipes/tabs.ts` | `bg: "white"` breaks dark mode; `color: "brand.solid.bg"` breaks palette theming |
| 6 | **Bug** | `theme/recipes/popover.ts` | `var(--z-index-popover)` referenced but never defined |
| 7 | Smell | `theme/recipes/checkbox.ts` | Only `solid` variant has `_checked`/`_indeterminate` states |
| 8 | Smell | `theme/recipes/button.ts`, `textarea.ts` | Conflicting `transition` + `transitionProperty` declarations |
| 9 | Smell | `theme/recipes/input.ts` | Plain object `satisfies RecipeConfig` instead of `defineRecipe` |
| 10 | Smell | `theme/recipes/drawer.ts` | Mixed `100vw`/`100dvh`; mixed logical/physical positioning |
| 11 | Smell | `theme/recipes/dialog.ts` | `--dialog-z-index` defined twice (positioner + content) |
| 12 | Smell | `theme/recipes/accordion.ts` | Raw `outline:` focus ring; non-standard `colorPalette.focusRing` token |
| 13 | Smell | `theme/recipes/switch.ts` | `gap: "0.5rem"` raw unit; `flexShrink: 0` bare number |
| 14 | Smell | `theme/recipes/text.ts` | Empty `variants: {}` stub |
| 15 | Smell | `theme/recipes/pagination.ts` | Empty `base: {}` stub |
| 16 | Smell | `Dialog/SubmitDialog.tsx` | `style={{ maxWidth }}` inline; double absolute positioning on close button |
| 17 | Smell | `Buttons/TooltipIconButton.tsx` | `ref` forwards to Tooltip root, not the button |
| 18 | Smell | `theme/recipes/button.ts` | `ButtonGroup` incorrectly listed in `jsx` array |
| 19 | Smell | `ApplyInput/index.tsx` | Mixed `useState` / `React.useState` in same component |
| 20 | **Bug** | `Input/MultiLineInput.tsx` | `Enter` always prevented — newlines impossible |
| 21 | **Bug** | `theme/recipes/pin-input.ts` | `flushed` variant silently no-op |
| 22 | **Bug** | `theme/recipes/alert.ts` | `status="neutral"` leaves `colorPalette` tokens unresolved |
| 23 | **Bug** | `theme/recipes/date-picker.ts` | `colorPalette.contrast` is not a defined token |
| 24 | **Bug** | `Highlight/SearchHighlight.tsx` | `yellow.100` hardcoded — breaks dark mode |
| 25 | **Bug** | `DatePicker/DatePickerSelect.tsx` | Date label missing zero-padding (`"2024-1-5"` vs `"2024-01-05"`) |
| 26 | **Bug** | `theme/recipes/tags-input.ts` | `cursor: "button"` — invalid CSS value |
| 27 | Smell | `theme/recipes/tooltip.ts` | `color: "neutral.solid.fg"` hardcoded |
| 28 | Smell | `theme/recipes/card.ts` | All variants hardcode `neutral` — no `colorPalette` support |
| 29 | Smell | `theme/recipes/toast.ts` | `neutral` and `brand` palette names hardcoded |
| 30 | Smell | `theme/recipes/hover-card.ts` | `neutral` hardcoded in `--hovercard-bg` |
| 31 | Smell | `theme/recipes/editable.ts` | `neutral.plain.bg.hover` hardcoded in hover state |
| 32 | Smell | `theme/recipes/tree-view.ts` | `colorPalette: "brand"` baked into root |
| 33 | Smell | `theme/recipes/color-picker.ts` | `neutral` hardcoded; `white`/`black` in box shadows |
| 34 | Smell | `theme/recipes/slider.ts` | `sm`, `md`, `lg` size variants are identical — size prop inert |
| 35 | Smell | `theme/recipes/table.ts` | Mixed logical/physical `textAlign`; bare integer `zIndex` |
| 36 | Smell | `theme/recipes/date-picker.ts`, `color-picker.ts` | Raw `animation:` shorthand instead of `animationStyle` tokens |
| 37 | Smell | `theme/recipes/date-picker.ts` | `width: "344px"` magic pixel value |
| 38 | Smell | `theme/recipes/code.ts` | `md` and `lg` share `textStyle: "sm"` |
| 39 | Smell | `theme/recipes/tree-view.ts`, `file-upload.ts`, `segment-group.ts` | `transition: "backgrounds"` is not a valid Panda token |
| 40 | Smell | `theme/recipes/tree-view.ts` | Raw `outline:` focus ring (same pattern as issue 12) |
| 41 | Smell | `theme/recipes/number-input.ts` | Physical `borderTopRightRadius`/`borderBottomRightRadius` |
| 42 | Smell | `theme/recipes/empty-state.ts` | `"& svg"` selector instead of `_icon` shorthand |
| 43 | Smell | `theme/recipes/field.ts` | `colorPalette` used in `requiredIndicator` with no default set |
| 44 | Smell | `theme/recipes/clipboard.ts` | `gap` on non-flex `label` — dead style |
| 45 | Smell | `theme/recipes/color-picker.ts` | Raw `var(--colors-*)` in `boxShadow` bypasses token system |
| 46 | Smell | `theme/recipes/hover-card.ts` | `0.5px` arrow border inconsistent with `tooltip.ts` (`1px`) |
| 47 | Smell | `theme/recipes/progress.ts` | `--track-color` referenced in base but never set; `rgba()` hardcoded in `striped` |
| 48 | Smell | `theme/recipes/avatar.ts` | `shape.square: {}` empty — relies on CSS variable being unset |
| 49 | Smell | `DataTable/Pagination.tsx` | `alignContent` should be `alignItems`; raw `<b>` tags; `fontSize` instead of `textStyle` |
| 50 | Smell | `Input/PasswordInput.tsx`, `DatePicker/DatePickerSelect.tsx` | `width="100%"` should be `width="full"` |
| 51 | Smell | `Actionbar/index.tsx` | Uses raw Ark `Popover` instead of `@b3/ui` Popover wrapper |
| 52 | **Bug** | `Dialog/Dialog.tsx` | `ActionTrigger.onClick` overrides consumer's `onClick` |
| 53 | **Bug** | `Form/SubmitForm.tsx` | Enter handler submits inside textarea elements (no textarea guard) |
| 54 | Smell | `Form/SubmitForm.tsx` | Cancel and Submit labels hardcoded, no customization props |
| 55 | **Bug** | `DatePicker/DatePicker.tsx` | `min: parseDate(new Date())` hardcodes today — past dates never selectable |
| 56 | Smell | `DatePicker/DatePicker.tsx` | `Intl.DateTimeFormat()` created on every value change |
| 57 | **Bug** | `DatePicker/RangeDatePicker.tsx` | `onValueChange` never fires for `mode="single"` or `mode="multiple"` |
| 58 | Smell | `TagsInput/index.tsx` | `key={index}` for tag items — unstable keys cause stale editing state |
| 59 | Smell | `theme/recipes/splitter.ts` | `panel.background: "neutral.surface.bg"` hardcodes neutral |
| 60 | Smell | `theme/recipes/rating-group.ts` | `"& [data-bg]"` hardcodes neutral; `_icon.left: 0` bare integer + physical property |
| 61 | Smell | `theme/recipes/skeleton.ts` | `loading.false` uses raw `!important` string; pulse/shine backgrounds hardcode neutral |
| 62 | Smell | `theme/recipes/scroll-area.ts` | `root.width/height: "100%"` should use `"full"` token |
| 63 | **Bug** | `DataTable/Header/HeaderFilterCellContent.tsx` | `column.columnDef.header as string` unsafe cast — non-string headers render as `[object Object]` |
| 64 | Smell | `DataTable/Header/ColumnSorter.tsx` | `color: "brand.fg"` hardcoded; `"18px"` raw pixel in `"& svg"` instead of `_icon` |
| 65 | Smell | `theme/recipes/input-addon.ts` | All variants hardcode neutral; `md` and `lg` share same `textStyle` and icon size |
| 66 | **Bug** | `ApplySelect/index.tsx` | `handleReset` calls `onApply([])` on Cancel — clears parent selection |
| 67 | **Bug** | `Buttons/TooltipIconButton.tsx` | `tooltipProps` destructured but never spread to `<Tooltip>` |
| 68 | **Bug** | `ContextMenu/ContextMenu.tsx` | `CheckboxItem` missing `cursor="pointer"` (RadioItem and Item have it) |
| 69 | **Bug** | `Select/TagSelect.tsx` | `key={index}` for tag items — `id` is available (same anti-pattern as #58) |
| 70 | Smell | `HoverCard/index.tsx` | Missing `unmountOnExit`/`lazyMount` defaults (inconsistent with other floating UI) |
| 71 | Smell | `ToggleTip/index.tsx` | Consumer's `positioning.gutter` silently overridden to `4` |
| 72 | Smell | `Buttons/Button.tsx` | `useMemo` with rest-spread `props` in deps recomputes every render |
| 73 | Smell | `ApplySelect/index.tsx` | `useMemo` deps include non-memoized handlers — recomputes every render |
| 74 | Smell | `Menu/Menu.tsx`, `ContextMenu/ContextMenu.tsx` | `CheckboxItem` children lack `<Box flex="1">` wrapper (inconsistent with other item types) |
| 75 | Smell | `Toast/Toast.tsx` | Hardcoded pixel offsets `top: "80px"`, `right: "40px"` — not theme-aware |
| 76 | Smell | `Toast/Toast.tsx` | Loading spinner hardcodes `color: "brand.plain.fg"` |
| 77 | Smell | `ToggleTip/index.tsx` | `InfoTip` `aria-label="info"` is too generic for accessibility |
| 78 | Smell | `FileUpload/FileUpload.tsx` | `key={file.name}` not unique across directories |
| 79 | Smell | `Slider/index.tsx` | `key={index}` for thumbs and markers |
| 80 | **Bug** | `hooks/useFileSelect.ts` | Object URLs never revoked — memory leak |
| 81 | **Bug** | `hooks/useDebounceQuery.ts` | `immediateQuery`/`debouncedQuery` out of sync on mount — initial query lost |
| 82 | **Bug** | `DatePicker/DayView.tsx` | `bg: "brand.50"` hardcoded palette step in selected-day style |
| 83 | Smell | `DatePicker/DayView.tsx` | Dead code: `getTableRowProps()` return value discarded |
| 84 | Smell | `Input/SearchInput.tsx` | Clear button renders when `onClear` is not provided — non-functional UI |
| 85 | Smell | `Input/SearchInput.tsx` | `width="100%"` should be `width="full"` (same as #50) |
| 86 | Smell | `src/index.ts` | Duplicate comment line (copy-paste artifact) |
| 87 | Smell | `preset.ts` | `colorPaletteValues` missing `purple`, `teal`, `cyan`, `pink` |
