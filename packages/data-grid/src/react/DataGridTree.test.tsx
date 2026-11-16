import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { DataGrid } from "./DataGrid";

test("Enter on a parent row collapses it and its row reports aria-expanded false", async () => {
  const user = userEvent.setup();
  const rows = [
    { id: "A", label: "Alpha" },
    { id: "a1", parent: "A", label: "Alpha one" },
    { id: "B", label: "Beta" },
  ];
  render(
    <>
      <button>before</button>
      <DataGrid
        rows={rows}
        getRowId={(row) => row.id}
        getParentId={(row) => row.parent}
        defaultExpandedRowIds={["A"]}
        columnDefs={[{ id: "label", field: "label", rowHeader: true }]}
        aria-label="Tree"
      />
    </>,
  );
  screen.getByRole("button", { name: "before" }).focus();
  await user.tab();

  await user.keyboard("{Enter}");

  expect(screen.getByRole("row", { name: /Alpha/ }).getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByText("Alpha one")).toBeNull();
});
