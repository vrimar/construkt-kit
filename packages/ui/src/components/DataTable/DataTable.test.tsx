import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDataTableColumnHelper, DataTable, type DataTableProps } from ".";
import { createMatchMedia } from "../../_shared/matchMedia";
import type { DataTableParams, DataTableRow } from "./types";

interface Person {
  id: number;
  name: string;
  role: string;
}

const columnHelper = createDataTableColumnHelper<Person>();

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

const renderTable = (
  overrides: Partial<Extract<DataTableProps<Person>, { totalItems: number }>> = {},
) => {
  const onParamChange = vi.fn();
  const { container } = render(
    <DataTable
      data={data}
      totalItems={25}
      columnDefs={columns}
      params={params}
      onParamChange={onParamChange}
      {...overrides}
    />,
  );
  return { onParamChange, container };
};

// The ScrollArea viewport is itself focusable, so a row tab stop is the nearer one.
const focusableRow = (text: string) =>
  screen.getByText(text).closest<HTMLElement>('[tabindex]:not([data-scope="scroll-area"])');

const rows = () => screen.getAllByRole("row");

const columnTemplate = () =>
  screen.getByRole("table").style.getPropertyValue("--data-table-columns");

const expandableColumns = [
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.display({
    id: "expand",
    cell: ({ row }) => (
      <button
        type="button"
        onClick={() => row.toggleExpanded()}
      >
        Details
      </button>
    ),
  }),
];

const renderSubRow = (row: DataTableRow<Person>) => <div>{`Sub-row of ${row.original.name}`}</div>;

const datedColumns = [columnHelper.accessor("name", { header: "Name", meta: { type: "date" } })];

const dateTrigger = (container: HTMLElement) => {
  const trigger = container.querySelector<HTMLElement>(
    '[data-scope="date-picker"][data-part="trigger"]',
  );
  if (!trigger) throw new Error("No date picker trigger");
  return trigger;
};

const dayCell = (iso: string) => {
  const day = document.querySelector<HTMLElement>(
    `[data-part="table-cell-trigger"][data-view="day"][data-value="${iso}"]`,
  );
  if (!day) throw new Error(`No day cell for ${iso}`);
  return day;
};

const shownNames = () =>
  within(screen.getAllByRole("rowgroup")[1])
    .queryAllByRole("row")
    .map((row) => row.querySelector('[role="cell"]')?.textContent);

interface Spell {
  id: number;
  name: string;
  level: number | null;
  elements: string[];
  learned: string;
  school?: string;
}

const spellHelper = createDataTableColumnHelper<Spell>();

const spells: Spell[] = [
  { id: 1, name: "ember", level: 3, elements: ["Fire"], learned: "2024-01-10", school: "fire" },
  {
    id: 2,
    name: "Blizzard",
    level: 4,
    elements: ["Ice", "Wind"],
    learned: "2024-01-31",
    school: "Frost",
  },
  { id: 3, name: "Wildfire", level: null, elements: ["Wildfire"], learned: "2024-01-15" },
  {
    id: 4,
    name: "Aurora",
    level: 5,
    elements: ["Fire", "Ice"],
    learned: "2024-01-01",
    school: "arcane",
  },
  { id: 5, name: "Gale", level: 2, elements: ["Wind"], learned: "2024-01-20", school: "Air" },
];

const spellColumns = [
  spellHelper.accessor("name", { header: "Name", meta: { card: "title" } }),
  spellHelper.accessor("elements", { header: "Elements", meta: { type: "select" } }),
];

type ClientOverrides = Partial<
  Omit<Extract<DataTableProps<Spell>, { clientSide: true }>, "params">
> & { params?: Partial<DataTableParams> };

const renderClientTable = (initial: ClientOverrides = {}) => {
  const onParamChange = vi.fn();
  const table = ({ params: paramOverrides, ...overrides }: ClientOverrides) => (
    <DataTable
      clientSide
      data={spells}
      columnDefs={spellColumns}
      params={{ ...params, ...paramOverrides }}
      onParamChange={onParamChange}
      {...overrides}
    />
  );
  const { rerender } = render(table(initial));
  return { onParamChange, rerender: (next: ClientOverrides) => rerender(table(next)) };
};

const roster: Person[] = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  role: index < 12 ? "Admin" : "User",
}));

