import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";

import { DataGrid } from "./DataGrid";
import type { ColumnDef, DataGridApi, HeaderMenuContext } from "./types";

interface Row {
  id: string;
}

const rows: Row[] = Array.from({ length: 5 }, (_, i) => ({ id: String(i) }));

test("a header menu on a selected column gets the whole selection; on another column, only that one", () => {
  const seen: (readonly string[])[] = [];
  const menu = (ctx: HeaderMenuContext<Row>) => {
    seen.push(ctx.ids);
    return [{ id: "hide", label: "Hide" }];
  };
  const columnDefs: ColumnDef<Row>[] = ["a", "b", "c"].map((id) => ({ id, width: 30, menu }));
  const { container } = render(
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      columnDefs={columnDefs}
      selection={{ kind: "columns", ids: ["a", "b"] }}
      aria-label="Menus"
    />,
  );
  const header = (id: string) => container.querySelector(`[data-header-id="${id}"]`) as Element;

  fireEvent.contextMenu(header("b"));
  fireEvent.contextMenu(header("c"));

  expect(seen).toEqual([["a", "b"], ["c"]]);
});

test("openMenu from a cell button opens the shared menu without a cell click, and Escape returns focus to the button", async () => {
  const user = userEvent.setup();
  const onCellClick = vi.fn();
  render(
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      onCellClick={onCellClick}
      columnDefs={[
        {
          id: "actions",
          cell: {
            render: (ctx) =>
              ctx.rowId === "1" ? <button onClick={ctx.openMenu}>More</button> : null,
            menu: () => [{ id: "archive", label: "Archive" }],
          },
        },
      ]}
      aria-label="Menus"
    />,
  );
  const button = screen.getByRole("button", { name: "More" });

  await user.click(button);
  const menu = await screen.findByRole("menu");
  await vi.waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
  expect(screen.getByRole("menuitem", { name: "Archive" })).toBeTruthy();
  expect(onCellClick).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");

  await vi.waitFor(() => expect(document.activeElement).toBe(button));
});

test("an app command bound over a built-in key runs first; returning false falls through", async () => {
  const user = userEvent.setup();
  let answer = false;
  const jump = vi.fn(() => answer);
  render(
    <>
      <button>before</button>
      <DataGrid
        rows={rows}
        getRowId={(row) => row.id}
        columnDefs={[{ id: "a", getValue: (row) => `Row ${row.id}` }]}
        keymap={{ ArrowDown: "jump" }}
        commands={{ jump }}
        aria-label="Commands"
      />
    </>,
  );
  screen.getByRole("button", { name: "before" }).focus();
  await user.tab();
  const activeText = () => document.activeElement?.textContent;

  await user.keyboard("{ArrowDown}");
  expect(activeText()).toBe("Row 1");

  answer = true;
  await user.keyboard("{ArrowDown}");
  expect(activeText()).toBe("Row 1");
  expect(jump).toHaveBeenCalledTimes(2);
});

test("Alt+ArrowDown opens the header menu on its first item, and focus returns to a cell after it hides the column", async () => {
  const user = userEvent.setup();
  const apiRef = createRef<DataGridApi>();
  render(
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      columnDefs={["a", "b"].map((id) => ({
        id,
        width: 30,
        menu: () => [
          { id: "hide", label: "Hide", onSelect: () => apiRef.current?.setColumnHidden(id, true) },
        ],
      }))}
      apiRef={apiRef}
      aria-label="Menus"
    />,
  );

  await user.click(screen.getAllByRole("gridcell")[0]);
  await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
  const menu = await screen.findByRole("menu");
  const hide = await screen.findByRole("menuitem", { name: "Hide" });
  await vi.waitFor(() => {
    expect(hide.hasAttribute("data-highlighted")).toBe(true);
    expect(menu.contains(document.activeElement)).toBe(true);
  });
  await user.keyboard("{Enter}");

  await vi.waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("gridcell"));
  expect(screen.getAllByRole("columnheader")).toHaveLength(1);
});

test("an item in a header submenu returns focus to a cell after it pins the column", async () => {
  const user = userEvent.setup();
  const apiRef = createRef<DataGridApi>();
  render(
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      columnDefs={["a", "b"].map((id) => ({
        id,
        width: 30,
        menu: () => [
          {
            id: "pin",
            label: "Pin",
            items: [
              {
                id: "left",
                label: "Left",
                onSelect: () => apiRef.current?.setColumnPinned(id, "left"),
              },
            ],
          },
        ],
      }))}
      apiRef={apiRef}
      aria-label="Menus"
    />,
  );

  await user.click(screen.getAllByRole("gridcell")[1]);
  await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
  const menu = await screen.findByRole("menu");
  await vi.waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
  await user.keyboard("{ArrowDown}{ArrowRight}");
  const left = await screen.findByRole("menuitem", { name: "Left" });
  await vi.waitFor(() => {
    expect(left.hasAttribute("data-highlighted")).toBe(true);
    expect(left.closest("[role=menu]")?.contains(document.activeElement)).toBe(true);
  });
  await user.keyboard("{Enter}");

  await vi.waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("gridcell"));
  expect(document.activeElement?.closest("[data-pinned=left]")).not.toBeNull();
});

test("clicking a header keeps keyboard focus on a cell in that column", async () => {
  const user = userEvent.setup();
  render(
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      columnDefs={["a", "b"].map((id) => ({ id, header: id.toUpperCase(), width: 30 }))}
      aria-label="Headers"
    />,
  );

  await user.click(screen.getByRole("columnheader", { name: "B" }));

  expect(document.activeElement?.getAttribute("aria-colindex")).toBe("2");
});
