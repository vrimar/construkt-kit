import { type CSSProperties, type ReactNode, type RefObject, memo, useLayoutEffect } from "react";

import { headerText } from "../core/columns/columnModel";
import type { ColumnDef } from "../core/columns/types";
import { GRID_CHANNELS } from "../core/grid";
import type { RowNode } from "../core/rows/rowNode";
import type { RowSelectionState } from "../core/selection/controller";
import { RowDropMarker } from "./DropIndicators";
import { REGIONS, columnGeometry, regionProps, spanGeometry } from "./geometry";
import { InlineEditor } from "./InlineEditor";
import type { DataGridClasses } from "./recipe";
import type { FullWidthRowContext } from "./types";
import { type AnyGridCore, useChannels } from "./useGridCore";
import { useResizeDrag } from "./useResizeDrag";

export type RowVariant = "body" | "pinned" | "sticky";

export interface RowShared {
  core: AnyGridCore;
  classes: DataGridClasses;
  cellsVersion: number;
  renderedColumns: readonly number[];
  gutter: boolean;
  resizableRows: boolean;
  tree: boolean;
  expandLabel: string;
  collapseLabel: string;
  renderFullWidthRow?: (ctx: FullWidthRowContext<any>) => ReactNode;
}

interface GridRowProps extends RowShared {
  node: RowNode<any>;
  version: number;
  variant: RowVariant;
  rowTop: number;
  rowHeight: number;
  selectable: boolean;
  selected: RowSelectionState;
  rowIndex?: number;
  ariaRowIndex?: number;
  activeColumn?: number;
  dragging?: boolean;
  editingColumn?: number;
  treeState?: string;
  spanState?: string;
  selectedColumns?: string;
  rangeColumns?: string;
}

const GridRow = memo(function GridRow({
  core,
  classes,
  node,
  version,
  cellsVersion,
  variant,
  rowIndex = -1,
  ariaRowIndex,
  rowTop,
  rowHeight,
  renderedColumns,
  activeColumn = -1,
  gutter,
  resizableRows,
  tree,
  expandLabel,
  collapseLabel,
  renderFullWidthRow,
  selectable,
  selected,
  dragging = false,
  editingColumn = -1,
}: GridRowProps) {
  const body = variant === "body";
  const model = core.rowModel;
  const inTree = tree && rowIndex >= 0;
  const row = core.rowContext(node, rowIndex);
  const { depth, hasChildren, expanded } = row;
  const toggle = () => core.setRowExpanded(node.id, !expanded);
  const set = inTree ? model.positionInSet(rowIndex) : undefined;
  const rowProps = {
    role: "row",
    className: classes.row,
    "aria-hidden": variant === "sticky" || undefined,
    "aria-rowindex": ariaRowIndex,
    "aria-level": inTree ? depth + 1 : undefined,
    "aria-setsize": set?.size,
    "aria-posinset": set?.position,
    "aria-expanded": hasChildren ? expanded : undefined,
    "aria-selected": selectable ? selected === true : undefined,
    "data-reveal-group": "",
    "data-dragging": dragging || undefined,
    "data-row-index": body ? rowIndex : undefined,
    "data-sticky-index": variant === "sticky" ? rowIndex : undefined,
    "data-parity": rowIndex % 2 === 1 ? "odd" : "even",
    style: { top: rowTop, height: rowHeight },
  } as const;

  if (rowIndex >= 0 && model.kindOf(rowIndex) === "fullWidth") {
    return (
      <div {...rowProps}>
        <div
          role="gridcell"
          className={classes.fullWidth}
          aria-colspan={core.columns.leaves.length}
          data-col-index={body ? Math.max(0, activeColumn) : undefined}
          data-full-width=""
          tabIndex={body && activeColumn >= 0 ? 0 : -1}
        >
          {renderFullWidthRow?.({
            ...row,
            toggleExpanded: toggle,
            dragHandleProps: body ? core.dnd.handleProps({ kind: "rows", id: node.id }) : undefined,
          })}
        </div>
      </div>
    );
  }

  const { leaves } = core.columns;
  const spans = body && core.spans.active ? core.spans.rowSpans(rowIndex, renderedColumns) : null;
  const anchors = new Set<number>();
  for (const column of renderedColumns) {
    const span = spans?.get(column);
    if (!span) anchors.add(column);
    else if (span.row === rowIndex) anchors.add(span.column);
  }

  return (
    <div {...rowProps}>
      {REGIONS.map((region) => (
        <div
          key={region}
          {...regionProps(classes, region)}
        >
          {region === "left" && gutter && (
            <div
              className={classes.gutter}
              aria-hidden="true"
              data-gutter=""
            >
              {rowIndex >= 0 ? rowIndex + 1 : null}
              {body && resizableRows && (
                <RowResizeHandle
                  core={core}
                  classes={classes}
                  node={node}
                />
              )}
            </div>
          )}
          {[...anchors]
            .filter((index) => leaves[index]?.region === region)
            .sort((a, b) => a - b)
            .map((columnIndex) => {
              const leaf = leaves[columnIndex];
              const span = spans?.get(columnIndex);
              const rows = span?.rows ?? 1;
              const resizeNode =
                body && resizableRows && leaf.def.rowHeader
                  ? rows > 1
                    ? core.nodeAt(rowIndex + rows - 1)
                    : node
                  : undefined;
              return (
                <GridCell
                  key={leaf.id}
                  core={core}
                  classes={classes}
                  node={node}
                  version={version}
                  cellsVersion={cellsVersion}
                  rowIndex={rowIndex}
                  columnIndex={columnIndex}
                  def={leaf.def}
                  groupStart={leaf.groupStart}
                  body={body}
                  tree={inTree}
                  depth={depth}
                  hasChildren={hasChildren}
                  expanded={expanded}
                  spanRows={rows}
                  spanColumns={span?.columns ?? 1}
                  spanHeight={rows > 1 ? core.rowsHeight(rowIndex, rows) : undefined}
                  resizeNode={resizeNode}
                  active={body && columnIndex === activeColumn}
                  editing={body && columnIndex === editingColumn}
                  columnSelected={core.selection.isColumnSelected(columnIndex)}
                  inRange={body && core.selection.inCommittedRange(rowIndex, columnIndex)}
                  expandLabel={expandLabel}
                  collapseLabel={collapseLabel}
                />
              );
            })}
        </div>
      ))}
    </div>
  );
});

