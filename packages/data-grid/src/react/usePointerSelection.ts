import { usePointerDrag } from "@construkt-kit/ui";
import { type MouseEvent, type ReactNode, useRef } from "react";

import type { GridCore } from "../core/grid";
import type { SelectMode } from "../core/selection/entities";
import type { CellPosition } from "../core/selection/navigation";
import type { EntitySelection } from "../core/selection/types";
import { cellAt, controlAt, gridPoint } from "./dom";
import type { DataGridOwnProps } from "./types";

const HANDLES = "[data-resize-handle], [data-row-resize-handle], [data-drag-handle]";

interface Modifiers {
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}

const modKey = (event: Modifiers) => event.metaKey || event.ctrlKey;

const modeOf = (event: Modifiers, adds: boolean): SelectMode => {
  if (event.shiftKey) return "range";
  return adds || modKey(event) ? "toggle" : "replace";
};

interface PointerSelectionOptions<TRow> extends Pick<
  DataGridOwnProps<TRow>,
  "onCellClick" | "onHeaderClick" | "pointerSelection"
> {
  core: GridCore<TRow, ReactNode>;
  scroller: HTMLElement | null;
}

export function usePointerSelection<TRow>({
  core,
  scroller,
  onCellClick,
  onHeaderClick,
  pointerSelection,
}: PointerSelectionOptions<TRow>) {
  const adds = pointerSelection === "add";
  const beforeRename = useRef<{ id: string; selection: EntitySelection | null } | null>(null);

  const selectsRowAt = ({ row, column }: CellPosition) =>
    core.columns.leaves[column]?.def.selectsRow === true &&
    core.selection.isRowSelectable(core.nodeAt(row));

  const { onPointerDown } = usePointerDrag<HTMLDivElement>({
    threshold: 4,
    onPress: (event) => {
      if (event.pointerType !== "mouse") return false;
      const cell = cellAt(event.target);
      if (!cell || cell.fullWidth || controlAt(event.target, cell.element)) return false;
      if (selectsRowAt(cell)) return false;
      core.selection.pressCell(cell, { extend: event.shiftKey, add: modKey(event) });
    },
    onMove: ({ clientX, clientY }) => {
      if (!scroller) return;
      const { x, y } = gridPoint(core, scroller, clientX, clientY);
      const cell = core.bodyCellNear(x, y);
      if (cell) core.selection.dragTo(cell);
    },
    // Escape ends the drag while the button is still down; reverting must not wait for the release.
    onEnd: (_, { cancelled }) => core.selection.releaseDrag(cancelled),
    onRelease: (_, { cancelled }) => core.selection.releaseDrag(cancelled),
    autoScroll: { element: scroller, inset: () => core.scrollInset },
  });

  const selectRow = (row: number, column: number, event: Modifiers) => {
    core.setActiveCell({ row, column }, { reveal: false });
    const node = core.nodeAt(row);
    if (core.selection.isRowSelectable(node)) {
      core.selection.select("rows", node.id, modeOf(event, adds));
    }
  };

  const onClick = (event: MouseEvent<HTMLDivElement>): boolean => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return false;
    const header = target.closest<HTMLElement>("[data-header-id]");
    if (header) {
      if (controlAt(target, header) || target.closest(HANDLES)) return false;
      const ctx = core.headerContext(header.dataset.headerId ?? "");
      const first = core.columns.headerCell(ctx?.columnId ?? "")?.first;
      if (!ctx || first === undefined) return false;
      core.setActiveCell(
        { row: core.activePosition()?.row ?? 0, column: first },
        { reveal: false },
      );
      const renameClick = ctx.def.headerEditable === true && event.detail > 1;
      if (core.selection.isHeaderSelectable(ctx.def) && !renameClick) {
        if (ctx.def.headerEditable) {
          beforeRename.current = { id: ctx.columnId, selection: core.selection.selection };
        }
        core.selection.select(
          ctx.isGroup ? "groups" : "columns",
          ctx.columnId,
          modeOf(event, adds),
        );
      }
      onHeaderClick?.(ctx, event);
      return true;
    }
    const row = target.closest<HTMLElement>("[data-row-index]");
    if (row && target.closest("[data-gutter]") && !target.closest(HANDLES)) {
      selectRow(Number(row.dataset.rowIndex), core.activePosition()?.column ?? 0, event);
      return true;
    }
    const cell = cellAt(target);
    if (!cell || cell.fullWidth || controlAt(target, cell.element)) return false;
    const selectsRow = selectsRowAt(cell);
    if (selectsRow) selectRow(cell.row, cell.column, event);
    onCellClick?.(core.resolveCell(cell.row, cell.column).ctx, event);
    return selectsRow || cell.sticky;
  };

  const onDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(HANDLES)) return;
    const header = target.closest<HTMLElement>("[data-header-id]");
    if (header) {
      if (controlAt(target, header)) return;
      const id = header.dataset.headerId ?? "";
      const before = beforeRename.current;
      if (!core.editing.startHeader(id)) return;
      if (before?.id === id) core.selection.setSelection(before.selection);
      return;
    }
    const cell = cellAt(target);
    if (cell && !controlAt(target, cell.element)) core.editing.startCell(cell);
  };

  const selectHeaderForMenu = (columnId: string) => {
    const ctx = core.headerContext(columnId);
    if (!ctx || !core.selection.isHeaderSelectable(ctx.def)) return;
    if (core.selection.isHeaderSelected(columnId, ctx.isGroup)) return;
    core.selection.select(ctx.isGroup ? "groups" : "columns", columnId, "replace");
  };

  const selectRowForMenu = (cell: CellPosition) => {
    if (!selectsRowAt(cell)) return;
    const { id } = core.nodeAt(cell.row);
    const { selection } = core.selection;
    if (selection?.kind === "rows" && selection.ids.includes(id)) return;
    core.selection.select("rows", id, "replace");
  };

  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const point = { x: event.clientX, y: event.clientY };
    const header = target.closest<HTMLElement>("[data-header-id]");
    if (header) {
      const columnId = header.dataset.headerId ?? "";
      if (!core.openMenu({ kind: "header", columnId }, header, point)) return;
      event.preventDefault();
      selectHeaderForMenu(columnId);
      return;
    }
    const cell = cellAt(target);
    if (!cell || cell.fullWidth || !core.openCellMenuAt(cell, cell.element, point)) return;
    event.preventDefault();
    selectRowForMenu(cell);
  };

  return { onPointerDown, onClick, onDoubleClick, onContextMenu };
}
