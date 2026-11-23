import {
  Box,
  EmptyState,
  LoadingOverlay,
  Spinner,
  useAnnouncer,
  useComposedRefs,
  useLatestRef,
} from "@construkt-kit/ui";
import {
  type CSSProperties,
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { GRID_CHANNELS, type GridOptions } from "../core/grid";
import { useCellTooltip } from "./CellTooltip";
import { GridContexts } from "./context";
import { ColumnDropLayer, DragGhost, RowDropMarker } from "./DropIndicators";
import { ariaRows, geometryVars } from "./geometry";
import { GridHeader } from "./GridHeader";
import { BodyRows, PinnedBand, type RowShared, StickyParents } from "./GridRow";
import { ColumnOutlines, RowOutlines } from "./Outlines";
import { Overlays } from "./Overlays";
import { dataGrid } from "./recipe";
import { selectionColumn } from "./selectionColumn";
import { SharedMenu } from "./SharedMenu";
import { StatusBar } from "./StatusBar";
import type { DataGridLabels, DataGridOwnProps, DataGridProps } from "./types";
import { useCopyHandler } from "./useClipboard";
import { useExternalDrop, useGripDrop } from "./useDragDrop";
import { useGridApi } from "./useGridApi";
import {
  splitGridOptions,
  useGridCore,
  useGridMeasurements,
  useGridOptions,
  useGridScroll,
} from "./useGridCore";
import { useGridFocus } from "./useGridFocus";
import { useGridKeyboard, useMoveAnnouncer } from "./useGridKeyboard";
import { usePointerSelection } from "./usePointerSelection";

const DEFAULT_LABELS: DataGridLabels = {
  loading: "Loading rows",
  empty: "No rows",
  loaded: (count) => `${count} ${count === 1 ? "row" : "rows"}`,
  expandRow: "Expand row",
  collapseRow: "Collapse row",
  selectRow: "Select row",
  selectAllRows: "Select all rows",
  resizeColumn: "Resize column",
  copyRefused: "Can't copy ranges that share neither rows nor columns",
  copied: "Copied",
  rowMoved: (position, count) => `Moved to row ${position} of ${count}`,
  columnMoved: (position, count) => `Moved to column ${position} of ${count}`,
  dragging: (count) => `${count} items`,
  renameHeader: "Column name",
  selected: (count, kind) =>
    count === 0
      ? "Selection cleared"
      : `${count} ${SELECTED_NOUNS[kind][count === 1 ? 0 : 1]} selected`,
  columnWidth: (width) => `${width} pixels`,
};

const SELECTED_NOUNS = {
  rows: ["row", "rows"],
  columns: ["column", "columns"],
  groups: ["column group", "column groups"],
  cells: ["cell", "cells"],
} as const;

const withDefaults = <T extends object>(defaults: T, overrides: Partial<T> | undefined): T => ({
  ...defaults,
  ...Object.fromEntries(Object.entries(overrides ?? {}).filter(([, value]) => value !== undefined)),
});

type OwnKey = Exclude<keyof DataGridOwnProps<unknown>, keyof GridOptions<unknown, unknown>>;

const DATA_GRID_OWN_KEYS: Readonly<Record<OwnKey, true>> = {
  size: true,
  variant: true,
  striped: true,
  gridLines: true,
  loading: true,
  emptyState: true,
  toolbar: true,
  statusBar: true,
  labels: true,
  apiRef: true,
  rowNumbers: true,
  resizableRows: true,
  renderFullWidthRow: true,
  outlines: true,
  onVisibleRangeChange: true,
  onCellClick: true,
  onHeaderClick: true,
  pointerSelection: true,
  keymap: true,
  keyboardSelection: true,
  commands: true,
  onDragMove: true,
  dragLabel: true,
  onExternalDragOver: true,
  onExternalDrop: true,
  onExternalDragLeave: true,
};

/**
 * Virtualized, Excel-like grid over row records. Columns are layout; one `CellSpec` at grid
 * (`defaultCell`), column (`column.cell`) and cell (`getCell`) scope says how each cell looks.
 * Style props go to the root element. Needs the `@construkt-kit/data-grid/preset` Panda preset.
 */
export function DataGrid<TRow>(props: DataGridProps<TRow>) {
  const [
    gridOptions,
    own,
    {
      className,
      style,
      ref,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...rootProps
    },
  ] = splitGridOptions(props, DATA_GRID_OWN_KEYS);
  const {
    loading = false,
    emptyState,
    toolbar,
    statusBar,
    labels: labelOverrides,
    rowNumbers = false,
    resizableRows = true,
    renderFullWidthRow,
    outlines,
    onVisibleRangeChange,
    size,
    variant,
    striped,
    gridLines,
  } = own;
  const { onRowsDrop, onColumnsDrop, canDropAcross, onDropAcross, ...coreProps } = gridOptions;
  const { rows, columnDefs, checkboxSelection } = coreProps;
  const labels = withDefaults(DEFAULT_LABELS, labelOverrides);
  const latestLabels = useLatestRef(labels);
  const classes = useMemo(
    () => dataGrid({ size, variant, striped, gridLines }),
    [size, variant, striped, gridLines],
  );
  const { selectRow, selectAllRows } = labels;
  const allColumnDefs = useMemo(
    () =>
      checkboxSelection
        ? [selectionColumn<TRow>({ selectRow, selectAllRows }), ...columnDefs]
        : columnDefs,
    [checkboxSelection, columnDefs, selectRow, selectAllRows],
  );
  const { announce, liveRegion } = useAnnouncer();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const composedRootRef = useComposedRefs(ref, rootRef);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [rowProbe, setRowProbe] = useState<HTMLDivElement | null>(null);
  const [headerProbe, setHeaderProbe] = useState<HTMLDivElement | null>(null);
  const [gutterProbe, setGutterProbe] = useState<HTMLDivElement | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const startGuard = useRef<HTMLSpanElement>(null);
  const endGuard = useRef<HTMLSpanElement>(null);

  const coreOptions = { ...coreProps, columnDefs: allColumnDefs };
  const core = useGridCore<TRow>(coreOptions);
  const grip = useGripDrop(core, {
    ...own,
    onRowsDrop,
    onColumnsDrop,
    canDropAcross,
    onDropAcross,
    scroller,
    handleClassName: classes.handle,
    labels: latestLabels,
  });
  const onKeyboardMove = useMoveAnnouncer(core, {
    rows,
    columnDefs,
    announce,
    labels: latestLabels,
  });
  useGridOptions(core, { ...coreOptions, ...grip.options, onKeyboardMove });

  const tooltip = useCellTooltip(core);
  useCopyHandler(core, scroller, { announce, labels: latestLabels });
  const pointer = usePointerSelection({ ...own, core, scroller });
  const externalDrop = useExternalDrop(core, scroller, own);
  useGridMeasurements(core, scroller, rowProbe, headerProbe, gutterProbe);
  useGridScroll(core, scroller, bandRef, onVisibleRangeChange);
  const focus = useGridFocus(core, scroller);
  const autosize = useGridApi(core, { ...own, scroller, rootRef });
  const onAutosize = useCallback((columnId: string) => autosize([columnId]), [autosize]);
  const keyboard = useGridKeyboard(core, {
    ...own,
    startGuard,
    endGuard,
    focusActiveCell: focus.focusActiveCell,
    announce,
    labels: latestLabels,
  });

  const wasLoading = useRef(loading);
  useEffect(() => {
    if (wasLoading.current === loading) return;
    wasLoading.current = loading;
    const { current } = latestLabels;
    if (loading) announce(current.loading);
    else announce(core.rowCount === 0 ? current.empty : current.loaded(core.rowCount));
  }, [loading, announce, core, latestLabels]);

  const onScroll = (event: UIEvent<HTMLDivElement>) =>
    core.setScroll(event.currentTarget.scrollTop, event.currentTarget.scrollLeft);

  const columns = core.columns;
  const gutter = core.gutter;
  const viewportWidth = core.viewport.width;
  const geometry = useMemo(
    () => ({
      ...geometryVars(columns, gutter),
      "--data-grid-viewport-w": viewportWidth > 0 ? `${viewportWidth}px` : "100%",
    }),
    [columns, gutter, viewportWidth],
  );

  const rowCount = core.rowCount;
  const columnCount = columns.leaves.length;
  const isEmpty = rowCount === 0;
  const aria = ariaRows(core);
  const columnsKey = core.renderedColumns().join(",");
  const renderedColumns = useMemo(
    () => (columnsKey === "" ? [] : columnsKey.split(",").map(Number)),
    [columnsKey],
  );
  const rowShared: RowShared = {
    core,
    classes,
    cellsVersion: core.channels.version(GRID_CHANNELS.cells),
    renderedColumns,
    gutter: rowNumbers,
    resizableRows,
    tree: core.isTree,
    expandLabel: labels.expandRow,
    collapseLabel: labels.collapseRow,
    renderFullWidthRow,
  };
  const guardIndex = core.activePosition() ? 0 : -1;

  return (
    <GridContexts
      core={core}
      onEditorTab={(event) => {
        focus.onKeyDown();
        keyboard.onEditorTab(event);
      }}
    >
      <Box
        {...rootProps}
        ref={composedRootRef}
        className={className ? `${classes.root} ${className}` : classes.root}
        style={{ ...geometry, ...style }}
      >
        {toolbar != null && <div className={classes.toolbar}>{toolbar}</div>}
        <span
          ref={startGuard}
          className={classes.guard}
          tabIndex={guardIndex}
          onFocus={keyboard.onGuardFocus}
        />
        <div className={classes.viewport}>
          <div
            ref={setScroller}
            className={classes.scroller}
            role={core.isTree ? "treegrid" : "grid"}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-rowcount={aria.count}
            aria-colcount={columnCount}
            aria-multiselectable
            aria-busy={loading || undefined}
            data-drop-refused={grip.refused || undefined}
            onScroll={onScroll}
            onPointerDown={pointer.onPointerDown}
            onMouseDown={focus.onMouseDown}
            onClick={(event) => {
              if (pointer.onClick(event)) focus.focusActiveCell({ focusVisible: false });
            }}
            onDoubleClick={pointer.onDoubleClick}
            onContextMenu={pointer.onContextMenu}
            {...externalDrop}
            onKeyDown={(event) => {
              focus.onKeyDown();
              keyboard.onKeyDown(event);
            }}
            onFocus={(event) => {
              tooltip.onFocus(event);
              focus.onFocus(event);
            }}
            onBlur={(event) => {
              tooltip.onBlur();
              focus.onBlur(event);
            }}
            onPointerOver={tooltip.onPointerOver}
            onPointerLeave={tooltip.onPointerLeave}
          >
            <div
              className={classes.canvas}
              role="presentation"
            >
              <ColumnDropLayer
                core={core}
                classes={classes}
              />
              {outlines && (
                <ColumnOutlines
                  core={core}
                  classes={classes}
                  outlines={outlines}
                />
              )}
              <GridHeader
                core={core}
                classes={classes}
                renderedColumns={renderedColumns}
                gutter={rowNumbers}
                onAutosize={onAutosize}
                resizeLabel={labels.resizeColumn}
                widthText={labels.columnWidth}
                renameLabel={labels.renameHeader}
                onResizeExit={focus.focusActiveCell}
              />
              <PinnedBand
                {...rowShared}
                side="top"
                firstAriaRowIndex={aria.top}
              />
              <div
                className={classes.body}
                role="rowgroup"
                style={{ height: core.bodyScrollHeight }}
              >
                <StickyParents
                  {...rowShared}
                  bandRef={bandRef}
                />
                <div
                  ref={bandRef}
                  className={classes.band}
                  role="presentation"
                  style={
                    {
                      top: core.bandTop,
                      "--data-grid-body-top": `${core.bodyTop}px`,
                      "--data-grid-body-bottom": `${core.pinnedBottomHeight}px`,
                    } as CSSProperties
                  }
                >
                  <BodyRows
                    {...rowShared}
                    firstAriaRowIndex={aria.body}
                  />
                  <Overlays
                    core={core}
                    classes={classes}
                  />
                  <RowDropMarker
                    core={core}
                    classes={classes}
                  />
                  {outlines && (
                    <RowOutlines
                      core={core}
                      classes={classes}
                      outlines={outlines}
                    />
                  )}
                </div>
              </div>
              {isEmpty && (
                <div
                  role="row"
                  aria-rowindex={aria.body}
                >
                  <div
                    role="gridcell"
                    className={classes.empty}
                    aria-colspan={Math.max(1, columnCount)}
                    style={{ width: core.viewport.width || undefined }}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        {labels.loading}
                      </>
                    ) : (
                      (emptyState ?? (
                        <EmptyState.Root>
                          <EmptyState.Content>
                            <EmptyState.Title>{labels.empty}</EmptyState.Title>
                          </EmptyState.Content>
                        </EmptyState.Root>
                      ))
                    )}
                  </div>
                </div>
              )}
              <PinnedBand
                {...rowShared}
                side="bottom"
                firstAriaRowIndex={aria.bottom}
              />
            </div>
          </div>
          <LoadingOverlay
            loading={loading && !isEmpty}
            tip={labels.loading}
          />
        </div>
        <span
          ref={endGuard}
          className={classes.guard}
          tabIndex={guardIndex}
          onFocus={keyboard.onGuardFocus}
        />
        {statusBar != null && (
          <StatusBar
            core={core}
            className={classes.statusBar}
            render={statusBar}
          />
        )}
        <SharedMenu
          core={core}
          scroller={scroller}
        />
        <div
          ref={setRowProbe}
          className={classes.probe}
          data-probe="row"
        />
        <div
          ref={setHeaderProbe}
          className={classes.probe}
          data-probe="header"
        />
        {rowNumbers && (
          <div
            ref={setGutterProbe}
            className={classes.probe}
            data-probe="gutter"
          >
            {"0".repeat(String(Math.max(1, rowCount)).length)}
          </div>
        )}
        {liveRegion}
        {tooltip.tooltip}
        <DragGhost
          classes={classes}
          label={grip.ghost?.label ?? null}
          ghostRef={grip.ghostRef}
        />
      </Box>
    </GridContexts>
  );
}