interface GridCellProps {
  core: AnyGridCore;
  classes: DataGridClasses;
  node: RowNode<any>;
  version: number;
  cellsVersion: number;
  rowIndex: number;
  columnIndex: number;
  def: ColumnDef<any, ReactNode>;
  groupStart: boolean;
  body: boolean;
  tree: boolean;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  spanRows: number;
  spanColumns: number;
  spanHeight: number | undefined;
  resizeNode: RowNode<any> | undefined;
  active: boolean;
  editing: boolean;
  columnSelected: boolean;
  inRange: boolean;
  expandLabel: string;
  collapseLabel: string;
}

const GridCell = memo(function GridCell({
  core,
  classes,
  node,
  rowIndex,
  columnIndex,
  def,
  groupStart,
  body,
  tree,
  depth,
  hasChildren,
  expanded,
  spanRows,
  spanColumns,
  spanHeight,
  resizeNode,
  active,
  editing,
  columnSelected,
  inRange,
  expandLabel,
  collapseLabel,
}: GridCellProps) {
  const { spec, ctx } = core.resolveNodeCell(node, rowIndex, columnIndex);
  const geometry =
    spanColumns > 1
      ? spanGeometry(columnIndex, columnIndex + spanColumns - 1)
      : columnGeometry(columnIndex);
  const style = {
    ...geometry,
    ...(spanRows > 1 && { height: spanHeight, bottom: "auto" }),
    "--data-grid-cell-bg": spec.style?.background,
    "--data-grid-cell-fg": spec.style?.color,
  } as CSSProperties;
  const merged = spanRows > 1 || spanColumns > 1;
  const toggle = () => core.setRowExpanded(node.id, !expanded);
  const content = (
    <>
      {tree && def.rowHeader && (
        <span
          role={hasChildren ? "button" : undefined}
          className={classes.toggle}
          aria-expanded={hasChildren ? expanded : undefined}
          aria-label={hasChildren ? (expanded ? collapseLabel : expandLabel) : undefined}
          style={{ "--data-grid-depth": depth } as CSSProperties}
          onClick={hasChildren ? toggle : undefined}
        />
      )}
      {editing ? (
        <InlineEditor
          core={core}
          className={classes.editor}
          label={headerText(def)}
        />
      ) : spec.render ? (
        spec.render(ctx)
      ) : (
        <span className={classes.cellText}>{ctx.formattedValue}</span>
      )}
    </>
  );
  return (
    <div
      role={def.rowHeader ? "rowheader" : "gridcell"}
      className={classes.cell}
      aria-colindex={columnIndex + 1}
      aria-colspan={spanColumns > 1 ? spanColumns : undefined}
      aria-rowspan={spanRows > 1 ? spanRows : undefined}
      data-col-index={columnIndex}
      data-tone={spec.tone}
      data-group-start={groupStart || undefined}
      data-merged={merged || undefined}
      data-editing={editing || undefined}
      aria-selected={(body && columnSelected) || inRange || undefined}
      data-selected={columnSelected || undefined}
      tabIndex={body ? (active ? 0 : -1) : undefined}
      style={style}
    >
      {merged ? <span className={classes.mergedLabel}>{content}</span> : content}
      {resizeNode && (
        <RowResizeHandle
          core={core}
          classes={classes}
          node={resizeNode}
        />
      )}
    </div>
  );
});

const nodeProps = (core: AnyGridCore, node: RowNode<any>) => ({
  node,
  version: node.version,
  selectable: core.selection.isRowSelectable(node),
  selected: core.selection.rowState(node),
});

const treeState = (core: AnyGridCore, row: number) => {
  const model = core.rowModel;
  const { position, size } = model.positionInSet(row);
  return `${model.kindOf(row)}:${model.depthOf(row)}:${model.isExpanded(row)}:${position}/${size}`;
};

