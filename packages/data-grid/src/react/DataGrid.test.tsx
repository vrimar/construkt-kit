import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, test, vi } from "vitest";

import { createFixture, moveIds } from "../../test/fixture";
import { DataGrid } from "./DataGrid";
import type { DataGridApi } from "./types";

test("Tab into the grid lands on the active cell, and Tab at the last cell leaves", async () => {
  const user = userEvent.setup();
  const apiRef = createRef<DataGridApi>();
  render(
    <>
      <button>before</button>
      <DataGrid
        {...createFixture(30, 4)}
        apiRef={apiRef}
        aria-label="Grid"
      />
      <button>after</button>
    </>,
  );

  screen.getByRole("button", { name: "before" }).focus();
  await user.tab();
  expect(document.activeElement).toHaveProperty("textContent", "R1C1");

  act(() => {
    apiRef.current?.runCommand("moveGridEnd");
  });
  expect(document.activeElement).toHaveProperty("textContent", "R30C4");
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "after" }));
});

test("keys inside a cell's controls stay there, and Tab past the last cell skips them", async () => {
  const user = userEvent.setup();
  const apiRef = createRef<DataGridApi>();
  const fixture = createFixture(3, 2);
  const columnDefs = fixture.columnDefs.map((column) => ({
    ...column,
    cell: {
      render: () => (
        <>
          <button>Edit</button>
          <button>Delete</button>
        </>
      ),
    },
  }));
  render(
    <>
      <button>before</button>
      <DataGrid
        {...fixture}
        columnDefs={columnDefs}
        apiRef={apiRef}
        aria-label="Grid"
      />
      <button>after</button>
    </>,
  );
  screen.getByRole("button", { name: "before" }).focus();
  await user.tab();
  const firstCell = document.activeElement;

  await user.keyboard("{Enter}");
  expect(document.activeElement).toHaveProperty("textContent", "Edit");
  await user.keyboard("{ArrowDown}{Tab}");
  expect(document.activeElement).toHaveProperty("textContent", "Delete");
  await user.keyboard("{Escape}");
  expect(document.activeElement).toBe(firstCell);

  act(() => {
    apiRef.current?.runCommand("moveGridEnd");
  });
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "after" }));
});

test("a row that can be selected reports aria-selected false; one isRowSelectable rejects reports none", () => {
  render(
    <DataGrid
      rows={[
        { id: 1, name: "Paid" },
        { id: 2, name: "Open" },
        { id: 3, name: "Picked" },
      ]}
      getRowId={(row) => row.id}
      columnDefs={[{ id: "name", field: "name" }]}
      isRowSelectable={(row) => row.name !== "Paid"}
      selection={{ kind: "rows", ids: [3] }}
      aria-label="Rows"
    />,
  );

  const selected = (name: string) =>
    screen.getByRole("row", { name }).getAttribute("aria-selected");
  expect([selected("Paid"), selected("Open"), selected("Picked")]).toEqual([null, "false", "true"]);
});

const announced = (container: HTMLElement) =>
  container.querySelector("[aria-live][aria-atomic=true]")?.textContent?.replace("\u200b", "");

test("Shift+Arrow announces what the range now covers", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <DataGrid
      {...createFixture(5, 3)}
      labels={{ selected: (count, kind) => `${count} ${kind}` }}
      aria-label="Ranges"
    />,
  );

  await user.click(screen.getByRole("gridcell", { name: "R1C1" }));
  await user.keyboard("{Shift>}{ArrowRight}{/Shift}");

  expect(announced(container)).toBe("2 cells");
});

function MovableRows() {
  const fixture = createFixture(4, 2);
  const [rows, setRows] = useState(fixture.rows);
  return (
    <DataGrid
      {...fixture}
      rows={rows}
      onRowsDrop={({ ids, targetId, position }) => {
        if (position === "onto") return;
        setRows((current) => moveIds(current, (row) => row.id, ids, targetId, position));
      }}
      labels={{ rowMoved: (position, count) => `${position}/${count}` }}
      aria-label="Moves"
    />
  );
}

test("a keyboard move announces the row number screen readers give the moved row", async () => {
  const user = userEvent.setup();
  const { container } = render(<MovableRows />);

  await user.click(screen.getByRole("gridcell", { name: "R1C1" }));
  await user.keyboard("{Alt>}{Shift>}{ArrowDown}{/Shift}{/Alt}");

  const row = screen.getByRole("gridcell", { name: "R1C1" }).closest("[role=row]");
  const count = screen.getByRole("grid").getAttribute("aria-rowcount");
  expect(announced(container)).toBe(`${row?.getAttribute("aria-rowindex")}/${count}`);
});

test("a row moved straight after tabbing in keeps the active cell, so arrows go on from it", async () => {
  const user = userEvent.setup();
  render(
    <>
      <button>before</button>
      <MovableRows />
    </>,
  );
  screen.getByRole("button", { name: "before" }).focus();
  await user.tab();

  await user.keyboard("{Alt>}{Shift>}{ArrowDown}{/Shift}{/Alt}");
  await user.keyboard("{ArrowDown}");

  expect(document.activeElement).toHaveProperty("textContent", "R3C1");
});

test("Escape dismisses an open cell tooltip", async () => {
  const user = userEvent.setup();
  const fixture = createFixture(3, 2);
  render(
    <DataGrid
      {...fixture}
      defaultCell={{ tooltip: "More about this cell" }}
      aria-label="Tooltips"
    />,
  );

  await user.click(screen.getByRole("gridcell", { name: "R1C1" }));
  await screen.findByRole("tooltip");
  await user.keyboard("{Escape}");

  await vi.waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
});
