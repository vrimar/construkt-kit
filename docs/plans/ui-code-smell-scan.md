# Deep Code-Smell & Improvement Pass — `@construkt-kit/ui` (full sweep)

## Context

A comprehensive, line-by-line scan of **all ~70 components**, the 5 hooks, the barrels/types,
and the 8 modified preset recipes. Every finding below was either **[verified]** by me reading
the code firsthand, or **[reported]** by a scanning agent and judged plausible (flagged for a
quick confirm during implementation). Agent-claimed "bugs" that I checked and **rejected** are
listed at the bottom so the reasoning is visible.

Baseline health is good: no hardcoded hex/rgb colors (incl. all 8 modified recipes), no `any`,
no `@ts-ignore`, no `console.*`/`debugger`/`TODO`. The `=> unknown` callback return type (21
sites) is an intentional convention — **left as-is**.

Scope chosen: **comprehensive, including structural**, and the in-flight working-tree files
**are in scope**.

---

## TIER 1 — Confirmed correctness bugs (do first)

| # | Bug | Location | Sev |
|---|-----|----------|-----|
| 1 | **Drawer never renders `<Positioner>`** — `DrawerContent` puts `<Content>` directly under `<Portal>`, but the `drawer` recipe styles a `positioner` slot per placement (left/right/top/bottom). Those placement styles are silently dropped. Dialog does it correctly. | [Drawer/index.tsx:36-49](packages/ui/src/components/Drawer/index.tsx#L36-L49) | **High** [verified] |
| 2 | **Pagination `size` prop is dead** — declared + required, and DataTable passes `variant === "basic" ? "xs" : "md"`, but the component never destructures it; every IconButton hardcodes `size="sm"`. The basic variant's intended smaller controls never render. | [Pagination.tsx:16,24-28,80-112](packages/ui/src/components/DataTable/Pagination.tsx#L16) ← [index.tsx:226](packages/ui/src/components/DataTable/index.tsx#L226) | **Med** [verified] |
| 3 | **`useFileSelect` stale-options closure** — `optionsRef` is set once and never synced; the returned `useCallback` has `[]` deps, so an updated `onSelect`/`accept`/`multiple` is ignored and the first-render closure fires. Add a render-time `optionsRef.current = options` (or an effect). | [useFileSelect.ts:33,44-45](packages/ui/src/hooks/useFileSelect.ts#L33) | **Med** [verified] |
| 4 | **Card `Footer` rendered as `<h3>`** — a footer is not a heading, and it duplicates Title's `h3`. Change to `ark.div` (or `ark.footer`); styling comes from the recipe slot, so no visual change. | [Card/index.tsx:11](packages/ui/src/components/Card/index.tsx#L11) | **Med** [verified] |
| 5 | **Popover/Menu `RootProvider` wrap `ArkX.Root`** instead of `ArkX.RootProvider` — broken duplicates of `Root` that can't accept an external machine `value`. Currently **unused** (grep-confirmed), so latent. Fix to `ArkPopover.RootProvider`/`ArkMenu.RootProvider` (matching Dialog/Drawer) or remove. | [Popover.tsx:19](packages/ui/src/components/Popover/Popover.tsx#L19), [Menu.tsx:17](packages/ui/src/components/Menu/Menu.tsx#L17) | **Low** [verified] |
| 6 | **`.filter(Boolean) as T[]`** unsafe cast — replace with type guard `.filter((x): x is T => x != null)`. | [ApplySelect/index.tsx:84](packages/ui/src/components/ApplySelect/index.tsx#L84) | **Low** [verified] |
| 7 | **ApplySelect can't Apply a cleared selection** — Apply is `disabled={!hasSelection}` where `hasSelection = tempSelected.length > 0`, yet the "Clear All" toggle intentionally produces an empty `tempSelected`. So a user can clear every item but cannot Apply the cleared state (e.g. to remove a filter) — a self-contradiction with the Clear-All affordance. Fix: gate Apply on *changed-from-`selected`* rather than non-empty (or drop the empty-disable). | [ApplySelect/index.tsx:113,175](packages/ui/src/components/ApplySelect/index.tsx#L113) | **Med** [verified] |
| 8 | **ColumnSearchInput debounce resets on `value`** — `useDebounce(fn, 500, [tempValue, value])` includes the `value` prop, so if *this* column's `value` changes while the user is mid-typing, the pending keystroke is cancelled and lost. Narrow (usually only on a filter-reset, where loss is acceptable), but the `value` dep is unnecessary; folds into the `useDebounceQuery` migration (2.6). | [ColumnSearchInput.tsx:17-23](packages/ui/src/components/DataTable/Header/Filters/ColumnSearchInput.tsx#L17-L23) | **Low** [verified] |

**Bug-hunt coverage (what was validated, not just what broke):** a dedicated correctness pass
cross-checked 23 compound components against their recipes (only Drawer #1 + Avatar mismatched),
traced the ApplySelect/Select/TagSelect/useRowSelection/DataTable/Tree state machines, and the
DatePicker value↔Ark conversions (`types.ts`). The following were specifically **traced and ruled
out as correct**: Pagination first/last/next/prev disable logic; Select's `handleValueChange`
change-detection under React batching; `useRowSelection` Set logic (empty page / page change);
Tree `mergeFilteredValue`/`collectCheckedLeafValues`; **ColumnDateFilter** intermediate-range sync
(its effect is gated on the `[dateValue]` string, so unrelated parent re-renders don't reset it —
an agent claim that didn't survive verification); and the `DatePicker/types.ts` conversions.

---

## TIER 2 — Duplication & missed reuse

**2.1 `formatDateValue` duplicated 3×** (identical `YYYY-MM-DD` builder) — extract to a new
`DatePicker/format.ts`, also folding in the DatePicker display-label IIFE as a named
`getDisplayLabel(...)`. `ColumnDateFilter` already imports from the DatePicker barrel.
[DatePicker.tsx:13-16,74-84](packages/ui/src/components/DatePicker/DatePicker.tsx#L13-L16) ·
[DatePickerSelect.tsx:9-11](packages/ui/src/components/DatePicker/DatePickerSelect.tsx#L9-L11) ·
[ColumnDateFilter.tsx:24-26](packages/ui/src/components/DataTable/Header/Filters/ColumnDateFilter.tsx#L24-L26) — **Med** [verified]

**2.2 DatePicker view-header + grid views duplicated 3×** — the prev/label/next `ViewControl`
block repeats across the day/month/year views, and `MonthView` ≈ `YearView` are near-identical
(only `getMonthsGrid` vs `getYearsGrid` differ). Extract `DatePickerViewHeader` (optional
secondary label for multi-month day view) and a shared `DatePickerGridView({ getGrid })`.
[CalendarContent.tsx:79-118](packages/ui/src/components/DatePicker/CalendarContent.tsx#L79-L118) ·
[MonthView.tsx:17-67](packages/ui/src/components/DatePicker/MonthView.tsx#L17-L67) ·
[YearView.tsx:17-67](packages/ui/src/components/DatePicker/YearView.tsx#L17-L67) — **Med/High** [verified]

**2.3 DataTable empty-state duplicated** (message + reset button; flow vs absolute-fill) —
extract `DataTableEmptyState({ label, resetLabel, onReset, layout })`.
[Cards.tsx:48-69](packages/ui/src/components/DataTable/Cards.tsx#L48-L69) ·
[Body/index.tsx:53-78](packages/ui/src/components/DataTable/Body/index.tsx#L53-L78) — **Med** [verified]

**2.4 `addOrRemove` not reused** — ApplySelect hand-rolls the toggle; use
`addOrRemove(prev, value)` from `packages/utils/src/array.ts`.
[ApplySelect/index.tsx:75-79](packages/ui/src/components/ApplySelect/index.tsx#L75-L79) — **Low/Med** [verified]

**2.5 `LISTBOX_ACTION_ATTRIBUTE` + `ItemActions` duplicated** between Listbox and TagSelect —
export `ItemActions` from Listbox (it's defined but omitted from the compound object) and reuse
it in TagSelect instead of the bare `<div data-listbox-item-action>`.
[Listbox.tsx:45,143-159](packages/ui/src/components/Listbox/Listbox.tsx#L45) ·
[TagSelect.tsx:15,122-124](packages/ui/src/components/Select/TagSelect.tsx#L122-L124) — **Med** [reported]

**2.6 Manual debounce vs `useDebounceQuery`** — `ColumnSearchInput` uses `react-use`'s
`useDebounce` + its own delay const; evaluate replacing with the shared `useDebounceQuery` hook
(confirm the hook's dual-state shape fits the call site).
[Header/Filters/ColumnSearchInput.tsx](packages/ui/src/components/DataTable/Header/Filters/ColumnSearchInput.tsx) — **Med** [reported]

**2.7 Tooltip vs TriggerTooltip** duplicate the Portal→Positioner→Content(+Arrow) wrapper —
extract a shared `TooltipContent`.
[Tooltip/index.tsx](packages/ui/src/components/Tooltip/index.tsx) ·
[Tooltip/TriggerTooltip.tsx](packages/ui/src/components/Tooltip/TriggerTooltip.tsx) — **Med** [reported]

**2.8 Lower-value dedup (optional):** Switch `Indicator`/`ThumbIndicator`
([Switch/index.tsx:25-59](packages/ui/src/components/Switch/index.tsx#L25-L59), [reported]);
`collectLeafValues`/`collectBranchValues`/`collectCheckedLeafValues` share a traversal shape →
optional `walkTree` helper ([treeCollectionUtils.ts](packages/ui/src/components/Tree/treeCollectionUtils.ts), [verified]);
CalendarContent renders the Clear button in two branches
([CalendarContent.tsx:44-51,139-148](packages/ui/src/components/DatePicker/CalendarContent.tsx#L44-L51), [verified]);
`query.trim().toLowerCase()` search-normalize repeated in Select + treeCollectionUtils
([verified]). — **Low**

---

## TIER 3 — Structural refactors (chosen scope)

**3.1 DataTable context** — replace prop-drilling of `loading/onRowClick/getRowProps/onReset/
labels` (DataTable → Cards/Body → empty-state) with a `DataTableContext`; children consume via
`useDataTableContext()`, keeping `table` (and Body's `renderSubRow`) explicit.
[index.tsx:190-218](packages/ui/src/components/DataTable/index.tsx#L190-L218) — [verified]

**3.2 Split `Select.tsx` (445 LOC)** — it bundles context + hooks + 10 small parts + the simple
wrapper. Split into `Select.context.ts`, `Select.parts.tsx`, `Select.tsx`; **public API and
barrel exports unchanged** (verify ApplySelect/TagSelect type imports still resolve). Pure file
reorg. [Select.tsx](packages/ui/src/components/Select/Select.tsx) — [verified]

**3.3 Select O(n²) → O(n) diff** — replace the double `find`+`includes` change detection with a
`Set`-based diff. [Select.tsx:159-175](packages/ui/src/components/Select/Select.tsx#L159-L175) — [verified]

**3.4 Extract `DataTableRow`** from the 4-level-deep Body row render (optional, readability).
[Body/index.tsx:79-107](packages/ui/src/components/DataTable/Body/index.tsx#L79-L107) — [verified]

---

## TIER 4 — React performance / correctness

- **Memoize DataTable `handleRowClick`** (passed to Cards + Body) with `useCallback`; wrap the
  other handlers for consistency. [index.tsx:105-177](packages/ui/src/components/DataTable/index.tsx#L105-L177) — [verified]
- **TagSelect per-render `items.find`** → build a `transformArray(items, getValue)` lookup once.
  [TagSelect.tsx:66](packages/ui/src/components/Select/TagSelect.tsx#L66) — [verified]
- **TreeSelectList `resolvedIsNodeCheckable`** recreated each render → `useCallback`.
  [TreeSelectList.tsx:236-249](packages/ui/src/components/Tree/TreeSelectList.tsx#L236-L249) — [verified]
- **`DatePickerSelect` unstable `useMemo` dep + lint-disable** — `value = toArkValue(props) ?? []`
  is a fresh array each render, so the memo never hits and the disable masks it; memoize `value`
  from stable inputs. [DatePickerSelect.tsx:14-20](packages/ui/src/components/DatePicker/DatePickerSelect.tsx#L14-L20) — [verified]
- **Index-as-`key`** in dynamic lists: CalendarContent months
  ([124-129](packages/ui/src/components/DatePicker/CalendarContent.tsx#L124-L129), [verified]),
  Carousel indicators ([reported]), ColorPicker swatches ([reported]), Slider thumbs ([reported]).
  Use stable keys where a stable id exists. — **Low**
- **RatingGroup** `cloneIcon` called twice + `Items` not memoized ([reported]) — **Low**

---

## TIER 5 — Type sharpening

- `--depth` CSS var: drop the blanket `as React.CSSProperties`, use
  `React.CSSProperties & { "--depth": number }`. [TreeSelectList.tsx:90](packages/ui/src/components/Tree/TreeSelectList.tsx#L90) — [verified]
- `e.target as HTMLElement` → `instanceof` guard:
  [DataTable/index.tsx:173](packages/ui/src/components/DataTable/index.tsx#L173) [verified],
  [SubmitDialog.tsx:37](packages/ui/src/components/Dialog/SubmitDialog.tsx#L37) [reported];
  and `getFilterValue() as string[]` → `?? []` in
  [HeaderFilterCellContent.tsx:23](packages/ui/src/components/DataTable/Header/HeaderFilterCellContent.tsx#L23) [reported].
- TagSelect `selected as string[]` → `selected.map(String)`.
  [TagSelect.tsx:59](packages/ui/src/components/Select/TagSelect.tsx#L59) — [verified]
- Avatar: `asChild` is destructured but never forwarded to `StyledFallback`; forward it (and add
  clarifying parens to the fallback expression — logic is already correct).
  [Avatar/index.tsx:30-31](packages/ui/src/components/Avatar/index.tsx#L30-L31) — **Low** [verified]

---

## TIER 6 — Accessibility

- **LoadingOverlay**: add `role="status"`, `aria-busy`, `aria-live="polite"`; name the
  `{base:240px, md:400px}` heights. [LoadingOverlay/index.tsx:32-52](packages/ui/src/components/LoadingOverlay/index.tsx#L32-L52) — **Med** [verified]
- **Clickable rows keyboard support** (guarded on `onRowClick`): role/tabIndex/onKeyDown for the
  Cards `Box` and Body row. **Caveat:** rows contain nested interactive cells — keep those
  independently focusable; don't wrap them in one semantic button.
  [Cards.tsx:72-86](packages/ui/src/components/DataTable/Cards.tsx#L72-L86) ·
  [Body/index.tsx:82-104](packages/ui/src/components/DataTable/Body/index.tsx#L82-L104) — **Med** [verified]
- **Clear/icon controls missing accessible names**: SelectButton's clear is a clickable `Box`
  ([SelectButton.tsx:48-56](packages/ui/src/components/Buttons/SelectButton.tsx#L48-L56), nested
  in a button — use a non-button focusable control with `aria-label`, [verified]); SearchInput
  clear ([SearchInput.tsx:38-45](packages/ui/src/components/Input/SearchInput.tsx#L38-L45)) and
  Combobox ClearTrigger ([Combobox/index.tsx:26-28](packages/ui/src/components/Combobox/index.tsx#L26-L28))
  need `aria-label`; TagSelect action `<div>` needs semantics; IconButton should require an
  accessible name. — **Med/Low** [reported]
- **Image** has no `alt` guidance; DatePicker calendar grids lack `aria-label`s. — **Low** [reported]

---

## TIER 7 — Magic constants & minor cleanups

- Name/justify the magic values: Toast offsets `80px/40px`
  ([Toast.tsx:50-53](packages/ui/src/components/Toast/Toast.tsx#L50-L53)), ToggleTip `gutter:4`
  ([ToggleTip/index.tsx:28](packages/ui/src/components/ToggleTip/index.tsx#L28)), Skeleton `80%`
  last-line ([Skeleton/index.tsx:39](packages/ui/src/components/Skeleton/index.tsx#L39)). — **Low** [reported]
- **Remove duplicated JSDoc line** [Layout/index.tsx:33-34](packages/ui/src/components/Layout/index.tsx#L33-L34) — **Low** [verified]
- Menu renders an empty `<svg>` for the unchecked indicator — return `null` unless it's a
  deliberate layout spacer (confirm). [Menu.tsx:57-61](packages/ui/src/components/Menu/Menu.tsx#L57-L61) — **Low** [verified]
- Drawer backdrop is unconditional; add a `backdrop?: boolean` prop to match Dialog. — **Low** [verified]
- DataTable `useMemo`s depend on the whole `params` object (recompute on any param change) —
  narrow deps. [index.tsx:73-101](packages/ui/src/components/DataTable/index.tsx#L73-L101) — **Low** [verified]
- `useDebounceQuery` omits `delay` from react-use's dep array (unsound if delay ever varies).
  [useDebounceQuery.ts](packages/ui/src/hooks/useDebounceQuery.ts) — **Low** [reported]
- VirtualScrollArea redundant `{ measureElement: undefined }` spread; FileUpload unused
  intermediate type. — **Low** [reported]
- Popover arrow CSS vars (`--arrow-size`/`--arrow-background`) use bare token paths while the
  same file uses brace interpolation elsewhere — **verify** they resolve (consistency only, not a
  color-hardcoding violation). [popover.ts:63-66](packages/preset/src/theme/recipes/popover.ts#L63-L66) — **Low** [verify]

---

## Reused utilities (do not re-implement)

`addOrRemove`, `transformArray` (`packages/utils/src/array.ts`) · `parseDate`/`DateValue`
(DatePicker barrel) · `WithRef<T,E>` (`packages/ui/src/types.ts`) · `useDebounceQuery`,
`useIsMobile` (`packages/ui/src/hooks/`) · Listbox `ItemActions` (once exported).

---

## Deliberately excluded (checked → rejected)

- **Avatar "critical precedence bug"** — parses as `(children || asChild) ? …`, which matches
  intent; not a bug (kept only the minor `asChild`-not-forwarded nit).
- **Button `props.asChild` "bug"** — context never carries `asChild`, so it equals
  `buttonProps.asChild`. Loader "ref loss" — Button never passes a ref to Loader.
- **Dialog CloseTrigger "identical branches"** — branches genuinely differ (children vs `asChild`
  CloseButton). **Tooltip `Object.assign`** — correct for a callable+parts component (like Select).
- **popover `calc(100vw - {spacing.4})`** — valid Panda interpolation, not malformed.
- **tabs.ts hover `color: colorPalette.solid.bg`** — intentional brand-colored hover text;
  `.solid.fg` would render near-invisible.
- **`useMediaQuery` `- 0.02`** and **Select `minContentWidth`** — already documented / already a
  named constant. **`=> unknown` callbacks** — accepted convention.
- **ColumnDateFilter intermediate-range reset** — effect is gated on the `[dateValue]` string, so
  unrelated parent re-renders don't reset in-progress selection.

---

## Verification

1. `pnpm typecheck` (esp. after Select split 3.2 and the type-guard changes).
2. `pnpm lint` + `pnpm format`.
3. `pnpm test` (covers Select / TreeSelectList / Listbox / VirtualScrollArea).
4. `pnpm build` — barrels/public surface unchanged.
5. `pnpm storybook` — visual checks:
   - **Drawer** from each placement (left/right/top/bottom) — confirms Positioner fix (#1).
   - **DataTable** `variant="basic"` pagination button size (#2); empty state + reset (scroll &
     cards); row click + keyboard activation; date filter labels.
   - **DatePicker** single/range/multiple labels, month/year view navigation (post-dedup 2.1/2.2).
   - **ApplySelect / Select / TagSelect** select, toggle-all, apply, tags, search.
   - **Card** footer styling unchanged after `h3→div` (#4).
   - **FileUpload** — pass a changing `onSelect` to confirm the stale-closure fix (#3).
   - **LoadingOverlay** with an a11y inspector (`role=status`, `aria-busy`).

## Suggested sequencing

Land Tier 1 bugs first (small, isolated commits), then Tier 2 dedup, then the Tier 3 structural
refactors (DataTable context, Select split) on their own so they're easy to review, then the
Tier 4–7 polish. The structural commits must not change any public export.
