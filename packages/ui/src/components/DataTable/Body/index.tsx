import React, { type CSSProperties } from "react";

import { ScrollArea } from "../../ScrollArea";
import { columnTemplateVar, getColumnTemplate } from "../columnTemplate";
import { useDataTableContext } from "../context";
import { DataTableStatus } from "../EmptyState";
import { DataTableHeader } from "../Header";
import { GridBody, GridRoot, GridRow } from "../parts";
import type { DataTableInstance, DataTableRow } from "../types";
import { useScrollTopOnPage } from "../useScrollTopOnPage";
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
  const { getRowInteractionProps, columnSizing, gridRef } = useDataTableContext<TData>();
  const scrollRef = useScrollTopOnPage(table);
  const rows = table.getRowModel().rows;
  const columnTemplate = getColumnTemplate(table.getVisibleLeafColumns(), columnSizing);

  return (
    <GridRoot
      ref={gridRef}
      size="sm"
      interactive
      stickyHeader
      display="flex"
      flexDirection="column"
      flex="1"
      minHeight="0"
      style={{ [columnTemplateVar]: columnTemplate } as CSSProperties}
    >
      <ScrollArea
        flex="1"
        minHeight="0"
        ref={scrollRef}
        // flexShrink 0: the sticky header's containing block must span the whole scroll extent.
        contentCss={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          flexShrink: "0",
        }}
      >
        <DataTableHeader
          table={table}
          showFiltersRow={showFiltersRow}
        />
        <GridBody
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
          {rows.map((row) => (
            <React.Fragment key={row.id}>
              <GridRow
                css={{ "&[data-clickable]": { cursor: "pointer" } }}
                {...getRowInteractionProps(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <BodyCell
                    key={cell.id}
                    cell={cell}
                  />
                ))}
              </GridRow>

              {row.getIsExpanded() && renderSubRow && renderSubRow(row)}
            </React.Fragment>
          ))}
        </GridBody>
      </ScrollArea>
    </GridRoot>
  );
};
