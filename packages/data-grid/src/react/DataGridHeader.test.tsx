import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";

import { DataGrid } from "./DataGrid";
import type { DataGridApi } from "./types";

test("a pinned label column's header spans every header level", () => {
  render(
    <DataGrid
      rows={[{ id: 1 }]}
      getRowId={(row) => row.id}
      columnDefs={[
        { id: "label", header: "Label", pinned: "left", rowHeader: true },
        { id: "group", header: "Group", children: [{ id: "a" }, { id: "b" }] },
      ]}
      aria-label="Crosstab"
    />,
  );

  expect(screen.getByRole("columnheader", { name: "Label" }).getAttribute("aria-rowspan")).toBe(
    "2",
  );
});

test("a column's headerStyle colours its own header cell", () => {
  render(
    <DataGrid
      rows={[{ id: 1 }]}
      getRowId={(row) => row.id}
      columnDefs={[
        {
          id: "group",
          header: "Group",
          headerStyle: { background: "navy", color: "white" },
          children: [{ id: "a", header: "A" }],
        },
      ]}
      aria-label="Coloured header"
    />,
  );

  const group = screen.getByRole("columnheader", { name: "Group" });
  expect(group.style.getPropertyValue("--data-grid-header-cell-bg")).toBe("navy");
  expect(group.style.getPropertyValue("--data-grid-header-cell-fg")).toBe("white");
  const leaf = screen.getByRole("columnheader", { name: "A" });
  expect(leaf.style.getPropertyValue("--data-grid-header-cell-bg")).toBe("");
});

test("startColumnResize focuses the column's edge, and ArrowRight widens the column", async () => {
  const user = userEvent.setup();
  const apiRef = createRef<DataGridApi>();
  const onColumnSizingChange = vi.fn();
  render(
    <DataGrid
      rows={[{ id: 1 }]}
      getRowId={(row) => row.id}
      columnDefs={[{ id: "a", width: 60 }]}
      apiRef={apiRef}
      onColumnSizingChange={onColumnSizingChange}
      aria-label="Resize"
    />,
  );

  act(() => apiRef.current?.startColumnResize("a"));
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("separator", { name: "Resize column a" })),
  );
  await user.keyboard("{ArrowRight}");

  expect(onColumnSizingChange).toHaveBeenLastCalledWith({ a: 70 });
  const separator = screen.getByRole("separator");
  const value = (name: string) => Number(separator.getAttribute(name));
  expect(value("aria-valuenow")).toBe(70);
  expect(value("aria-valuemax")).toBeGreaterThanOrEqual(70);
  expect(value("aria-valuemin")).toBeLessThanOrEqual(70);
  expect(separator.getAttribute("aria-valuetext")).toContain("70");
});
