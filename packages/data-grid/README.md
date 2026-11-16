# @construkt-kit/data-grid

Virtualized, Excel-like data grid for Construkt Kit apps: ~100k rows × ~200 columns, keyboard and screen-reader
first. Private and pre-0.1. Sort, filter, quick search and pagination are not the grid's job: pass rows already in
display order.

## Usage

```tsx
import { DataGrid, type ColumnDef } from "@construkt-kit/data-grid";

const columnDefs: ColumnDef<Invoice>[] = [
  { id: "customer", header: "Customer", field: "customer", width: 200 },
  {
    id: "amount",
    header: "Amount",
    field: "amount",
    cell: { format: (value) => currency.format(value as number) },
  },
];

<DataGrid
  rows={invoices}
  getRowId={(row) => row.id}
  columnDefs={columnDefs}
  getCell={({ columnId, value }) =>
    columnId === "amount" && (value as number) < 0 ? { tone: "danger" } : undefined
  }
  aria-label="Invoices"
  height="480px"
/>;
```

Columns are layout; a `CellSpec` says how a cell looks. It is set at three scopes, and each scope's defined keys
override the previous one's: `defaultCell` < `column.cell` < `getCell(ctx)`. `getCell` runs only for mounted cells.
A cell's `ctx` is its row's `RowContext` (`row`, `rowId`, `rowIndex`, `depth`, `hasChildren`, `expanded`) plus
`columnId`, `columnIndex` and `value`.

The grid compares `columnDefs`, `defaultCell`, `getCell` and `getRowHeight` by identity: a new value re-renders every
mounted row, and a new `getRowHeight` re-reads every row's height. Define them outside the component or memoise them.

| `CellSpec` key       | Does                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| `format(value, ctx)` | Text for the value. Defaults to the value as text                        |
| `render(ctx)`        | Custom content in place of the text                                      |
| `tone`               | A `CellTone`: `neutral`, `brand`, `info`, `success`, `warning`, `danger` |
| `style`              | Runtime `background` / `color` for the cell                              |
| `tooltip`            | Node or `(ctx) => node`; one shared tooltip per grid, on hover and focus |
| `menu(ctx)`          | Context-menu items for the cell; see Menus                               |

