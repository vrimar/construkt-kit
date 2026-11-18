import { usePointerDrag } from "@construkt-kit/ui";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  memo,
  useId,
  useRef,
  useState,
} from "react";

import type { HeaderCell, Region } from "../core/columns/columnModel";
import type { ColumnDef, HeaderContext } from "../core/columns/types";
import { REGIONS, columnGeometry, regionProps, spanGeometry } from "./geometry";
import { InlineEditor } from "./InlineEditor";
import type { DataGridClasses } from "./recipe";
import type { AnyGridCore } from "./useGridCore";

interface HeaderShared {
  core: AnyGridCore;
  classes: DataGridClasses;
  onAutosize: (columnId: string) => void;
  resizeLabel: string;
  renameLabel: string;
  widthText: (width: number) => string;
  onResizeExit: () => void;
}

interface HeaderCellViewProps extends HeaderShared {
  id: string;
  def: ColumnDef<any, ReactNode>;
  ctx: HeaderContext<any, ReactNode> | null;
  isGroup: boolean;
  first: number;
  last: number;
  rowSpan: number;
  region: Region;
  groupStart: boolean;
  resizable: boolean;
  resizeWidth: number;
  resizeMin: number;
  resizeMax: number;
  boxHeight: number;
  selected: boolean;
  selectionTop: boolean;
  ariaSelected: boolean | undefined;
  dragging: boolean;
  renaming: boolean;
}

interface GridHeaderProps extends HeaderShared {
  renderedColumns: readonly number[];
  gutter: boolean;
}

const KEY_STEP = 10;
const KEY_STEP_LARGE = 50;