function spanState(core: AnyGridCore, rowIndex: number, renderedColumns: readonly number[]) {
  if (!core.spans.active) return "";
  const spans = core.spans.rowSpans(rowIndex, renderedColumns);
  return renderedColumns
    .map((column) => {
      const span = spans.get(column);
      if (!span || (span.rows === 1 && span.columns === 1)) return "";
      if (span.row !== rowIndex) return "-";
      const last = core.nodeAt(rowIndex + span.rows - 1).id;
      return `${span.column}:${span.columns}:${core.rowsHeight(rowIndex, span.rows)}:${last}`;
    })
    .join(",");
}

export function BodyRows({
  firstAriaRowIndex,
  ...shared
}: RowShared & { firstAriaRowIndex: number }) {
  const { core, renderedColumns } = shared;
  const active = core.activePosition();
  const selectedColumns = core.selection.selectedColumns().join(",");
  return core.renderedRows().map((rowIndex) => {
    const node = core.nodeAt(rowIndex);
    return (
      <GridRow
        key={node.id}
        {...shared}
        {...nodeProps(core, node)}
        variant="body"
        rowIndex={rowIndex}
        ariaRowIndex={firstAriaRowIndex + rowIndex}
        rowTop={core.rowTop(rowIndex)}
        rowHeight={core.rowHeight(rowIndex)}
        treeState={treeState(core, rowIndex)}
        spanState={spanState(core, rowIndex, renderedColumns)}
        activeColumn={active?.row === rowIndex ? active.column : -1}
        selectedColumns={selectedColumns}
        rangeColumns={core.selection.rangeColumnsKey(rowIndex)}
        dragging={core.dnd.isRowDragged(rowIndex)}
        editingColumn={core.editing.editingColumn(node.id)}
      />
    );
  });
}

export function PinnedBand({
  side,
  firstAriaRowIndex,
  ...shared
}: RowShared & { side: "top" | "bottom"; firstAriaRowIndex: number }) {
  const { core } = shared;
  const rows = core.pinnedLayout(side);
  const selectedColumns = core.selection.selectedColumns().join(",");
  const last = rows.at(-1);
  if (!last) return null;
  return (
    <div
      className={shared.classes.band}
      role="rowgroup"
      data-pinned={side}
      style={{
        [side]: side === "top" ? core.headerTotalHeight : 0,
        height: last.top + last.height,
      }}
    >
      {rows.map(({ node, top, height }, index) => (
        <GridRow
          key={node.id}
          {...shared}
          {...nodeProps(core, node)}
          variant="pinned"
          ariaRowIndex={firstAriaRowIndex + index}
          selectedColumns={selectedColumns}
          rowTop={top}
          rowHeight={height}
        />
      ))}
    </div>
  );
}

const STICKY_CHANNELS = [GRID_CHANNELS.sticky];

export function StickyParents({
  bandRef,
  ...shared
}: RowShared & { bandRef: RefObject<HTMLDivElement | null> }) {
  const { core } = shared;
  useChannels(core, STICKY_CHANNELS);
  const stuck = core.stickyRows;
  const selectedColumns = core.selection.selectedColumns().join(",");
  const last = stuck.at(-1);
  const stackHeight = last ? Math.max(0, last.top + core.rowHeight(last.index)) : 0;
  useLayoutEffect(() => {
    bandRef.current?.style.setProperty("--data-grid-sticky-h", `${stackHeight}px`);
  }, [bandRef, stackHeight]);
  if (stuck.length === 0) return null;
  return (
    <div
      className={shared.classes.band}
      role="presentation"
      aria-hidden="true"
      data-sticky=""
      style={{ top: core.bodyTop }}
    >
      {stuck.map(({ index, top }) => {
        const node = core.nodeAt(index);
        return (
          <GridRow
            key={node.id}
            {...shared}
            {...nodeProps(core, node)}
            variant="sticky"
            rowIndex={index}
            selectedColumns={selectedColumns}
            treeState={treeState(core, index)}
            rowTop={top}
            rowHeight={core.rowHeight(index)}
            dragging={core.dnd.isRowDragged(index)}
          />
        );
      })}
      <RowDropMarker
        core={core}
        classes={shared.classes}
        stuck
      />
    </div>
  );
}

function RowResizeHandle({
  core,
  classes,
  node,
}: {
  core: AnyGridCore;
  classes: DataGridClasses;
  node: RowNode<any>;
}) {
  const onPointerDown = useResizeDrag({
    axis: "y",
    begin: () => core.heightFor(node),
    resize: (start, delta) => (Math.round(start + delta) === start ? null : start + delta),
    preview: (height) => core.previewRowHeight(node.id, height ?? undefined),
    commit: (height) => core.setRowHeight(node.id, height),
  });
  return (
    <span
      className={classes.rowResizeHandle}
      aria-hidden="true"
      data-row-resize-handle=""
      onPointerDown={onPointerDown}
      onDoubleClick={() => core.resetRowHeight(node.id)}
    />
  );
}