| Prop                                                | Does                                                                                                                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rows`, `getRowId`                                  | Rows in display order. A new array diffs by id; unchanged row objects don't re-render                                                                                       |
| `columnDefs`                                        | Columns and groups; see below                                                                                                                                               |
| `getRowHeight(row)`                                 | px; heights are known up front, never measured. Default: the size's row height                                                                                              |
| `defaultCell`, `getCell`                            | Grid- and cell-scope `CellSpec`                                                                                                                                             |
| `loading`, `emptyState`                             | Spinner in place of rows while empty, overlay while rows show; content when empty                                                                                           |
| `toolbar`, `statusBar`                              | Slots above and below the grid; `statusBar` may be `({ stats, selection, cellSelection }) => node`                                                                          |
| `size`, `variant`, `striped`, `gridLines`           | Grid-level variants                                                                                                                                                         |
| `labels`                                            | Announced text (`loading`, `empty`, `loaded(count)`, `copied`, `copyRefused`, `selected(count, kind)`, `rowMoved`, `columnMoved`), checkbox, resize, rename and drag labels |
| `headerHeight`                                      | px, or one per header level from the top. Default: the size's header height                                                                                                 |
| `rowNumbers`, `columnLetters`                       | Row-number gutter pinned left; a row of column letters above the headers                                                                                                    |
| `columnSizing`, `columnPinning`, `columnVisibility` | Column state; each controlled when given, with an `on…Change`                                                                                                               |
| `onStateChange`                                     | A new `DataGridState` snapshot whenever the user changes column state                                                                                                       |
| `getParentId`                                       | Makes rows a tree (`treegrid`); the `rowHeader` column indents and toggles. Parents stick under the header, stacked by level                                                |
| `expandedRowIds`                                    | Open parents, controllable, with `onExpandedRowIdsChange`; `defaultExpandedRowIds` seeds it. Parents start collapsed                                                        |
| `isFullWidthRow`, `renderFullWidthRow`              | One cell across the grid, kept in view while scrolling sideways; `renderFullWidthRow` gets the row's `RowContext` with `toggleExpanded` and `dragHandleProps`               |
| `pinnedTopRows`, `pinnedBottomRows`                 | Rows held under the header or above the bottom edge                                                                                                                         |
| `rowSizing`                                         | Row heights the user set by dragging a gutter or row-header bottom edge; `onRowSizingChange` once, on release                                                               |
| `onVisibleRangeChange`                              | First and last row in view; the first is the parent stuck at the top edge when there is one                                                                                 |
| `selection`                                         | Selected rows, columns or groups, `{ kind, ids }` or `null`; controllable, with `onSelectionChange` and `defaultSelection`                                                  |
| `selectionMode`                                     | `"multiple"` (default), `"single"` or `"none"`                                                                                                                              |
| `isRowSelectable(row)`                              | Rows the gutter, checkboxes and ranges of rows may select                                                                                                                   |
| `checkboxSelection`                                 | A pinned checkbox column; its header selects every row; Space toggles the active row                                                                                        |
| `cellSelection`                                     | Cell ranges by corner ids; controllable, with `onCellSelectionChange`, called once per drag, on release                                                                     |
| `onSelectionEnd`                                    | Once a click, drag or key that selects has finished, with both selections                                                                                                   |
| `onCellClick`, `onHeaderClick`                      | `(ctx, event)`; a click that ends a range drag, or lands on a button or other control inside, doesn't count                                                                 |
| `keymap`, `commands`                                | App bindings and commands; see Keyboard                                                                                                                                     |
| `apiRef`                                            | See below                                                                                                                                                                   |

### Columns

| `ColumnDef` key                     | Does                                                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `header`                      | Header is a label or `(ctx) => node`                                                                                                                                  |
| `field` / `getValue`                | Where the value comes from                                                                                                                                            |
| `width`, `minWidth`, `maxWidth`     | px; width defaults to 150                                                                                                                                             |
| `flex`                              | Share of the centre region's free width; a clamped column gives its excess to the others                                                                              |
| `pinned`                            | Initial `left` / `right` pin; pins the whole top-level group                                                                                                          |
| `hidden`                            | Initial visibility                                                                                                                                                    |
| `resizable`                         | Defaults to `true`. Drag a header's right edge; double-click to fit                                                                                                   |
| `rowHeader`                         | Its cells are row headers for screen readers; a top-level leaf's header spans every level                                                                             |
| `selectable`                        | Defaults to `true`. Clicking the header selects the column, or the group                                                                                              |
| `menu(ctx)`                         | Context-menu items for the header, leaf or group                                                                                                                      |
| `children`                          | Makes a group. Groups nest; resizing one shares the change across its columns                                                                                         |
| `colSpan(row, ctx)`                 | Columns a cell spans right, clipped at its pinned region's edge and before a cell an earlier merge covers                                                             |
| `rowSpan(row, ctx)` / `"sameValue"` | Rows a cell spans down, or merge runs of equal values; stops at parent and full-width rows; the first span wins, so a merge starting inside an earlier one is dropped |
| `cell`                              | Column-scope `CellSpec`                                                                                                                                               |

`width`, `pinned` and `hidden` are starting values. What the user changes lives in `columnSizing`, `columnPinning`
(by top-level id; `false` unpins) and `columnVisibility`; a resize reports once, on release. Pins that would leave no
room for the centre region are suspended until the grid is wide enough, and kept.

| `apiRef`                                                            | Does                                                                                                        |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `scrollToCell`, `getCellRect`                                       | By `{ rowId, columnId }`                                                                                    |
| `runCommand(name)`                                                  | A keyboard command, such as `"moveDown"`                                                                    |
| `getState`, `restoreState`                                          | Versioned snapshot of column state, open rows and row heights (`version: 2`; a v1 snapshot still restores)  |
| `autosizeColumns(ids?)`                                             | Fits columns to their header and mounted cells                                                              |
| `resetColumnWidth(id)`                                              | Drops the user's width                                                                                      |
| `setColumnHidden(id, hidden)`, `setColumnPinned(id, side \| false)` | Hide/show and pin, for an app's own column chooser                                                          |
| `setRowExpanded(id, expanded)`, `resetRowHeight(id)`                | Tree rows and row heights                                                                                   |
| `copy()`                                                            | Writes what Mod+C would copy, as TSV and HTML                                                               |
| `getRangeRect(range)`                                               | Viewport rect of a range, mounted or not, to anchor a toolbar at `onSelectionEnd`                           |
| `flash({ rows, columns, cells, kind })`                             | Briefly tints rows, columns or cells, such as ones that changed; `kind` is a `CellTone`, `brand` by default |
| `startColumnResize(id)`                                             | Keyboard resize: ← / → resize the column, Shift for 50px steps, Enter or Escape returns                     |
| `hitTest(clientX, clientY)`                                         | Region, row, column or header, fractions and rect under a viewport point, mounted or not                    |
| `editCell({ rowId, columnId })`, `renameHeader(id)`                 | Opens an editor, such as from a menu's "Rename" item                                                        |

### Selection

Two selections live side by side. Entity selection is rows, columns or column groups, one kind at a time: the
gutter, checkboxes and headers select; Shift selects a range over visible, selectable items; Mod toggles one;
clicking the only selected item clears it. In a tree, selecting a parent selects its descendants, and a parent is
selected exactly when all its selectable children are; one that is partly selected shows as mixed.

Cell ranges are separate: drag across cells, Shift+click to extend from the active cell, Mod+click to add a range. A
range widens to cover every merge it cuts. Changing the entity selection, moving with the keys, reordering or
collapsing rows and columns all collapse the ranges back to the active cell. Pinned rows are summaries: the active
cell, keyboard moves and ranges cover body rows only.

Mod+C copies the ranges, else the selected rows or columns, else the active cell, as TSV and an HTML table; cells a
merge covers copy empty. Several ranges copy only when they share their rows or their columns. Inside the grid, the
browser keeps Mod+C while focus is in a text-like input, a textarea, a select or editable content, or while text in
the grid is selected; a focused button, checkbox or other non-text input in a cell still copies the grid's selection.

### Menus

`column.menu(ctx)` and a `CellSpec`'s `menu(ctx)` return items, `{ id, label, icon?, hint?, disabled?,
destructive?, onSelect?, items? }` or `{ type: "separator" }`; `items` opens a submenu. Right-click or long-press
opens them at the pointer, Shift+F10 or the context-menu key at the active cell, Alt+↓ the active column's header
menu. A button inside a cell or header passes its click to `ctx.openMenu`. One menu instance serves the grid, and
focus returns to whatever opened it. The context names what to act on: `ids` for a header, `rowIds`, `columnIds` and
`ranges` for a cell. Each is the whole selection when the target is part of it, else the target alone. An empty
list leaves the browser's own menu.

### Reorder and drop

Order stays controlled: the grid reports a drop and the app applies it to `rows` or `columnDefs`. A grip drags:
spread `ctx.dragHandleProps` (set only while `onRowsDrop` / `onColumnsDrop` is given and the item may move) onto an
element in a cell, header or full-width row. A header click still selects; only the grip drags.

```tsx
cell: {
  render: (ctx) => (
    <>
      {ctx.dragHandleProps && <span {...ctx.dragHandleProps}>⠿</span>}
      {ctx.formattedValue}
    </>
  ),
},
```

- `onRowsDrop` / `onColumnsDrop` get `{ ids, targetId, position, rect, point }`. `position` is `"before"`, `"after"`
  or `"onto"`; `rect` is the target, to anchor a follow-up such as a merge picker.
- Dragging a selected item drags the selected items that share its parent: rows under one parent, columns in one
  group and pinned region. A leaf stays inside its group; a drag past the group's edge lands at that edge.
- The target's top and bottom thirds are the gaps before and after it. The middle third drops onto it when
  `canDropOnto(source, targetId)` says so, and is otherwise the nearer gap. A drop that would change nothing is not
  reported.
- `isRowReorderable(row)` and `column.reorderable` keep an item from being dragged, moved or targeted. Pinned rows
  never take part.
- Alt+Shift+↑ / ↓ moves the active row, or the selected rows it is in, past its neighbour; Alt+Shift+← / → does the
  same for columns. Once the app applies the move the grid announces the new position.
- External drags (native drag and drop, such as a sidebar item or a file) call `onExternalDragOver({ hit, types,
  dataTransfer })` as they move, and again as the grid scrolls under a still pointer near an edge; return `true` to
  accept a drop there. `onExternalDrop` receives the same, and `onExternalDragLeave` ends it.
- `indicator` draws a line in a gap or a box onto a row or column for as long as it is set, such as during an
  external drag or while a merge picker is open. It runs through header and body and follows a resize.

### Editing

A `CellSpec` with `editable: true` edits its text in place: F2 or a double-click opens the editor with the text
selected, Enter or leaving the field commits, Escape cancels, Tab commits and moves on. `onCellsChange` receives
`[{ rowId, columnId, row, value, previousValue }]`, with `value` from `parse(text, ctx)` when the spec has one; the
grid keeps showing `rows` until they change. A column with `headerEditable` renames its header on double-click,
calling `onHeaderRename({ columnId, name })`; a custom `header` names its text with `headerText`. Text that comes back
unchanged reports nothing; empty text is reported, for the app to refuse.
Style props, `className` and `style` go to the root element. Row height follows the size and the app's
`data-density`; coarse pointers get 44px rows.

### Keyboard

| Keys                                                    | Moves to                                                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Arrows                                                  | Neighbouring cell                                                                                    |
| Home / End, Mod+← / Mod+→                               | First / last cell of the row                                                                         |
| Mod+↑ / Mod+↓                                           | First / last row                                                                                     |
| Mod+Home / Mod+End                                      | First / last cell of the grid                                                                        |
| PageUp / PageDown                                       | One viewport up / down                                                                               |
| Tab / Shift+Tab                                         | Next / previous cell, wrapping rows; leaves the grid past the last / first cell                      |
| Enter                                                   | Into the first control a `render`ed cell holds; on a parent row without one, expands or collapses it |
| F2                                                      | Edits an `editable` cell; otherwise into the first control a `render`ed cell holds                   |
| Escape                                                  | Out of a cell's controls, back to the cell; on a cell, clears both selections                        |
| Shift+Arrows, Shift+Home / End, Shift+PageUp / PageDown | Extend the range                                                                                     |
| Mod+Shift+Arrows, Mod+Shift+Home / End                  | Extend the range to the edge                                                                         |
| Mod+A                                                   | Select every cell                                                                                    |
| Shift+Space / Mod+Space                                 | Select the rows / columns the ranges or active cell cover                                            |
| Space                                                   | Toggle the active row's checkbox                                                                     |
| Alt+Shift+↑ / ↓, Alt+Shift+← / →                        | Move the active row or column, or the selection it is in                                             |

`keymap` binds shortcuts over these, such as `{ "Mod+D": "duplicate", Escape: null }`, and `commands` holds the
app's handlers, `{ duplicate: ({ api, activeCell, selection, cellSelection }) => … }`. A command that shares a
built-in's name runs first; returning `false` falls through to the built-in, then to the key's default binding.
`apiRef.runCommand` runs the same commands.

The grid is one tab stop: Tab from outside lands on the active cell, wherever it has scrolled to. Inside a cell's
controls, Tab moves between them and every other key is theirs.

## Styling

The grid owns a `dataGrid` slot recipe, shipped as a Panda preset. Apps add it next to their `designSystem`;
without it the grid renders unstyled:

```ts
import { dataGridPreset } from "@construkt-kit/data-grid/preset";

