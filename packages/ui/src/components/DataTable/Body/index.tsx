import { Box } from "@construkt-kit/styled-system/jsx";
import React, { type CSSProperties, useEffect } from "react";

import { LoadingOverlay } from "../../LoadingOverlay";
import { ScrollArea } from "../../ScrollArea";
import { columnTemplateVar, getColumnTemplate, gridRowStyle } from "../columnTemplate";
import { useDataTableContext } from "../context";
import { DataTableEmptyState } from "../EmptyState";
import { DataTableHeader } from "../Header";
import { type DataTableInstance, type DataTableRow, dataTableClasses } from "../types";
import { BodyCell } from "./BodyCell";

interface DataTableBodyProps<TData extends object> {
  table: DataTableInstance<TData>;
  showFiltersRow?: boolean;
  renderSubRow?: (row: DataTableRow<TData>) => React.ReactNode;
}

export const DataTableBody = <TData extends object>({
  table,
  showFiltersRow,
  renderSubRow,
}: DataTableBodyProps<TData>) => {
  const { loading, onRowClick, onRowKeyDown, getRowProps } = useDataTableContext<TData>();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const page = table.state.pagination.pageIndex;
  const hasEmptyMessage = rows.length === 0 && !loading;
  const columnTemplate = getColumnTemplate(table.getVisibleLeafColumns());

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [page]);

  return (
    <ScrollArea
      flex="1"
      minHeight="0"
      ref={scrollRef}
      // flexShrink 0: the sticky header's containing block must span the whole scroll extent.
      contentProps={{
        role: "table",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        flexShrink: "0",
        style: { [columnTemplateVar]: columnTemplate } as CSSProperties,
      }}
    >
      <DataTableHeader
        table={table}
        showFiltersRow={showFiltersRow}
      />
      <Box
        role="rowgroup"
        position="relative"
        flex="1"
        minWidth="min-content"
        py="2"
      >
        <LoadingOverlay
          isActive={loading}
          top="0"
        />
        {hasEmptyMessage && <DataTableEmptyState layout="fill" />}
        {rows.map((row) => {
          return (
            <React.Fragment key={row.id}>
              <Box
                role="row"
                className={dataTableClasses.row}
                display="grid"
                paddingX="2"
                style={gridRowStyle}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick && ((e) => onRowClick(e, row))}
                onKeyDown={onRowKeyDown && ((e) => onRowKeyDown(e, row))}
                borderBottomWidth="1px"
                borderBottomColor="border"
                cursor={onRowClick ? "pointer" : undefined}
                _last={{
                  borderBottom: "none",
                }}
                _hover={{
                  bg: "bg.subtle",
                }}
                {...getRowProps?.(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <BodyCell
                    key={cell.id}
                    cell={cell}
                  />
                ))}
              </Box>

              {row.getIsExpanded() && renderSubRow && renderSubRow(row)}
            </React.Fragment>
          );
        })}
      </Box>
    </ScrollArea>
  );
};
