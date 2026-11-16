import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { DataGrid } from "./DataGrid";
import type { DataGridProps } from "./types";

test("a merged cell grows when a row it covers is resized", () => {
  const props: DataGridProps<{ id: string }> = {
    rows: Array.from({ length: 10 }, (_, i) => ({ id: String(i) })),
    getRowId: (row) => row.id,
    columnDefs: [
      {
        id: "merged",
        getValue: (row) => `Row ${row.id}`,
        rowSpan: (row) => (row.id === "0" ? 3 : 1),
      },
    ],
    "aria-label": "Spans",
  };
  const height = () =>
    Number.parseFloat(
      screen.getByText("Row 0").closest<HTMLElement>("[role=gridcell]")?.style.height ?? "",
    );
  const { rerender } = render(<DataGrid {...props} />);
  const before = height();

  rerender(
    <DataGrid
      {...props}
      rowSizing={{ "1": 200 }}
    />,
  );

  expect(height()).toBe((before / 3) * 2 + 200);
});
