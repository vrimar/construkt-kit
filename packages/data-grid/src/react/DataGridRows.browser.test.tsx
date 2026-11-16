import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, test } from "vitest";

import { rowHeight, scrollerOf } from "../../test/dom";
import { createFixture } from "../../test/fixture";
import { settle } from "../../test/frames";
import { DataGrid } from "./DataGrid";
import type { DataGridApi } from "./types";

interface Item {
  id: string;
  parent?: string;
  label: string;
}

const PARENTS = 10;
const CHILDREN = 20;
const items: Item[] = Array.from({ length: PARENTS }, (_, p) => [
  { id: `P${p}`, label: `P${p}` },
  ...Array.from({ length: CHILDREN }, (_child, c) => ({
    id: `P${p}-${c}`,
    parent: `P${p}`,
    label: `P${p} · ${c}`,
  })),
]).flat();

test("collapsing a parent above the viewport keeps the first visible row in place", async () => {
  const apiRef = createRef<DataGridApi>();
  const { container } = render(
    <DataGrid
      rows={items}
      getRowId={(row) => row.id}
      getParentId={(row) => row.parent}
      defaultExpandedRowIds={items.filter((row) => !row.parent).map((row) => row.id)}
      columnDefs={[{ id: "label", field: "label", rowHeader: true, width: 200 }, { id: "other" }]}
      apiRef={apiRef}
      aria-label="Tree"
      style={{ width: 600, height: 400 }}
    />,
  );
  await settle();
  const scroller = scrollerOf(container);
  scroller.scrollTop = (5 * (CHILDREN + 1) + 1 + 10) * rowHeight(container) - 100;
  await settle();
  const tracked = () =>
    screen
      .getAllByText("P5 · 10")
      .find((element) => element.closest("[data-row-index]"))
      ?.getBoundingClientRect().top;
  const before = tracked();

  act(() => apiRef.current?.setRowExpanded("P0", false));
  await settle();

  expect(before).toBeDefined();
  expect(tracked()).toBeCloseTo(before ?? Number.NaN, 0);
});

test("full-width row content stays in view after scrolling sideways", async () => {
  const { container } = render(
    <DataGrid
      {...createFixture(10, 30)}
      isFullWidthRow={(row) => row.id === 2}
      renderFullWidthRow={() => <span>Section heading</span>}
      aria-label="Sections"
      style={{ width: 600, height: 400 }}
    />,
  );
  await settle();
  const scroller = scrollerOf(container);

  scroller.scrollLeft = 1200;
  await settle();

  const content = screen.getByText("Section heading").getBoundingClientRect();
  const viewport = scroller.getBoundingClientRect();
  expect(content.left).toBeGreaterThanOrEqual(viewport.left);
  expect(content.right).toBeLessThanOrEqual(viewport.right);
});

test("a merged cell keeps its label in view after its start scrolls out of sight", async () => {
  const fixture = createFixture(200, 6, { width: 300 });
  const { container } = render(
    <DataGrid
      {...fixture}
      columnDefs={[
        { id: "label", pinned: "left", width: 150 },
        {
          id: "block",
          width: 300,
          getValue: (row) => (row.id === 0 ? "Merged block" : ""),
          rowSpan: (row) => (row.id === 0 ? 60 : 1),
          colSpan: (row) => (row.id === 0 ? 4 : 1),
        },
        ...fixture.columnDefs,
      ]}
      aria-label="Merged"
      style={{ width: 600, height: 400 }}
    />,
  );
  await settle();
  const scroller = scrollerOf(container);

  scroller.scrollLeft = 500;
  scroller.scrollTop = 40 * rowHeight(container);
  await settle();

  const label = screen.getByText("Merged block").getBoundingClientRect();
  const pinned = container
    .querySelector("[data-row-index] [data-pinned=left]")
    ?.getBoundingClientRect();
  const header = screen.getByRole("columnheader", { name: "label" }).getBoundingClientRect();
  expect(label.left).toBeGreaterThanOrEqual(pinned?.right ?? Number.POSITIVE_INFINITY);
  expect(label.top).toBeGreaterThanOrEqual(header.bottom);
  expect(label.bottom).toBeLessThanOrEqual(scroller.getBoundingClientRect().bottom);
});
