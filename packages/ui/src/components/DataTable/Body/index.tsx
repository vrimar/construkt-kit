import { Box } from "@construkt-kit/styled-system/jsx";
import React, { useEffect } from "react";

import { LoadingOverlay } from "../../LoadingOverlay";
import { ScrollArea } from "../../ScrollArea";
import { useDataTableContext } from "../context";
import { DataTableEmptyState } from "../EmptyState";
import type { DataTableInstance, DataTableRow } from "../types";
import { BodyCell } from "./BodyCell";

interface DataTableBodyProps<TData extends object> {
  table: DataTableInstance<TData>;
  renderSubRow?: (row: DataTableRow<TData>) => React.ReactNode;
}

export const DataTableBody = <TData extends object>({
  table,
  renderSubRow,
}: DataTableBodyProps<TData>) => {
  const { loading, onRowClick, onRowKeyDown, getRowProps } = useDataTableContext<TData>();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const page = table.state.pagination.pageIndex;
  const hasEmptyMessage = rows.length === 0 && !loading;

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [page]);

  return (
    <ScrollArea
      flex="1"
      minHeight="0"
      py="2"
      ref={scrollRef}
    >
      <LoadingOverlay isActive={loading} />
      {hasEmptyMessage && <DataTableEmptyState layout="fill" />}
      {rows.map((row) => {
        return (
          <React.Fragment key={row.id}>
            <Box
              display="flex"
              paddingX="2"
              width="100%"
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
    </ScrollArea>
  );
};
