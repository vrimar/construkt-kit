import type { ColumnModel, Region } from "../core/columns/columnModel";
import type { DataGridClasses } from "./recipe";
import type { AnyGridCore } from "./useGridCore";

export const REGIONS: readonly Region[] = ["left", "center", "right"];

export const regionProps = (classes: DataGridClasses, region: Region) => ({
  role: "presentation",
  className: classes.region,
  "data-pinned": region === "center" ? undefined : region,
});

const columnX = (index: number) => `var(--data-grid-c${index}-x)`;
const columnW = (index: number) => `var(--data-grid-c${index}-w)`;

export const columnEdgeX = (index: number, edge: "start" | "end") =>
  edge === "start" ? columnX(index) : `calc(${columnX(index)} + ${columnW(index)})`;

export const columnGeometry = (index: number) => ({ left: columnX(index), width: columnW(index) });

export const spanGeometry = (first: number, last: number) => ({
  left: columnX(first),
  width: `calc(${columnX(last)} + ${columnW(last)} - ${columnX(first)})`,
});

export function geometryVars<TRow, TNode>(columns: ColumnModel<TRow, TNode>, gutter: number) {
  const vars: Record<string, string> = {
    "--data-grid-gutter-w": `${gutter}px`,
    "--data-grid-left-w": `${columns.widths.left}px`,
    "--data-grid-center-w": `${columns.widths.center}px`,
    "--data-grid-right-w": `${columns.widths.right}px`,
    "--data-grid-canvas-w": `${columns.canvasWidth}px`,
  };
  for (const leaf of columns.leaves) {
    vars[`--data-grid-c${leaf.index}-x`] = `${leaf.x}px`;
    vars[`--data-grid-c${leaf.index}-w`] = `${leaf.width}px`;
  }
  return vars;
}

export function ariaRows(core: AnyGridCore) {
  const top = core.columns.headerRows.length + 1;
  const body = top + core.pinnedTop.nodes.length;
  // An empty grid's message row takes one index.
  const bottom = body + Math.max(1, core.rowCount);
  return { top, body, bottom, count: bottom - 1 + core.pinnedBottom.nodes.length };
}
