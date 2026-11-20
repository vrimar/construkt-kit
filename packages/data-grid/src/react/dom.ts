import type { HitBox } from "../core/layout/hit";

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

export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [contenteditable=""], [contenteditable="true"], [tabindex]';

export const tabStopsIn = (element: HTMLElement): HTMLElement[] =>
  Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (candidate) => candidate.tabIndex >= 0,
  );

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

export function clientRect(scroller: HTMLElement, box: HitBox): DOMRect {
  const origin = scroller.getBoundingClientRect();
  return new DOMRect(
    origin.left + scroller.clientLeft + box.left,
    origin.top + scroller.clientTop + box.top,
    box.width,
    box.height,
  );
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
