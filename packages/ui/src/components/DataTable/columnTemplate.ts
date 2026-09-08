import type { CSSProperties } from "react";

import type { DataTableColumnDef } from "./types";

export const DEFAULT_MIN_COLUMN_WIDTH = 120;

export const columnTemplateVar = "--data-table-columns";

export const gridRowStyle: CSSProperties = {
  gridTemplateColumns: `var(${columnTemplateVar})`,
  minWidth: "min-content",
};

type ColumnLike<TData extends object> = {
  columnDef: Pick<DataTableColumnDef<TData>, "size" | "minSize" | "meta">;
};

export const getColumnTemplate = <TData extends object>(columns: ColumnLike<TData>[]) =>
  columns
    .map(({ columnDef }) => {
      const width = columnDef.meta?.width ?? columnDef.size;
      if (width) return `${width}px`;
      const minWidth = columnDef.meta?.minWidth ?? columnDef.minSize ?? DEFAULT_MIN_COLUMN_WIDTH;
      return `minmax(${minWidth}px, 1fr)`;
    })
    .join(" ");