export function GridHeader({ renderedColumns, gutter, ...cellProps }: GridHeaderProps) {
  const { core, classes } = cellProps;
  const levels = core.headerLevels;
  const lettersHeight = core.lettersHeight;
  const total = core.headerTotalHeight;
  const { leaves, headerRows } = core.columns;
  const rendered = new Set(renderedColumns);

  const corner = gutter && (
    <div
      className={classes.gutter}
      aria-hidden="true"
      style={{ height: total, bottom: "auto" }}
    />
  );

  return (
    <div
      className={classes.header}
      role="rowgroup"
      style={{ height: total }}
    >
      {lettersHeight > 0 && (
        <div
          className={classes.row}
          aria-hidden="true"
          style={{ top: 0, height: lettersHeight }}
        >
          {REGIONS.map((region) => (
            <div
              key={region}
              {...regionProps(classes, region)}
            >
              {region === "left" && corner}
              {renderedColumns
                .filter((index) => leaves[index]?.region === region)
                .map((index) => (
                  <div
                    key={leaves[index].id}
                    className={classes.headerCell}
                    data-selected={core.selection.isColumnSelected(index) || undefined}
                    data-selection-top={core.selection.isColumnSelected(index) || undefined}
                    style={columnGeometry(index)}
                  >
                    <span className={classes.cellText}>{leaves[index].letter}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
      {headerRows.map((cells, level) => (
        <div
          key={level}
          role="row"
          className={classes.row}
          aria-rowindex={level + 1}
          style={{ top: levels[level].top, height: levels[level].height }}
        >
          {REGIONS.map((region) => (
            <div
              key={region}
              {...regionProps(classes, region)}
            >
              {region === "left" && level === 0 && lettersHeight === 0 && corner}
              {cells
                .filter((cell) => cell.region === region && spansRendered(cell, rendered))
                .map((cell) => (
                  <HeaderCellView
                    key={cell.id}
                    {...cellProps}
                    {...headerCellState(core, cell)}
                  />
                ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const spansRendered = (cell: HeaderCell<unknown, unknown>, rendered: ReadonlySet<number>) => {
  for (let index = cell.first; index <= cell.last; index++) if (rendered.has(index)) return true;
  return false;
};

function headerCellState(core: AnyGridCore, cell: HeaderCell<any, ReactNode>) {
  const { columns, selection } = core;
  const leaves = columns.visibleLeavesUnder(cell.id);
  const parentId = columns.parentIdOf(cell.id);
  const parent = parentId === undefined ? undefined : columns.headerCell(parentId);
  const selected = selection.isSpanSelected(cell.first, cell.last);
  return {
    id: cell.id,
    def: cell.def,
    ctx: core.headerContext(cell.id),
    isGroup: cell.isGroup,
    first: cell.first,
    last: cell.last,
    rowSpan: cell.rowSpan,
    region: cell.region,
    groupStart: cell.groupStart,
    resizable: cell.resizable,
    resizeWidth: leaves.reduce((sum, leaf) => sum + leaf.width, 0),
    resizeMin: leaves.reduce((sum, leaf) => sum + leaf.minWidth, 0),
    resizeMax: leaves.reduce((sum, leaf) => sum + leaf.maxWidth, 0),
    boxHeight: core.headerBox(cell).height,
    selected,
    selectionTop:
      selected &&
      core.lettersHeight === 0 &&
      !(parent && selection.isSpanSelected(parent.first, parent.last)),
    ariaSelected: selection.isHeaderSelectable(cell.def)
      ? selection.isHeaderSelected(cell.id, cell.isGroup)
      : undefined,
    dragging: core.dnd.isDragged("columns", cell.id),
    renaming: core.editing.isRenaming(cell.id),
  };
}

const HeaderCellView = memo(function HeaderCellView({
  core,
  classes,
  id,
  def,
  ctx,
  isGroup,
  first,
  last,
  rowSpan,
  region,
  groupStart,
  resizable,
  resizeWidth,
  resizeMin,
  resizeMax,
  boxHeight,
  selected,
  selectionTop,
  ariaSelected,
  dragging,
  renaming,
  onAutosize,
  resizeLabel,
  renameLabel,
  widthText,
  onResizeExit,
}: HeaderCellViewProps) {
  const headerId = useId();
  const resizeLabelId = useId();
  const start = useRef(core.columns);
  const [keyboardResizing, setKeyboardResizing] = useState(false);

  const { onPointerDown } = usePointerDrag<HTMLSpanElement>({
    claimPress: true,
    activeAttribute: "data-resizing",
    onPress: () => {
      start.current = core.columns;
    },
    onMove: ({ deltaX }) => {
      core.previewColumnWidths(start.current.resizedWidths(id, deltaX));
    },
    onEnd: ({ deltaX }, { cancelled }) => {
      if (cancelled) core.previewColumnWidths(null);
      else core.setColumnWidths(start.current.resizedWidths(id, deltaX));
    },
  });

  const onResizeKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      core.setColumnWidths(
        core.columns.resizedWidths(id, event.key === "ArrowRight" ? step : -step),
      );
    } else if (event.key === "Enter" || event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      onResizeExit();
    }
  };

  const content = renaming ? (
    <InlineEditor
      core={core}
      className={classes.editor}
      label={renameLabel}
    />
  ) : typeof def.header === "function" ? (
    ctx && def.header(ctx)
  ) : (
    <span className={classes.cellText}>{def.header ?? def.id}</span>
  );

  return (
    <div
      id={headerId}
      role="columnheader"
      className={classes.headerCell}
      aria-colindex={first + 1}
      aria-colspan={isGroup ? last - first + 1 : undefined}
      aria-rowspan={rowSpan > 1 ? rowSpan : undefined}
      aria-selected={ariaSelected}
      data-header-id={id}
      data-selected={selected || undefined}
      data-selection-top={selectionTop || undefined}
      data-reveal-group=""
      data-dragging={dragging || undefined}
      data-editing={renaming || undefined}
      data-sticky-label={(isGroup && region === "center") || undefined}
      data-group-start={groupStart || undefined}
      style={
        {
          ...spanGeometry(first, last),
          height: boxHeight,
          "--data-grid-header-cell-bg": def.headerStyle?.background,
          "--data-grid-header-cell-fg": def.headerStyle?.color,
        } as CSSProperties
      }
    >
      {content}
      {resizable && (
        <span
          className={classes.resizeHandle}
          role="separator"
          aria-hidden={!keyboardResizing || undefined}
          aria-orientation="vertical"
          aria-labelledby={keyboardResizing ? `${resizeLabelId} ${headerId}` : undefined}
          aria-valuenow={resizeWidth}
          aria-valuetext={widthText(resizeWidth)}
          aria-valuemin={resizeMin}
          aria-valuemax={Number.isFinite(resizeMax) ? resizeMax : Number.MAX_SAFE_INTEGER}
          tabIndex={-1}
          onFocus={() => setKeyboardResizing(true)}
          onBlur={() => setKeyboardResizing(false)}
          data-resize-handle={id}
          onPointerDown={onPointerDown}
          onDoubleClick={() => onAutosize(id)}
          onKeyDown={onResizeKeyDown}
        >
          {keyboardResizing && (
            <span
              id={resizeLabelId}
              hidden
            >
              {resizeLabel}
            </span>
          )}
        </span>
      )}
    </div>
  );
});
