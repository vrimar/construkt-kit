import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import { DataGrid } from "./DataGrid";
import type { EntitySelection } from "./types";

interface Row {
  id: string;
  label: string;
}

const rows: Row[] = [
  { id: "1", label: "Gender" },
  { id: "2", label: "Region" },
];

test("F2 edits a label with its text selected; Enter commits once, Escape commits nothing", async () => {
  const user = userEvent.setup();
  const onCellsChange = vi.fn();
  render(
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      columnDefs={[{ id: "label", field: "label", rowHeader: true, cell: { editable: true } }]}
      onCellsChange={onCellsChange}
      aria-label="Labels"
    />,
  );

  await user.click(screen.getByRole("rowheader", { name: "Gender" }));
  await user.keyboard("{F2}");
  const editor = screen.getByRole<HTMLInputElement>("textbox");
  expect([editor.selectionStart, editor.selectionEnd]).toEqual([0, "Gender".length]);
  await user.keyboard("Sex{Enter}");
  await user.keyboard("{F2}");
  await user.keyboard("Ignored{Escape}");

  expect(onCellsChange.mock.calls).toEqual([
    [[{ rowId: "1", columnId: "label", row: rows[0], value: "Sex", previousValue: "Gender" }]],
  ]);
});

test("Tab in the editor commits, then runs the keymap's Tab binding", async () => {
  const user = userEvent.setup();
  const onCellsChange = vi.fn();
  render(
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      columnDefs={[
        { id: "label", field: "label", rowHeader: true, cell: { editable: true } },
        { id: "note", header: "Note" },
      ]}
      keymap={{ Tab: "moveDown" }}
      onCellsChange={onCellsChange}
      aria-label="Labels"
    />,
  );

  await user.click(screen.getByRole("rowheader", { name: "Gender" }));
  await user.keyboard("{F2}Sex{Tab}");

  expect(onCellsChange).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(screen.getByRole("rowheader", { name: "Region" }));
});

test("double-clicking a header renames it and leaves the selection as it was", async () => {
  const user = userEvent.setup();
  const onHeaderRename = vi.fn();
  const changes: (EntitySelection | null)[] = [];
  render(
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      columnDefs={[
        { id: "a", header: "Base", headerEditable: true },
        { id: "b", header: "Total" },
      ]}
      defaultSelection={{ kind: "columns", ids: ["b"] }}
      onSelectionChange={(selection) => changes.push(selection)}
      onHeaderRename={onHeaderRename}
      aria-label="Headers"
    />,
  );

  await user.dblClick(screen.getByRole("columnheader", { name: "Base" }));
  await user.keyboard("Weighted base{Enter}");

  expect(changes.at(-1)).toEqual({ kind: "columns", ids: ["b"] });
  expect(onHeaderRename).toHaveBeenCalledWith({ columnId: "a", name: "Weighted base" });
});
