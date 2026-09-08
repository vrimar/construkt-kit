import { createColumnHelper } from "@tanstack/react-table";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTable } from ".";
import type { DataTableParams, dataTableFeatures } from "./types";

interface Person {
  id: number;
  name: string;
  role: string;
}

const columnHelper = createColumnHelper<typeof dataTableFeatures, Person>();

const columns = [
  columnHelper.accessor("name", { header: "Name", enableSorting: true }),
  columnHelper.accessor("role", { header: "Role", meta: { type: "select" } }),
];

const data: Person[] = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "User" },
];

const params: DataTableParams = {
  orderBy: "",
  orderType: "",
  page: 1,
  pageSize: 10,
  filters: {},
};

const renderTable = (overrides: Partial<Parameters<typeof DataTable<Person>>[0]> = {}) => {
  const onParamChange = vi.fn();
  render(
    <DataTable
      data={data}
      totalItems={25}
      columns={columns}
      params={params}
      onParamChange={onParamChange}
      {...overrides}
    />,
  );
  return { onParamChange };
};

// The ScrollArea viewport is itself focusable, so a row tab stop is the nearer one.
const focusableRow = (text: string) =>
  screen.getByText(text).closest<HTMLElement>('[tabindex]:not([data-scope="scroll-area"])');

const rows = () => Array.from(document.querySelectorAll<HTMLElement>(".data-table__row"));

const columnTemplate = () =>
  screen.getByRole("table").style.getPropertyValue("--data-table-columns");

afterEach(cleanup);

