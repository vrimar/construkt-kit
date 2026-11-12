import type { CSSProperties } from "react";

import type { DataTableColumnDef, DataTableColumnSizing } from "./types";

const DEFAULT_MIN_COLUMN_WIDTH = 120;

export const MIN_RESIZED_COLUMN_WIDTH = 56;

export const columnTemplateVar = "--data-table-columns";

export const gridRowStyle: CSSProperties = {
  gridTemplateColumns: `var(${columnTemplateVar})`,
  minWidth: "min-content",
};

type ColumnLike<TData extends object> = {
  id: string;
  columnDef: Pick<DataTableColumnDef<TData>, "meta">;
};

export const getColumnTemplate = <TData extends object>(
  columns: ColumnLike<TData>[],
  sizing: DataTableColumnSizing = {},
) =>
  columns
    .map(({ id, columnDef: { meta } }) => {
      const size = sizing[id];
      if (size !== undefined) return `${size}px`;
      return meta?.width
        ? `${meta.width}px`
        : `minmax(${meta?.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH}px, 1fr)`;
    })
    .join(" ");
