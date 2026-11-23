import type { Locator, Page } from "@playwright/test";

import type { DropPosition } from "../core/dnd/types";

/** On every header cell, column and group alike: its column id. */
export const HEADER_ID = "data-header-id";
/** On every body row: its index in display order, from 0. Pinned rows and sticky copies don't carry it. */
export const ROW_INDEX = "data-row-index";
/** On every cell: its column's index in display order, from 0, the checkbox column included. */
export const COLUMN_INDEX = "data-col-index";
/** On every row and column grip, the element a pointer drag starts from. */
export const DRAG_HANDLE = "data-drag-handle";
/** On the grid while a drag across the axes is over a place `canDropAcross` refuses. */
export const DROP_REFUSED = "data-drop-refused";

const AXIS = "data-axis";
const POSITION = "data-position";

/** Which way a drag reorders: rows, or columns and column groups. */
export type GridAxis = "rows" | "columns";

/** Where the grid's drop indicator says a drop would land. */
export type DropPlacement =
  | {
      axis: "rows";
      position: DropPosition;
      /** The row the box covers (`onto`), or whose top (`before`) or bottom (`after`) edge the line runs along. */
      row: number;
    }
  | { axis: "columns"; position: DropPosition; columnId: string };

const quoted = (value: string) => JSON.stringify(value);

/**
 * The grid named `name`, a `grid` or, once it has tree rows, a `treegrid`. A string name matches
 * exactly. Every other helper takes this, or any element the grid sits in.
 */
export function gridByName(scope: Page | Locator, name: string | RegExp): Locator {
  const options = { name, exact: true };
  return scope.getByRole("grid", options).or(scope.getByRole("treegrid", options));
}

/** The header cell of the column or column group `columnId`. */
export function gridHeader(grid: Locator, columnId: string): Locator {
  return grid.locator(`[${HEADER_ID}=${quoted(columnId)}]`);
}

/** The body row at `index` in display order, from 0. Only rendered rows exist; scroll a far row in first. */
export function gridRow(grid: Locator, index: number): Locator {
  return grid.locator(`[${ROW_INDEX}="${index}"]`);
}

/** The cell of body row `row` in column `column`, both display indexes from 0; `column` counts the checkbox column. */
export function gridCell(grid: Locator, row: number, column: number): Locator {
  return gridRow(grid, row).locator(`[${COLUMN_INDEX}="${column}"]`);
}

/** The row header of body row `index`: its cell in the `rowHeader` column, which holds the row's label. */
export function gridRowHeader(grid: Locator, index: number): Locator {
  return gridRow(grid, index).getByRole("rowheader");
}

/**
 * The grip inside `target`, a header from `gridHeader` or a row from `gridRow`, to start a pointer
 * drag from. It exists only while the grid takes drops on that axis and the item may move.
 */
export function gridGrip(target: Locator): Locator {
  return target.locator(`[${DRAG_HANDLE}]`);
}

/** The header cells in the grid's selection: the columns, or the column groups, it holds. */
export function selectedHeaders(grid: Locator): Locator {
  return grid.getByRole("columnheader", { selected: true });
}

/** The body rows in the grid's selection. A partly selected tree parent is not one of them. */
export function selectedRows(grid: Locator): Locator {
  return grid.getByRole("row", { selected: true });
}

/** The cells the grid marks selected, row headers included: those in a selected column or a cell range. */
export function selectedCells(grid: Locator): Locator {
  return grid
    .getByRole("gridcell", { selected: true })
    .or(grid.getByRole("rowheader", { selected: true }));
}

/**
 * The drop indicator the grid shows during a grip drag, or while its `indicator` prop is set: a
 * line in the gap before or after a target, or a box onto it. `axis` and `position` keep one kind.
 */
export function dropIndicator(
  grid: Locator,
  { axis, position }: { axis?: GridAxis; position?: DropPosition } = {},
): Locator {
  const axisMatch = axis ? `[${AXIS}="${axis}"]` : `[${AXIS}]`;
  const positionMatch = position ? `[${POSITION}="${position}"]` : `[${POSITION}]`;
  return grid.locator(axisMatch + positionMatch);
}

/**
 * Where the drop indicator says a drop would land, read from which row or header it lines up
 * with, or null while there is none. Poll it, as the indicator follows the pointer a frame late.
 */
export async function dropPlacement(grid: Locator): Promise<DropPlacement | null> {
  return grid.evaluate(
    (root, attributes) => {
      const marker = root.querySelector(`[${attributes.axis}][${attributes.position}]`);
      if (!marker) return null;
      const position = marker.getAttribute(attributes.position) as DropPosition;
      const box = marker.getBoundingClientRect();
      const near = (a: number, b: number) => Math.abs(a - b) < 1.5;
      const candidates = (attribute: string) =>
        Array.from(root.querySelectorAll(`[${attribute}]`), (element) => ({
          value: element.getAttribute(attribute) ?? "",
          rect: element.getBoundingClientRect(),
        }));

      if (marker.getAttribute(attributes.axis) === "rows") {
        const y = position === "onto" ? box.top : box.top + box.height / 2;
        const row = candidates(attributes.row).find(({ rect }) =>
          near(position === "after" ? rect.bottom : rect.top, y),
        );
        return row ? { axis: "rows" as const, position, row: Number(row.value) } : null;
      }

      const x = box.left + box.width / 2;
      const header = candidates(attributes.header).find(
        ({ rect }) =>
          near(rect.top, box.top) &&
          (position === "onto"
            ? near(rect.left, box.left) && near(rect.right, box.right)
            : near(position === "before" ? rect.left : rect.right, x)),
      );
      return header ? { axis: "columns" as const, position, columnId: header.value } : null;
    },
    { axis: AXIS, position: POSITION, row: ROW_INDEX, header: HEADER_ID },
  );
}

/** The boxes the grid draws from its `outlines` prop, such as around the row a drag across would land on. */
export function gridOutlines(grid: Locator, axis?: GridAxis): Locator {
  return grid.locator(`${axis ? `[${AXIS}="${axis}"]` : `[${AXIS}]`}:not([${POSITION}])`);
}
