import { Box } from "@construkt-kit/styled-system/jsx";
import React, { type CSSProperties, useEffect } from "react";

import { ScrollArea } from "../../ScrollArea";
import { columnTemplateVar, getColumnTemplate } from "../columnTemplate";
import { useDataTableContext } from "../context";
import { DataTableStatus } from "../EmptyState";
import { DataTableGridRow } from "../GridRow";
import { DataTableHeader } from "../Header";
import type { DataTableInstance, DataTableRow } from "../types";
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
  const { getRowInteractionProps } = useDataTableContext<TData>();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const page = table.state.pagination.pageIndex;
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
        display="flex"
        flexDirection="column"
        flex="1"
        minWidth="min-content"
        py="2"
      >
        <DataTableStatus
          layout="fill"
          isEmpty={rows.length === 0}
        />
        {rows.map((row) => {
          return (
            <React.Fragment key={row.id}>
              <DataTableGridRow
                _last={{
                  borderBottom: "none",
                }}
                _hover={{
                  bg: "bg.subtle",
                }}
                {...getRowInteractionProps(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <BodyCell
                    key={cell.id}
                    cell={cell}
                  />
                ))}
              </DataTableGridRow>

              {row.getIsExpanded() && renderSubRow && renderSubRow(row)}
            </React.Fragment>
          );
        })}
      </Box>
    </ScrollArea>
  );
};
