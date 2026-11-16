import { flexRender } from "@tanstack/react-table";
import { useId, useLayoutEffect, useRef, useState } from "react";

import { Box } from "#styled-system/jsx";

import { Text } from "../../Text";
import { useDataTableContext } from "../context";
import { GridHeader } from "../parts";
import type { DataTableHeader } from "../types";
import { getColumnLabel } from "./columnLabel";
import { ColumnResizeHandle } from "./ColumnResizeHandle";
import { ColumnSorter, columnSorterGutter } from "./ColumnSorter";

interface HeaderCellProps<TData extends object> {
  header: DataTableHeader<TData>;
}

export const DataTableHeaderCell = <TData extends object>({ header }: HeaderCellProps<TData>) => {
  const labelId = useId();
  const labelRef = useRef<HTMLParagraphElement>(null);
  // A display column's default header renders nothing, so emptiness shows only once rendered.
  const [labelEmpty, setLabelEmpty] = useState(false);
  const { resizeColumn } = useDataTableContext<TData>();
  const { column, colSpan, isPlaceholder } = header;
  const label = column.columnDef.header;
  useLayoutEffect(() => {
    setLabelEmpty(!labelRef.current?.textContent?.trim());
  }, [label]);
  const resize =
    !isPlaceholder && header.subHeaders.length === 0 && column.columnDef.meta?.resizable !== false
      ? resizeColumn
      : undefined;
  const sortable = column.getCanSort();
  const sort = column.getIsSorted();
  const ariaSort = sort
    ? sort === "asc"
      ? "ascending"
      : "descending"
    : sortable
      ? "none"
      : undefined;

  // The sorter is out of flow: without this reservation it would overlap a full-width label.
  const labelMaxWidth = sortable ? `calc(100% - ${columnSorterGutter}px)` : "100%";

  return (
    <GridHeader
      aria-sort={isPlaceholder ? undefined : ariaSort}
      aria-labelledby={isPlaceholder || labelEmpty ? undefined : labelId}
      aria-label={!isPlaceholder && labelEmpty ? getColumnLabel(header) : undefined}
      aria-colspan={colSpan > 1 ? colSpan : undefined}
      display="flex"
      alignItems="center"
      borderRightWidth="1px"
      borderRightColor="border"
      overflow="hidden"
      userSelect="none"
      position={resize ? "relative" : undefined}
      style={{ gridColumn: `span ${colSpan}` }}
    >
      {!isPlaceholder && (
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          minWidth="0"
          style={{ maxWidth: labelMaxWidth }}
        >
          <Text
            ref={labelRef}
            id={labelId}
            truncate
            title={typeof label === "string" ? label : undefined}
          >
            {flexRender(label, header.getContext())}
          </Text>
          <ColumnSorter header={header} />
        </Box>
      )}
      {resize && (
        <ColumnResizeHandle
          header={header}
          resizeColumn={resize}
        />
      )}
    </GridHeader>
  );
};
