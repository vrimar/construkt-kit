import { usePointerDrag } from "@construkt-kit/ui";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";

import type { HeaderCell } from "../core/columns/columnModel";
import { REGIONS, columnGeometry, regionProps, spanGeometry } from "./geometry";
import { InlineEditor } from "./InlineEditor";
import type { DataGridClasses } from "./recipe";
import type { AnyGridCore } from "./useGridCore";

interface HeaderCellViewProps {
  core: AnyGridCore;
  classes: DataGridClasses;
  cell: HeaderCell<any, ReactNode>;
  onAutosize: (columnId: string) => void;
  resizeLabel: string;
  renameLabel: string;
  widthText: (width: number) => string;
  onResizeExit: () => void;
}

interface GridHeaderProps extends Omit<HeaderCellViewProps, "cell"> {
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
                    cell={cell}
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

function HeaderCellView({
  core,
  classes,
  cell,
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
      core.previewColumnWidths(start.current.resizedWidths(cell.id, deltaX));
    },
    onEnd: ({ deltaX }, { cancelled }) => {
      if (cancelled) core.previewColumnWidths(null);
      else core.setColumnWidths(start.current.resizedWidths(cell.id, deltaX));
    },
  });

  const onResizeKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      core.setColumnWidths(
        core.columns.resizedWidths(cell.id, event.key === "ArrowRight" ? step : -step),
      );
    } else if (event.key === "Enter" || event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      onResizeExit();
    }
  };
  const leaves = core.columns.visibleLeavesUnder(cell.id);
  const width = leaves.reduce((sum, leaf) => sum + leaf.width, 0);
  const minWidth = leaves.reduce((sum, leaf) => sum + leaf.minWidth, 0);
  const maxWidth = leaves.reduce((sum, leaf) => sum + leaf.maxWidth, 0);

  const { def } = cell;
  const ctx = core.headerContext(cell.id);
  const renaming = core.editing.isRenaming(cell.id);
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
      aria-colindex={cell.first + 1}
      aria-colspan={cell.isGroup ? cell.last - cell.first + 1 : undefined}
      aria-rowspan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
      aria-selected={
        core.selection.isHeaderSelectable(def)
          ? core.selection.isHeaderSelected(cell.id, cell.isGroup)
          : undefined
      }
      data-header-id={cell.id}
      data-reveal-group=""
      data-dragging={core.dnd.isDragged("columns", cell.id) || undefined}
      data-editing={renaming || undefined}
      data-sticky-label={(cell.isGroup && cell.region === "center") || undefined}
      data-group-start={cell.groupStart || undefined}
      style={
        {
          ...spanGeometry(cell.first, cell.last),
          height: core.headerBox(cell).height,
          "--data-grid-header-cell-bg": def.headerStyle?.background,
          "--data-grid-header-cell-fg": def.headerStyle?.color,
        } as CSSProperties
      }
    >
      {content}
      {cell.resizable && (
        <span
          className={classes.resizeHandle}
          role="separator"
          aria-hidden={!keyboardResizing || undefined}
          aria-orientation="vertical"
          aria-labelledby={keyboardResizing ? `${resizeLabelId} ${headerId}` : undefined}
          aria-valuenow={width}
          aria-valuetext={widthText(width)}
          aria-valuemin={minWidth}
          aria-valuemax={Number.isFinite(maxWidth) ? maxWidth : Number.MAX_SAFE_INTEGER}
          tabIndex={-1}
          onFocus={() => setKeyboardResizing(true)}
          onBlur={() => setKeyboardResizing(false)}
          data-resize-handle={cell.id}
          onPointerDown={onPointerDown}
          onDoubleClick={() => onAutosize(cell.id)}
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
}
