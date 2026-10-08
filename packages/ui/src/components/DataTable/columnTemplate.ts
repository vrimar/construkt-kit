import type { CSSProperties } from "react";

import type { DataTableColumnDef } from "./types";

const DEFAULT_MIN_COLUMN_WIDTH = 120;

export const columnTemplateVar = "--data-table-columns";

export const gridRowStyle: CSSProperties = {
  gridTemplateColumns: `var(${columnTemplateVar})`,
  minWidth: "min-content",
};

type ColumnLike<TData extends object> = {
  columnDef: Pick<DataTableColumnDef<TData>, "meta">;
};

export const getColumnTemplate = <TData extends object>(columns: ColumnLike<TData>[]) =>
  columns
    .map(({ columnDef: { meta } }) =>
      meta?.width
        ? `${meta.width}px`
        : `minmax(${meta?.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH}px, 1fr)`,
    )
    .join(" ");
