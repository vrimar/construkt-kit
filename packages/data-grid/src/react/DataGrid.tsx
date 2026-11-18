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
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { GRID_CHANNELS } from "../core/grid";
import { useCellTooltip } from "./CellTooltip";
import { GridCoreContext } from "./context";
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
import type { DataGridLabels, DataGridProps } from "./types";
import { useCopyHandler } from "./useClipboard";
import { useExternalDrop, useGripDrop } from "./useDragDrop";
import { useGridApi } from "./useGridApi";
import {
  type AnyGridCore,
  splitGridOptions,
  useGridCore,
  useGridMeasurements,
  useGridScroll,
} from "./useGridCore";
import { useGridFocus } from "./useGridFocus";
import { useGridKeyboard } from "./useGridKeyboard";
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

/**
 * Virtualized, Excel-like grid over row records. Columns are layout; one `CellSpec` at grid
 * (`defaultCell`), column (`column.cell`) and cell (`getCell`) scope says how each cell looks.
 * Style props go to the root element. Needs the `@construkt-kit/data-grid/preset` Panda preset.
 */
export function DataGrid<TRow>(props: DataGridProps<TRow>) {
  const [
    gridOptions,
    {
      loading = false,
      emptyState,
      toolbar,
      statusBar,
      labels: labelOverrides,
      apiRef,
      rowNumbers = false,
      resizableRows = true,
      renderFullWidthRow,
      outlines,
      onVisibleRangeChange,
      onCellClick,
      onHeaderClick,
      keymap,
      keyboardSelection,
      commands,
      onExternalDragOver,
      onExternalDrop,
      onExternalDragLeave,
      size,
      variant,
      striped,
      gridLines,
      className,
      style,
      ref,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...rootProps
    },
  ] = splitGridOptions(props);
  const { rows, columnDefs, checkboxSelection, onRowsDrop, onColumnsDrop } = gridOptions;
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
  const coreRef = useRef<AnyGridCore | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const composedRootRef = useComposedRefs(ref, rootRef);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [rowProbe, setRowProbe] = useState<HTMLDivElement | null>(null);
  const [headerProbe, setHeaderProbe] = useState<HTMLDivElement | null>(null);
  const [gutterProbe, setGutterProbe] = useState<HTMLDivElement | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const startGuard = useRef<HTMLSpanElement>(null);
  const endGuard = useRef<HTMLSpanElement>(null);

  const grip = useGripDrop({
    coreRef,
    scroller,
    handleClassName: classes.handle,
    labels: latestLabels,
    announce,
    rows,
    columnDefs,
    onRowsDrop,
    onColumnsDrop,
  });
  const core = useGridCore<TRow>({ ...gridOptions, columnDefs: allColumnDefs, ...grip.options });
  useLayoutEffect(() => {
    coreRef.current = core;
  });

  const tooltip = useCellTooltip(core);
  const onCopyRefused = useCallback(
    () => announce(latestLabels.current.copyRefused),
    [announce, latestLabels],
  );
  const onCopied = useCallback(
    () => announce(latestLabels.current.copied),
    [announce, latestLabels],
  );
  useCopyHandler(core, scroller, onCopyRefused, onCopied);
  const pointer = usePointerSelection({ core, scroller, onCellClick, onHeaderClick });
  const externalDrop = useExternalDrop(core, scroller, {
    onExternalDragOver,
    onExternalDrop,
    onExternalDragLeave,
  });
  useGridMeasurements(core, scroller, rowProbe, headerProbe, gutterProbe);
  useGridScroll(core, scroller, bandRef, onVisibleRangeChange);
  const focus = useGridFocus(core, scroller, rootRef);
  const { runNamed, autosize } = useGridApi(core, { scroller, rootRef, commands, apiRef });
  const keyboard = useGridKeyboard(core, {
    keymap,
    keyboardSelection,
    startGuard,
    endGuard,
    runNamed,
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
    <GridCoreContext value={core}>
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
            onScroll={onScroll}
            onPointerDown={pointer.onPointerDown}
            onMouseDown={focus.onMouseDown}
            onClick={(event) => {
              if (pointer.onClick(event)) focus.focusActiveCell();
            }}
            onDoubleClick={pointer.onDoubleClick}
            onContextMenu={pointer.onContextMenu}
            {...externalDrop}
            onKeyDown={keyboard.onKeyDown}
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
                onAutosize={(columnId) => autosize([columnId])}
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
    </GridCoreContext>
  );
}