describe("DataTable", () => {
  it("renders a header and a cell per column for every row", () => {
    renderTable();

    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("cycles a sortable column through asc, desc and cleared", async () => {
    const StatefulTable = () => {
      const [current, setCurrent] = useState(params);
      return (
        <DataTable
          data={data}
          totalItems={25}
          columns={columns}
          params={current}
          onParamChange={setCurrent}
        />
      );
    };
    render(<StatefulTable />);

    const sorter = () => document.querySelector(".data-table__column-sorter") as Element;
    const nameHeader = () => screen.getByRole("columnheader", { name: "Name" });

    expect(nameHeader().getAttribute("aria-sort")).toBe("none");

    await userEvent.click(sorter());
    expect(sorter().getAttribute("data-sorted")).toBe("asc");
    expect(nameHeader().getAttribute("aria-sort")).toBe("ascending");

    await userEvent.click(sorter());
    expect(sorter().getAttribute("data-sorted")).toBe("desc");
    expect(nameHeader().getAttribute("aria-sort")).toBe("descending");

    await userEvent.click(sorter());
    expect(sorter().getAttribute("data-sorted")).toBeNull();
    expect(nameHeader().getAttribute("aria-sort")).toBe("none");
  });

  it("exposes table semantics", () => {
    const semantic = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("role", { header: "Role", enableSorting: false }),
    ];
    renderTable({ columns: semantic });

    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getAllByRole("rowgroup")).toHaveLength(2);
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getAllByRole("columnheader").map((el) => el.textContent)).toEqual([
      "Name",
      "Role",
    ]);
    expect(screen.getByRole("columnheader", { name: "Role" }).hasAttribute("aria-sort")).toBe(
      false,
    );
  });

  it("reports page changes through onParamChange", async () => {
    const { onParamChange } = renderTable({ showFiltersRow: false });

    // Pagination renders first/prev/next/last in that order; with no filter row
    // these are the only buttons on screen.
    const [, , next, last] = screen.getAllByRole("button");

    await userEvent.click(next);
    expect(onParamChange).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));

    await userEvent.click(last);
    expect(onParamChange).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3 }));
  });

  it("derives the page count from totalItems and pageSize", () => {
    renderTable();

    expect(screen.getByText("25")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("hides a column whose meta marks it invisible", () => {
    const hidden = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("role", { header: "Role", meta: { isVisible: false } }),
    ];
    renderTable({ columns: hidden });

    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.queryByText("Admin")).toBeNull();
    expect(screen.queryByText("Role")).toBeNull();
  });

  it("drives every row from one column template", () => {
    renderTable();

    expect(columnTemplate()).not.toBe("");
    expect(rows().length).toBeGreaterThanOrEqual(3);
    for (const row of rows())
      expect(row.style.gridTemplateColumns).toBe("var(--data-table-columns)");
  });

  it("pins a column at its meta width and floors the rest", () => {
    const sized = [
      columnHelper.accessor("id", { header: "ID", meta: { width: 80 } }),
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("role", { header: "Role", meta: { minWidth: 200 } }),
    ];
    renderTable({ columns: sized, showFiltersRow: false });

    expect(columnTemplate()).toBe("80px minmax(120px, 1fr) minmax(200px, 1fr)");
  });

  it("holds rows at the sum of their column minimums", () => {
    renderTable();

    for (const row of rows()) expect(row.style.minWidth).toBe("min-content");
  });

  it("drops a hidden column from the template", () => {
    const hidden = [
      columnHelper.accessor("id", { header: "ID" }),
      columnHelper.accessor("name", { header: "Name", meta: { isVisible: false } }),
      columnHelper.accessor("role", { header: "Role" }),
    ];
    renderTable({ columns: hidden });

    expect(columnTemplate()).toBe("minmax(120px, 1fr) minmax(120px, 1fr)");
    for (const row of rows()) expect(row.children.length).toBe(2);
  });

  it("aligns body cells from the column meta and leaves headers at the start", () => {
    const aligned = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.display({
        id: "score",
        header: "Score",
        cell: () => "42",
        meta: { align: "center" },
      }),
      columnHelper.accessor("role", { header: "Role", meta: { align: "end" } }),
    ];
    renderTable({ columns: aligned, showFiltersRow: false });

    const alignOf = (el: Element | null) =>
      el instanceof HTMLElement ? el.style.justifyContent : "";
    const bodyCell = (text: string) => alignOf(screen.getAllByText(text)[0].parentElement);
    const headerCell = (text: string) =>
      alignOf(screen.getByText(text).parentElement?.parentElement ?? null);

    expect(bodyCell("Alice")).toBe("start");
    expect(bodyCell("42")).toBe("center");
    expect(bodyCell("Admin")).toBe("end");

    for (const header of ["Name", "Score", "Role"]) expect(headerCell(header)).toBe("");
  });

  it("keeps the sorter out of flow so it never indents the header label", () => {
    const aligned = [
      columnHelper.accessor("name", { header: "Name", enableSorting: true }),
      columnHelper.accessor("role", {
        header: "Role",
        enableSorting: false,
        meta: { align: "end" },
      }),
    ];
    renderTable({ columns: aligned, showFiltersRow: false });

    const labelBox = (text: string) => screen.getByText(text).parentElement as HTMLElement;
    const sorterOf = (text: string) =>
      labelBox(text).querySelector<HTMLElement>(".data-table__column-sorter");

    expect(labelBox("Name").style.maxWidth).toBe("calc(100% - 22px)");
    expect(sorterOf("Name")?.style.marginLeft).toBe("4px");

    expect(labelBox("Role").style.maxWidth).toBe("100%");
    expect(sorterOf("Role")).toBeNull();
  });

  it("reports an operator-encoded value for a numeric column filter", async () => {
    const numeric = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("id", { header: "ID", meta: { type: "number" } }),
    ];
    const onParamChange = vi.fn();
    const StatefulTable = () => {
      const [current, setCurrent] = useState(params);
      return (
        <DataTable
          data={data}
          totalItems={25}
          columns={numeric}
          params={current}
          onParamChange={(next: DataTableParams) => {
            onParamChange(next);
            setCurrent(next);
          }}
        />
      );
    };
    render(<StatefulTable />);

    await userEvent.click(screen.getByRole("button", { name: "Equals" }));
    await userEvent.click(await screen.findByText("Greater or equal", { exact: false }));
    await userEvent.type(screen.getByPlaceholderText("Filter ID"), "100");

    await waitFor(
      () =>
        expect(onParamChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ filters: { id: ["gte:100"] } }),
        ),
      { timeout: 1500 },
    );

    await userEvent.clear(screen.getByPlaceholderText("Filter ID"));
    await waitFor(() =>
      expect(onParamChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: {} })),
    );
  });

  it("renders the empty message when there are no rows", () => {
    renderTable({ data: [], totalItems: 0 });

    expect(screen.getByText("No results available.")).toBeTruthy();
  });

  it("resets filters from the empty state", async () => {
    const onReset = vi.fn();
    renderTable({ data: [], totalItems: 0, onReset });

    await userEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("reports the clicked row", async () => {
    const onRowClick = vi.fn();
    renderTable({ onRowClick });

    await userEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledOnce();
    expect(onRowClick.mock.calls[0][0].original).toEqual(data[0]);
  });

  it("ignores a click that lands on a control inside the row", async () => {
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    const withAction = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.display({
        id: "actions",
        cell: () => (
          <button
            type="button"
            onClick={onAction}
          >
            Edit
          </button>
        ),
      }),
    ];
    renderTable({ columns: withAction, onRowClick, showFiltersRow: false });

    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(onAction).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("ignores a click on an icon inside a control in the row", async () => {
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    const withIconAction = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.display({
        id: "actions",
        cell: () => (
          <button
            type="button"
            aria-label="Edit"
            onClick={onAction}
          >
            <svg data-testid="edit-icon" />
          </button>
        ),
      }),
    ];
    renderTable({ columns: withIconAction, onRowClick, showFiltersRow: false });

    await userEvent.click(screen.getAllByTestId("edit-icon")[0]);
    expect(onAction).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("activates a row from the keyboard", async () => {
    const onRowClick = vi.fn();
    renderTable({ onRowClick });

    const row = focusableRow("Alice");
    row?.focus();
    await userEvent.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenCalledOnce();

    await userEvent.keyboard(" ");
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it("leaves rows out of the tab order when they are not clickable", () => {
    renderTable();

    expect(focusableRow("Alice")).toBeNull();
  });
});
