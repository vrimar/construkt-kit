import React, { type CSSProperties, useLayoutEffect, useRef } from "react";

import { Box } from "#styled-system/jsx";

import { ScrollArea } from "../../ScrollArea";
import { columnTemplateVar, getColumnTemplate } from "../columnTemplate";
import { useDataTableContext } from "../context";
import { DataTableStatus, viewportWidthVar } from "../EmptyState";
import { DataTableHeader } from "../Header";
import { GridBody, GridRoot, GridRow } from "../parts";
import type { DataTableInstance, DataTableRow } from "../types";
import { useScrollTopOnPage } from "../useScrollTopOnPage";
import { BodyCell } from "./BodyCell";

interface DataTableBodyProps<TData extends object> {
  table: DataTableInstance<TData>;
  showFiltersRow?: boolean;
  renderSubRow?: (row: DataTableRow<TData>) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export const DataTableBody = <TData extends object>({
  table,
  showFiltersRow,
  renderSubRow,
  emptyState,
}: DataTableBodyProps<TData>) => {
  const { getRowInteractionProps, columnSizing, gridRef, loading } = useDataTableContext<TData>();
  const scrollRef = useScrollTopOnPage(table);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const statusShown = loading || rows.length === 0;
  const columnTemplate = getColumnTemplate(table.getVisibleLeafColumns(), columnSizing);

  useLayoutEffect(() => {
    const viewport = scrollRef.current;
    const body = bodyRef.current;
    if (!viewport || !body) return;
    const observer = new ResizeObserver(() =>
      body.style.setProperty(viewportWidthVar, `${viewport.clientWidth}px`),
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [scrollRef]);

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
        {/* Isolated so the loading overlay's z-index can't lift it over the sticky head. */}
        <GridBody
          ref={bodyRef}
          position="relative"
          isolation="isolate"
          display="flex"
          flexDirection="column"
          flex="1"
          minWidth="min-content"
          py="2"
        >
          <Box
            role={statusShown ? "row" : undefined}
            display="contents"
          >
            <Box
              role={statusShown ? "cell" : undefined}
              display="contents"
            >
              <DataTableStatus
                layout="fill"
                isEmpty={rows.length === 0}
                emptyState={emptyState}
              />
            </Box>
          </Box>
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