describe("DataTable", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("labels a select filter with its placeholder until a value is applied", () => {
    renderTable({ selections: { role: ["Admin", "User"] } });
    expect(screen.getByRole("button", { name: "Filter by Role" })).toBeTruthy();
  });

  it("labels a select filter with its applied value", () => {
    renderTable({
      params: { ...params, filters: { role: ["Admin"] } },
      selections: { role: ["Admin", "User"] },
    });
    expect(screen.getByRole("button", { name: "Admin" })).toBeTruthy();
  });

  it("renders a header and a cell per column for every row", () => {
    renderTable();

    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("applies style props to the table root over its defaults", () => {
    const { container } = renderTable({ w: "640px", h: "480px" });

    const rootClasses = container.firstElementChild?.className.split(" ") ?? [];
    expect(rootClasses).toEqual(expect.arrayContaining(["w_640px", "h_480px", "flex_1"]));
    expect(rootClasses).not.toContain("w_100%");
  });

  it("sizes a date filter to its cell without a wrapper", () => {
    const dated = [columnHelper.accessor("name", { header: "Name", meta: { type: "date" } })];
    renderTable({ columnDefs: dated });

    const root = document.querySelector('[data-scope="date-picker"][data-part="root"]');
    expect(root?.parentElement?.getAttribute("role")).toBe("cell");
    expect(root?.className.split(" ")).toContain("w_100%");
  });

  it("cycles a sortable column through asc, desc and cleared", async () => {
    const StatefulTable = () => {
      const [current, setCurrent] = useState(params);
      return (
        <DataTable
          data={data}
          totalItems={25}
          columnDefs={columns}
          params={current}
          onParamChange={setCurrent}
        />
      );
    };
    render(<StatefulTable />);

    const sorter = () => document.querySelector('[data-part="column-sorter"]') as Element;
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

  it("sorts from the keyboard through the sorter button", async () => {
    const { onParamChange } = renderTable();

    screen.getByRole("button", { name: "Sort by Name" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onParamChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: "name", orderType: "asc" }),
    );

    await userEvent.keyboard(" ");
    expect(onParamChange).toHaveBeenCalledTimes(2);
  });

  it("returns to the first page when the sort changes", async () => {
    const { onParamChange } = renderTable({ params: { ...params, page: 3 } });

    await userEvent.click(screen.getByRole("button", { name: "Sort by Name" }));
    expect(onParamChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, orderBy: "name" }),
    );
  });

  it("exposes table semantics", () => {
    const semantic = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("role", { header: "Role", enableSorting: false }),
    ];
    renderTable({ columnDefs: semantic });

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

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onParamChange).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));

    await userEvent.click(screen.getByRole("button", { name: "Last page" }));
    expect(onParamChange).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3 }));
  });

  it("derives the page count from totalItems and pageSize", () => {
    renderTable();

    expect(screen.getByText("25")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("moves a page past the end back to the last page", () => {
    const { onParamChange } = renderTable({ params: { ...params, page: 3 }, totalItems: 20 });

    expect(onParamChange).toHaveBeenCalledTimes(1);
    expect(onParamChange).toHaveBeenCalledWith({ ...params, page: 2 });
  });

  it("waits for loading to finish before moving a page past the end", () => {
    const onParamChange = vi.fn();
    const table = (loading: boolean) => (
      <DataTable
        data={data}
        totalItems={20}
        columnDefs={columns}
        params={{ ...params, page: 3 }}
        onParamChange={onParamChange}
        loading={loading}
      />
    );
    const { rerender } = render(table(true));
    expect(onParamChange).not.toHaveBeenCalled();

    rerender(table(false));
    expect(onParamChange).toHaveBeenCalledTimes(1);
    expect(onParamChange).toHaveBeenCalledWith({ ...params, page: 2 });
  });

  it("moves a page past the end once while the parent re-renders without applying it", () => {
    const onParamChange = vi.fn();
    const table = () => (
      <DataTable
        data={data}
        totalItems={20}
        columnDefs={columns}
        params={{ ...params, page: 3 }}
        onParamChange={(next) => onParamChange(next)}
      />
    );
    const { rerender } = render(table());
    rerender(table());
    rerender(table());

    expect(onParamChange).toHaveBeenCalledTimes(1);
  });

  it.each([0, -1, Number.NaN])("moves page %s to the first page", (page) => {
    const { onParamChange } = renderTable({ params: { ...params, page } });

    expect(onParamChange).toHaveBeenCalledTimes(1);
    expect(onParamChange).toHaveBeenCalledWith({ ...params, page: 1 });
  });

  it.each([
    ["the page is in range", { params: { ...params, page: 2 }, totalItems: 20 }],
    ["there are no items", { params: { ...params, page: 3 }, data: [], totalItems: 0 }],
  ])("keeps the page when %s", (_, overrides) => {
    const { onParamChange } = renderTable(overrides);

    expect(onParamChange).not.toHaveBeenCalled();
  });

  it("hides a column whose meta marks it invisible", () => {
    const hidden = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("role", { header: "Role", meta: { isVisible: false } }),
    ];
    renderTable({ columnDefs: hidden });

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
    renderTable({ columnDefs: sized, showFiltersRow: false });

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
    renderTable({ columnDefs: hidden });

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
    renderTable({ columnDefs: aligned, showFiltersRow: false });

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
    renderTable({ columnDefs: aligned, showFiltersRow: false });

    const labelBox = (text: string) => screen.getByText(text).parentElement as HTMLElement;
    const sorterOf = (text: string) =>
      labelBox(text).querySelector<HTMLElement>('[data-part="column-sorter"]');

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
          columnDefs={numeric}
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
    await userEvent.type(screen.getByPlaceholderText("Filter by ID"), "100");

    await waitFor(
      () =>
        expect(onParamChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ filters: { id: ["gte:100"] } }),
        ),
      { timeout: 1500 },
    );

    await userEvent.clear(screen.getByPlaceholderText("Filter by ID"));
    await waitFor(() =>
      expect(onParamChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: {} })),
    );
  });

  it("applies typed search text once, after the debounce", async () => {
    const { onParamChange } = renderTable();

    await userEvent.type(screen.getByPlaceholderText("Filter by Name"), "Bo");
    expect(onParamChange).not.toHaveBeenCalled();

    await waitFor(
      () =>
        expect(onParamChange).toHaveBeenCalledWith(
          expect.objectContaining({ filters: { name: ["Bo"] } }),
        ),
      { timeout: 1500 },
    );
    expect(onParamChange).toHaveBeenCalledOnce();
  });

  it("applies an emptied search filter without waiting for the debounce", async () => {
    const { onParamChange } = renderTable({ params: { ...params, filters: { name: ["Ali"] } } });

    await userEvent.clear(screen.getByPlaceholderText("Filter by Name"));
    expect(onParamChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: {} }));
  });

  it("returns to the first page when a filter changes", async () => {
    const { onParamChange } = renderTable({
      params: { ...params, page: 3, filters: { name: ["Ali"] } },
    });

    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onParamChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, filters: {} }),
    );
  });

  it("clears a malformed date filter param", () => {
    const dated = [columnHelper.accessor("name", { header: "Name", meta: { type: "date" } })];
    const { onParamChange } = renderTable({
      columnDefs: dated,
      params: { ...params, filters: { name: ["2024-01-01<>soon"] } },
    });

    expect(onParamChange).toHaveBeenLastCalledWith(expect.objectContaining({ filters: {} }));
  });

  it("labels every filter kind with the column placeholder", () => {
    const kinds = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("id", { header: "ID", meta: { type: "number" } }),
      columnHelper.accessor("role", { header: "Role", meta: { type: "date" } }),
    ];
    renderTable({ columnDefs: kinds });

    expect(screen.getByPlaceholderText("Filter by Name")).toBeTruthy();
    expect(screen.getByPlaceholderText("Filter by ID")).toBeTruthy();
    expect(screen.getByText("Filter by Role")).toBeTruthy();
  });

  it("names the filter clear buttons from labels", () => {
    const filtered = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("id", { header: "ID", meta: { type: "number" } }),
      columnHelper.accessor("role", { header: "Role", meta: { type: "date" } }),
    ];
    renderTable({
      columnDefs: filtered,
      params: {
        ...params,
        filters: { name: ["Ali"], id: ["5"], role: ["2024-01-01<>2024-01-31"] },
      },
      labels: { clearSearch: "Reset name", clearNumber: "Reset id", clearDate: "Reset dates" },
    });

    for (const name of ["Reset name", "Reset id", "Reset dates"])
      expect(screen.getByRole("button", { name })).toBeTruthy();
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
    renderTable({ columnDefs: withAction, onRowClick, showFiltersRow: false });

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
    renderTable({ columnDefs: withIconAction, onRowClick, showFiltersRow: false });

    await userEvent.click(screen.getAllByTestId("edit-icon")[0]);
    expect(onAction).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("ignores clicks and Enter on form controls inside the row", async () => {
    const onRowClick = vi.fn();
    const withControls = [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.display({
        id: "controls",
        cell: () => (
          <>
            <input aria-label="Note" />
            <select aria-label="Level">
              <option>Low</option>
            </select>
            <label>
              Pinned
              <input type="checkbox" />
            </label>
          </>
        ),
      }),
    ];
    renderTable({ columnDefs: withControls, onRowClick, showFiltersRow: false });

    const [note] = screen.getAllByRole("textbox", { name: "Note" });
    await userEvent.click(note);
    await userEvent.keyboard("{Enter} x");
    expect((note as HTMLInputElement).value).toBe(" x");

    await userEvent.click(screen.getAllByRole("combobox", { name: "Level" })[0]);
    await userEvent.click(screen.getAllByText("Pinned")[0]);
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

  it("marks rows clickable only when onRowClick is set", () => {
    const clickable = (overrides: Parameters<typeof renderTable>[0]) =>
      renderTable(overrides).container.querySelectorAll("[data-clickable]");

    expect(clickable({})).toHaveLength(0);
    expect(clickable({ onRowClick: vi.fn() })).toHaveLength(data.length);
  });

  it("expands a row's sub-row from a cell control", async () => {
    renderTable({
      columnDefs: expandableColumns,
      showFiltersRow: false,
      renderSubRow,
    });

    expect(screen.queryByText("Sub-row of Alice")).toBeNull();
    await userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
    expect(screen.getByText("Sub-row of Alice")).toBeTruthy();
    expect(screen.queryByText("Sub-row of Bob")).toBeNull();
  });

  it("expands a sub-row in the mobile card layout", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(createMatchMedia(true));
    renderTable({ columnDefs: expandableColumns, mobileLayout: "cards", renderSubRow });

    await userEvent.click(screen.getAllByRole("button", { name: "Details" })[1]);
    expect(screen.getByText("Sub-row of Bob")).toBeTruthy();
  });

  it("scrolls the mobile cards back to the top on a page change", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(createMatchMedia(true));
    const scrollTo = vi.spyOn(Element.prototype, "scrollTo");
    const cardsTable = (page: number) => (
      <DataTable
        data={data}
        totalItems={25}
        columnDefs={columns}
        params={{ ...params, page }}
        onParamChange={vi.fn()}
        mobileLayout="cards"
      />
    );
    const { rerender } = render(cardsTable(1));
    scrollTo.mockClear();

    rerender(cardsTable(2));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("keeps the column template when getRowProps returns a style", () => {
    renderTable({ getRowProps: () => ({ style: { opacity: 0.5 } }) });

    const bodyRow = screen.getByText("Alice").closest<HTMLElement>('[role="row"]');
    expect(bodyRow?.style.opacity).toBe("0.5");
    expect(bodyRow?.style.gridTemplateColumns).toBe("var(--data-table-columns)");
    expect(bodyRow?.style.minWidth).toBe("min-content");
  });

  it("renders a select filter whose selections repeat a value", async () => {
    renderTable({ selections: { role: ["Admin", "Admin", "User"] } });

    await userEvent.click(screen.getByRole("button", { name: "Filter by Role" }));
    expect(await screen.findAllByRole("option", { name: "Admin" })).toHaveLength(1);
  });

  it("spans group headers over their columns with a single filter row", () => {
    const grouped = [
      columnHelper.accessor("id", { header: "ID", enableSorting: true }),
      columnHelper.group({
        id: "person",
        header: "Person",
        columns: columnHelper.columns([
          columnHelper.accessor("name", { header: "Name" }),
          columnHelper.accessor("role", { header: "Role" }),
        ]),
      }),
    ];
    renderTable({ columnDefs: grouped });

    const person = screen.getByRole("columnheader", { name: "Person" });
    expect(person.style.gridColumn).toBe("span 2");
    expect(person.getAttribute("aria-colspan")).toBe("2");
    expect(screen.getAllByRole("button", { name: "Sort by ID" })).toHaveLength(1);
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    for (const placeholder of ["Filter by ID", "Filter by Name", "Filter by Role"])
      expect(screen.getAllByPlaceholderText(placeholder)).toHaveLength(1);
    expect(rows()).toHaveLength(2 + 1 + data.length);
  });

  it("keeps the page when a filter reset changes nothing", async () => {
    const { onParamChange } = renderTable({
      params: { ...params, page: 3 },
      selections: { role: ["Admin", "User"] },
    });

    await userEvent.click(screen.getByRole("button", { name: "Filter by Role" }));
    await userEvent.click(await screen.findByRole("button", { name: "Reset" }));
    expect(onParamChange).not.toHaveBeenCalled();
  });

  it("keeps the applied date range when the picker closes mid-selection", async () => {
    const { onParamChange, container } = renderTable({
      columnDefs: datedColumns,
      params: { ...params, filters: { name: ["2024-01-01<>2024-01-31"] } },
    });

    await userEvent.click(dateTrigger(container));
    await userEvent.click(dayCell("2024-01-10"));
    await userEvent.keyboard("{Escape}");

    expect(onParamChange).not.toHaveBeenCalled();
    expect(dateTrigger(container).textContent).toBe("2024-01-01 – 2024-01-31");
  });

  it("applies a date range picked in the filter", async () => {
    const { onParamChange, container } = renderTable({
      columnDefs: datedColumns,
      params: { ...params, filters: { name: ["2024-01-01<>2024-01-31"] } },
    });

    await userEvent.click(dateTrigger(container));
    await userEvent.click(dayCell("2024-01-10"));
    await userEvent.click(dayCell("2024-01-12"));

    expect(onParamChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: { name: ["2024-01-10<>2024-01-12"] } }),
    );
  });

  it("labels mobile cards with a rendered header", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(createMatchMedia(true));
    const rendered = [
      columnHelper.accessor("name", { header: () => <em>Full name</em> }),
      columnHelper.accessor("role", { header: "Role" }),
    ];
    renderTable({ columnDefs: rendered, mobileLayout: "cards" });

    expect(screen.getAllByText("Full name")).toHaveLength(data.length);
    expect(screen.getAllByText("Role")).toHaveLength(data.length);
  });

  describe("mobile cards", () => {
    const cardColumns = [
      columnHelper.accessor("role", { header: "Role", meta: { type: "select" } }),
      columnHelper.accessor("name", { header: "Name", meta: { card: "title" } }),
      columnHelper.accessor("id", { header: "Id", meta: { card: "hidden" } }),
      columnHelper.display({
        id: "actions",
        header: () => <button type="button">Reset table</button>,
        cell: () => <button type="button">Row menu</button>,
        meta: { card: "actions" },
      }),
    ];

    const renderCards = (overrides: Parameters<typeof renderTable>[0] = {}) => {
      vi.spyOn(window, "matchMedia").mockImplementation(createMatchMedia(true));
      return renderTable({
        columnDefs: cardColumns,
        mobileLayout: "cards",
        selections: { role: ["Admin", "User"] },
        ...overrides,
      });
    };

    it("lays cards out by column role", () => {
      renderCards();

      expect(screen.getAllByRole("button", { name: "Row menu" })).toHaveLength(data.length);
      expect(screen.queryByRole("button", { name: "Reset table" })).toBeNull();
      expect(screen.queryByText("Id")).toBeNull();
    });

    it("searches the title column", async () => {
      const { onParamChange } = renderCards();

      await userEvent.type(screen.getByPlaceholderText("Filter by Name"), "Al");
      await waitFor(() =>
        expect(onParamChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ filters: { name: ["Al"] } }),
        ),
      );
    });

    it("sends a search once when the field loses focus before the debounce", async () => {
      const { onParamChange } = renderCards();

      await userEvent.type(screen.getByPlaceholderText("Filter by Name"), "Al");
      await userEvent.click(document.body);
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(onParamChange).toHaveBeenCalledOnce();
    });

    it("flips the sort direction from the sort drawer once it is done", async () => {
      const { onParamChange } = renderCards({
        params: { ...params, orderBy: "name", orderType: "asc" },
      });

      await userEvent.click(screen.getByRole("button", { name: "Sort by Name" }));
      await userEvent.click(await screen.findByText("Descending"));
      expect(onParamChange).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "Done" }));
      expect(onParamChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ orderBy: "name", orderType: "desc" }),
      );
    });

    it("applies a filter typed in the filters drawer only once it is done", async () => {
      const { onParamChange } = renderCards();

      await userEvent.click(screen.getByRole("button", { name: /Filters/ }));
      await userEvent.type(await screen.findByPlaceholderText("Filter by Id"), "7");
      await new Promise((resolve) => setTimeout(resolve, 600));
      expect(onParamChange).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "Done" }));
      expect(onParamChange).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ filters: { id: ["7"] } }),
      );
    });

    it("drops filter edits when the filters drawer is dismissed", async () => {
      const { onParamChange } = renderCards();

      await userEvent.click(screen.getByRole("button", { name: /Filters/ }));
      await userEvent.type(await screen.findByPlaceholderText("Filter by Id"), "7");
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByPlaceholderText("Filter by Id")).toBeNull());

      expect(onParamChange).not.toHaveBeenCalled();
    });
    it("keeps header templates out of the sort drawer's buttons", async () => {
      renderCards({
        columnDefs: [
          columnHelper.accessor("role", {
            header: () => (
              <span>
                Role <button type="button">About roles</button>
              </span>
            ),
          }),
          ...cardColumns.slice(1),
        ],
      });

      await userEvent.click(screen.getByRole("button", { name: "Sort" }));
      await screen.findByRole("radiogroup", { name: "Sort by" });

      expect(document.querySelector("button button")).toBeNull();
    });

    it("keeps the search and filters it doesn't show when the filters drawer resets", async () => {
      const { onParamChange } = renderCards({
        params: { ...params, filters: { name: ["Al"], role: ["Admin"], team: ["Core"] } },
      });

      await userEvent.click(screen.getByRole("button", { name: /Filters/ }));
      await userEvent.click(await screen.findByRole("button", { name: "Reset filters" }));
      await userEvent.click(screen.getByRole("button", { name: "Done" }));
      expect(onParamChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ filters: { name: ["Al"], team: ["Core"] } }),
      );
    });
  });

  describe("client-side mode", () => {
    it("filters each column by its meta type, inside a group column too", () => {
      const typed = [
        spellHelper.accessor("name", { header: "Name" }),
        spellHelper.group({
          id: "stats",
          header: "Stats",
          columns: spellHelper.columns([
            spellHelper.accessor("level", { header: "Level", meta: { type: "number" } }),
            spellHelper.accessor("learned", { header: "Learned", meta: { type: "date" } }),
          ]),
        }),
      ];
      renderClientTable({
        columnDefs: typed,
        params: {
          filters: { name: ["R"], level: ["lte:5"], learned: ["2024-01-01<>2024-01-31"] },
        },
      });

      expect(shownNames()).toEqual(["ember", "Blizzard", "Aurora"]);
    });

    it("matches a select filter against each element of an array cell", () => {
      renderClientTable({ params: { filters: { elements: ["Fire"] } } });

      expect(shownNames()).toEqual(["ember", "Aurora"]);
    });

    it("keeps a column's own filterFn", () => {
      const prefixed = [
        spellHelper.accessor("name", {
          header: "Name",
          filterFn: (row, columnId, value: string[]) =>
            row.getValue<string>(columnId).startsWith(value[0]),
        }),
      ];
      renderClientTable({ columnDefs: prefixed, params: { filters: { name: ["A"] } } });

      expect(shownNames()).toEqual(["Aurora"]);
    });

    it("sorts text without regard to case and keeps missing values last", () => {
      const schools = [
        spellHelper.accessor("name", { header: "Name" }),
        spellHelper.accessor("school", { header: "School" }),
      ];
      const { rerender } = renderClientTable({
        columnDefs: schools,
        params: { orderBy: "school", orderType: "asc" },
      });
      expect(shownNames()).toEqual(["Gale", "Aurora", "ember", "Blizzard", "Wildfire"]);

      rerender({ columnDefs: schools, params: { orderBy: "school", orderType: "desc" } });
      expect(shownNames()).toEqual(["Blizzard", "ember", "Aurora", "Gale", "Wildfire"]);
    });

    it("sorts a select column by its labels", () => {
      const labelled = [
        spellHelper.accessor("name", { header: "Name" }),
        spellHelper.accessor("id", {
          header: "Rune",
          meta: { type: "select", selectProps: { getItemLabel: (id) => "edcba"[Number(id) - 1] } },
        }),
      ];
      renderClientTable({ columnDefs: labelled, params: { orderBy: "id", orderType: "asc" } });

      expect(shownNames()).toEqual(["Gale", "Aurora", "Wildfire", "Blizzard", "ember"]);
    });

    it("filters a timestamp by the day it falls on locally", () => {
      const dated = [
        spellHelper.accessor("name", { header: "Name" }),
        spellHelper.accessor("learned", { header: "Learned", meta: { type: "date" } }),
      ];
      renderClientTable({
        data: [{ ...spells[0], learned: "2024-01-31T23:30:00-12:00" }],
        columnDefs: dated,
        params: { filters: { learned: ["2024-02-01<>2024-02-02"] } },
      });

      expect(shownNames()).toEqual(["ember"]);
    });

    it("pages and counts the filtered rows", () => {
      render(
        <DataTable
          clientSide
          data={roster}
          columnDefs={columns}
          params={{ ...params, page: 2, filters: { role: ["Admin"] } }}
          onParamChange={vi.fn()}
        />,
      );

      expect(shownNames()).toEqual(["Person 11", "Person 12"]);
      expect(screen.getByText("12")).toBeTruthy();
    });

    it("keeps the page when the data is replaced", async () => {
      const onParamChange = vi.fn();
      const table = (people: Person[]) => (
        <DataTable
          clientSide
          data={people}
          columnDefs={columns}
          params={{ ...params, page: 2 }}
          onParamChange={onParamChange}
        />
      );
      const { rerender } = render(table(roster));
      rerender(table([...roster]));
      await new Promise((resolve) => setTimeout(resolve));

      expect(onParamChange).not.toHaveBeenCalled();
    });

    it("lists every value of a select column, unless selections name them", async () => {
      const { rerender } = renderClientTable({
        params: { filters: { name: ["ember"], elements: ["Ice"] } },
      });

      await userEvent.click(screen.getByRole("button", { name: "Ice" }));
      const options = async () =>
        (await screen.findAllByRole("option")).map((option) => option.textContent);
      expect(await options()).toEqual(["Fire", "Ice", "Wildfire", "Wind"]);

      await userEvent.keyboard("{Escape}");
      rerender({
        params: { filters: { name: ["ember"], elements: ["Ice"] } },
        selections: { elements: ["Ice", "Fire"] },
      });
      await userEvent.click(screen.getByRole("button", { name: "Ice" }));
      expect(await options()).toEqual(["Ice", "Fire"]);
    });

    it("leaves server-mode data as given", () => {
      renderTable({
        params: {
          ...params,
          page: 2,
          orderBy: "name",
          orderType: "desc",
          filters: { role: ["Admin"] },
        },
      });

      expect(shownNames()).toEqual(["Alice", "Bob"]);
    });

    it("filters mobile cards from the drawer's listed values", async () => {
      vi.spyOn(window, "matchMedia").mockImplementation(createMatchMedia(true));
      const StatefulTable = () => {
        const [current, setCurrent] = useState(params);
        return (
          <DataTable
            clientSide
            data={spells}
            columnDefs={spellColumns}
            params={current}
            onParamChange={setCurrent}
            mobileLayout="cards"
          />
        );
      };
      render(<StatefulTable />);
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

      await user.click(screen.getByRole("button", { name: "Filters" }));
      await user.click(await screen.findByRole("button", { name: "Filter by Elements" }));
      await user.click(await screen.findByRole("option", { name: "Wind" }));
      await user.click(screen.getByRole("button", { name: "Apply" }));
      await user.click(screen.getByRole("button", { name: "Done" }));

      await waitFor(() => expect(screen.queryByText("ember")).toBeNull());
      for (const name of ["Blizzard", "Gale"]) expect(screen.getByText(name)).toBeTruthy();
      for (const name of ["Wildfire", "Aurora"]) expect(screen.queryByText(name)).toBeNull();
    });
  });
});
