import { createColumnHelper } from "@tanstack/react-table";
import { cleanup, render, screen } from "@testing-library/react";
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

    await userEvent.click(sorter());
    expect(sorter().getAttribute("data-sorted")).toBe("asc");

    await userEvent.click(sorter());
    expect(sorter().getAttribute("data-sorted")).toBe("desc");

    await userEvent.click(sorter());
    expect(sorter().getAttribute("data-sorted")).toBeNull();
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
