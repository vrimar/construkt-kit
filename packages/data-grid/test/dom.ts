import { cellSelector } from "../src/react/dom";

export const scrollerOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[role=grid], [role=treegrid]") as HTMLElement;

export const rowOf = (container: HTMLElement, row: number) =>
  container.querySelector<HTMLElement>(`[data-row-index="${row}"]`);

export const cellOf = (container: HTMLElement, row: number, column: number) =>
  container.querySelector<HTMLElement>(cellSelector(row, column)) as HTMLElement;

export const rowHeight = (container: HTMLElement) =>
  rowOf(container, 0)?.getBoundingClientRect().height ?? 0;
