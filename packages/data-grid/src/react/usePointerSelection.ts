import { usePointerDrag } from "@construkt-kit/ui";
import { type MouseEvent, type PointerEvent, type ReactNode, useRef } from "react";

import type { GridCore } from "../core/grid";
import type { SelectMode } from "../core/selection/entities";
import type { EntitySelection } from "../core/selection/types";
import { cellAt, localPoint } from "./dom";
import type { DataGridOwnProps } from "./types";

const INTERACTIVE =
  "button, a[href], input, select, textarea, label, [role=button], [contenteditable]";

const HANDLES = "[data-resize-handle], [data-row-resize-handle], [data-drag-handle]";

const interactiveWithin = (target: EventTarget | null, boundary: Element) => {
  const element = target instanceof Element ? target.closest(INTERACTIVE) : null;
  return element !== null && boundary.contains(element) && element !== boundary;
};

interface Modifiers {
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}

const modKey = (event: Modifiers) => event.metaKey || event.ctrlKey;

const modeOf = (event: Modifiers): SelectMode => {
  if (event.shiftKey) return "range";
  return modKey(event) ? "toggle" : "replace";
};

interface PointerSelectionOptions<TRow> extends Pick<
  DataGridOwnProps<TRow>,
  "onCellClick" | "onHeaderClick"
> {
  core: GridCore<TRow, ReactNode>;
  scroller: HTMLElement | null;
}

export function usePointerSelection<TRow>({
  core,
  scroller,
  onCellClick,
  onHeaderClick,
}: PointerSelectionOptions<TRow>) {
  const beforeRename = useRef<{ id: string; selection: EntitySelection | null } | null>(null);
  const { onPointerDown: startDrag } = usePointerDrag<HTMLDivElement>({
    threshold: 4,
    onMove: ({ clientX, clientY }) => {
      if (!scroller) return;
      core.setScroll(scroller.scrollTop, scroller.scrollLeft);
      const { x, y } = localPoint(scroller, clientX, clientY);
      const cell = core.bodyCellNear(x, y);
      if (cell) core.selection.dragTo(cell);
    },
    onEnd: (_, { cancelled }) => core.selection.releaseDrag(cancelled),
    autoScroll: { element: scroller, inset: () => core.scrollInset },
  });

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const cell = cellAt(event.target);
    if (!cell || cell.fullWidth || interactiveWithin(event.target, cell.element)) return;
    core.selection.pressCell(cell, { extend: event.shiftKey, add: modKey(event) });
    const release = (up: globalThis.PointerEvent) => {
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
      core.selection.releaseDrag(up.type === "pointercancel");
    };
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    startDrag(event);
  };

  const onClick = (event: MouseEvent<HTMLDivElement>): boolean => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return false;
    const header = target.closest<HTMLElement>("[data-header-id]");
    if (header) {
      if (interactiveWithin(target, header) || target.closest(HANDLES)) return false;
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
        core.selection.select(ctx.isGroup ? "groups" : "columns", ctx.columnId, modeOf(event));
        core.selection.end();
      }
      onHeaderClick?.(ctx, event);
      return true;
    }
    const row = target.closest<HTMLElement>("[data-row-index]");
    if (row && target.closest("[data-gutter]") && !target.closest(HANDLES)) {
      const index = Number(row.dataset.rowIndex);
      core.setActiveCell(
        { row: index, column: core.activePosition()?.column ?? 0 },
        { reveal: false },
      );
      const node = core.nodeAt(index);
      if (core.selection.isRowSelectable(node)) {
        core.selection.select("rows", node.id, modeOf(event));
        core.selection.end();
      }
      return true;
    }
    const cell = cellAt(target);
    if (!cell || cell.fullWidth || interactiveWithin(target, cell.element)) return false;
    onCellClick?.(core.resolveCell(cell.row, cell.column).ctx, event);
    return cell.sticky;
  };

  const onDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(HANDLES)) return;
    const header = target.closest<HTMLElement>("[data-header-id]");
    if (header) {
      if (interactiveWithin(target, header)) return;
      const id = header.dataset.headerId ?? "";
      const before = beforeRename.current;
      if (!core.editing.startHeader(id)) return;
      if (before?.id === id) core.selection.setSelection(before.selection);
      return;
    }
    const cell = cellAt(target);
    if (cell && !interactiveWithin(target, cell.element)) core.editing.startCell(cell);
  };

  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const point = { x: event.clientX, y: event.clientY };
    const header = target.closest<HTMLElement>("[data-header-id]");
    const opened = header
      ? core.openMenu({ kind: "header", columnId: header.dataset.headerId ?? "" }, header, point)
      : (() => {
          const cell = cellAt(target);
          return cell !== null && !cell.fullWidth && core.openCellMenuAt(cell, cell.element, point);
        })();
    if (opened) event.preventDefault();
  };

  return { onPointerDown, onClick, onDoubleClick, onContextMenu };
}
