import type { CoreHit, HitBox } from "../core/layout/hit";
import type { CellPosition } from "../core/selection/navigation";
import type { GridHit } from "./types";
import type { AnyGridCore } from "./useGridCore";

export interface CellTarget {
  element: HTMLElement;
  row: number;
  column: number;
  sticky: boolean;
  fullWidth: boolean;
}

export function cellAt(target: EventTarget | null): CellTarget | null {
  if (!(target instanceof Element)) return null;
  const element = target.closest<HTMLElement>("[data-col-index]");
  const row = element?.closest<HTMLElement>("[data-row-index], [data-sticky-index]");
  if (!element || !row) return null;
  const { rowIndex, stickyIndex } = row.dataset;
  return {
    element,
    row: Number(rowIndex ?? stickyIndex),
    column: Number(element.dataset.colIndex),
    sticky: rowIndex === undefined,
    fullWidth: element.hasAttribute("data-full-width"),
  };
}

export const cellUnder = (clientX: number, clientY: number) => {
  for (const element of document.elementsFromPoint(clientX, clientY)) {
    const cell = cellAt(element);
    if (cell && !cell.fullWidth) return cell;
  }
  return null;
};

export const cellSelector = (row: number, column: number) =>
  `[data-row-index="${row}"] [data-col-index="${column}"]`;

export const headerSelector = (columnId: string) => `[data-header-id="${CSS.escape(columnId)}"]`;

export const resizeHandleSelector = (columnId: string) =>
  `[data-resize-handle="${CSS.escape(columnId)}"]`;

export const cellElement = (
  root: ParentNode | null,
  { row, column }: CellPosition,
): HTMLElement | null =>
  root?.querySelector<HTMLElement>(cellSelector(row, column)) ??
  root?.querySelector<HTMLElement>(`[data-row-index="${row}"] [data-full-width]`) ??
  null;

const CONTROL =
  "button, a[href], input, select, textarea, label, [role=button], [contenteditable], [tabindex]";

export function controlAt(target: EventTarget | null, boundary: Element): Element | null {
  const control = target instanceof Element ? target.closest(CONTROL) : null;
  return control &&
    control !== boundary &&
    boundary.contains(control) &&
    !control.hasAttribute("data-col-index")
    ? control
    : null;
}

/** Whether something drawn above the grid, such as a popover, takes the pointer inside `scroller`'s box. */
export const coveredAt = (scroller: HTMLElement, clientX: number, clientY: number) => {
  const box = scroller.getBoundingClientRect();
  if (clientX < box.left || clientX >= box.right || clientY < box.top || clientY >= box.bottom) {
    return false;
  }
  const top = document.elementFromPoint(clientX, clientY);
  return top !== null && !scroller.contains(top);
};

export const localPoint = (scroller: HTMLElement, clientX: number, clientY: number) => {
  const rect = scroller.getBoundingClientRect();
  return {
    x: clientX - rect.left - scroller.clientLeft,
    y: clientY - rect.top - scroller.clientTop,
  };
};

export function gridPoint(
  core: AnyGridCore,
  scroller: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  core.setScroll(scroller.scrollTop, scroller.scrollLeft);
  return localPoint(scroller, clientX, clientY);
}

export function clientRect(scroller: HTMLElement, box: HitBox): DOMRect {
  const origin = scroller.getBoundingClientRect();
  return new DOMRect(
    origin.left + scroller.clientLeft + box.left,
    origin.top + scroller.clientTop + box.top,
    box.width,
    box.height,
  );
}

export function gridHit(scroller: HTMLElement, hit: CoreHit): GridHit {
  const { region, rowId, columnId, headerId, fractionX, fractionY, box } = hit;
  return {
    region,
    rowId,
    columnId,
    headerId,
    fractionX,
    fractionY,
    rect: clientRect(scroller, box),
  };
}

export function hitAt(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  clientX: number,
  clientY: number,
): GridHit | null {
  if (!scroller) return null;
  const { x, y } = gridPoint(core, scroller, clientX, clientY);
  const hit = core.hitTest(x, y);
  return hit && gridHit(scroller, hit);
}

export function naturalWidths(cells: readonly HTMLElement[]): number[] {
  const widths = cells.map((cell) => cell.style.width);
  for (const cell of cells) cell.style.width = "max-content";
  const natural = cells.map((cell) => Math.ceil(cell.getBoundingClientRect().width));
  cells.forEach((cell, index) => {
    cell.style.width = widths[index];
  });
  return natural;
}