export default defineConfig({
  designSystem: "@construkt-kit/ui",
  presets: [dataGridPreset],
});
```

Import the object: Panda reads a string preset from a default export, which this entry doesn't have. An app that
sets its own `staticCss` must list `dataGrid` in it.

Theme the grid with CSS variables, set on the grid or any ancestor: `--data-grid-line-color`,
`--data-grid-group-line-color`, `--data-grid-selection-color`, `--data-grid-drop-color` (defaults to the selection
colour), `--data-grid-header-bg`, `--data-grid-header-fg` and `--data-grid-indent` (tree indent per level).

The recipe's class-name function comes from the grid's own `panda codegen` and is bundled into `dist`; it runs on ui's
recipe runtime (`@construkt-kit/ui/recipes/runtime`), so no `styled-system/` is published.

## Rules for grid code

- No Panda build extracts this package's source. Inside `src/`: no `css()`, `styled` or patterns, no `*Css` props and
  no style props on components; style through the recipe, inline geometry and CSS variables.
  `construkt/no-literal-style-props` and `no-restricted-imports` enforce this. Consumer style props on `<DataGrid>`
  are fine: the app's Panda extracts them. So are style and `*Css` props in `*.stories.tsx`, which Storybook's Panda
  extracts; the import ban still holds there.
- The preset must not declare `staticCss`: it would replace ui's `staticCss: { recipes: "*" }` and drop every ui
  variant ui's own code doesn't use. ui's setting already emits every variant of this recipe.
- Variants are grid-level only (`size`, `variant`, `striped`, `gridLines`), each setting its own CSS variable.
  Per-element state is data and ARIA attributes (`data-tone`, `data-pinned`, `data-parity`, `data-group-start`,
  `data-selected`, `data-editing`, `aria-selected`), never `data-active`. Range outlines, flashes and touch handles
  are overlay geometry over the rows, not cell state.
- `src/core/**` is framework-free: no `react`, `react-dom`, `@construkt-kit/ui` or Panda imports.
- Component props must pass `construkt/no-style-prop-name`: `columnDefs`, not `columns`; no `width`, `filter`,
  `order`, `start` or `end`.

## Tests

| Project   | Runs                                            | Files                                                     |
| --------- | ----------------------------------------------- | --------------------------------------------------------- |
| `core`    | Node                                            | `src/{core,preset}/**/*.test.ts`, `src/**/*.ssr.test.tsx` |
| `unit`    | jsdom                                           | `src/react/**/*.test.{ts,tsx}`                            |
| `browser` | Chromium, 1280×800                              | `src/**/*.browser.test.{ts,tsx}`                          |
| `touch`   | Chromium with touch, 390×844, `pointer: coarse` | `src/**/*.touch.test.{ts,tsx}`                            |

`pnpm test` runs `core` and `unit`; `pnpm test:browser` runs `browser` and `touch` and needs Playwright's Chromium
(`pnpm --filter @construkt-kit/data-grid exec playwright install chromium`).
