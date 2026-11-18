import { Checkbox } from "@construkt-kit/ui";
import type { MouseEvent } from "react";

import type { RowId } from "../core/rows/rowNode";
import type { RowSelectionState } from "../core/selection/controller";
import { useRowStateCore } from "./context";
import type { ColumnDef } from "./types";

export const SELECTION_COLUMN_ID = "data-grid:select";

const checkedState = (state: RowSelectionState) => (state === "mixed" ? "indeterminate" : state);

export function selectionColumn<TRow>(labels: {
  selectRow: string;
  selectAllRows: string;
}): ColumnDef<TRow> {
  return {
    id: SELECTION_COLUMN_ID,
    pinned: "left",
    width: 44,
    minWidth: 44,
    maxWidth: 44,
    resizable: false,
    selectable: false,
    reorderable: false,
    header: () => <SelectAllCheckbox label={labels.selectAllRows} />,
    cell: {
      render: ({ rowId }) => (
        <RowCheckbox
          rowId={rowId}
          label={labels.selectRow}
        />
      ),
    },
  };
}

function SelectAllCheckbox({ label }: { label: string }) {
  const core = useRowStateCore();
  if (core.selection.mode !== "multiple") return null;
  const state = core.selection.allRowsState();
  return (
    <Checkbox
      size="sm"
      aria-label={label}
      inputProps={{ tabIndex: -1 }}
      checked={checkedState(state)}
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        core.selection.selectAllRows(state !== true);
        core.selection.end();
      }}
    />
  );
}

function RowCheckbox({ rowId, label }: { rowId: RowId; label: string }) {
  const core = useRowStateCore();
  const node = core.sourceNode(rowId);
  if (!node || core.selection.mode === "none") return null;
  return (
    <Checkbox
      size="sm"
      aria-label={label}
      inputProps={{ tabIndex: -1 }}
      checked={checkedState(core.selection.rowState(node))}
      disabled={!core.selection.isRowSelectable(node)}
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        core.selection.select("rows", rowId, event.shiftKey ? "range" : "toggle");
        core.selection.end();
      }}
    />
  );
}
