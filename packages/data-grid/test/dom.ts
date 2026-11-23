import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { cellSelector, headerSelector } from "../src/react/dom";
import { settle } from "./frames";

export const scrollerOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[role=grid], [role=treegrid]") as HTMLElement;

export const rowOf = (container: HTMLElement, row: number) =>
  container.querySelector<HTMLElement>(`[data-row-index="${row}"]`);

export const cellOf = (container: HTMLElement, row: number, column: number) =>
  container.querySelector<HTMLElement>(cellSelector(row, column)) as HTMLElement;

export const headerOf = (container: HTMLElement, columnId: string) =>
  container.querySelector<HTMLElement>(headerSelector(columnId)) as HTMLElement;

export const rowHeight = (container: HTMLElement) =>
  rowOf(container, 0)?.getBoundingClientRect().height ?? 0;

/** Renders `ui` and waits for its grid to measure and lay out. */
export async function mountGrid(ui: ReactElement) {
  const { container } = render(ui);
  await settle();
  return { container, scroller: scrollerOf(container) };
}
