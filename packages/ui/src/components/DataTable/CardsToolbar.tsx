import { parseDateRangeFilter, parseNumberFilter } from "@construkt-kit/utils";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { Box, HStack, Stack, styled } from "#styled-system/jsx";

import { Badge } from "../Badge";
import { Button, IconButton } from "../Buttons";
import { operatorSymbols } from "../NumberFilter/operators";
import { SegmentGroup } from "../SegmentGroup";
import { Sheet } from "../Sheet";
import { Text } from "../Text";
import { useDataTableContext } from "./context";
import { getColumnLabel, renderColumnLabel } from "./Header/columnLabel";
import { ColumnFilter } from "./Header/Filters/ColumnFilter";
import type { DataTableHeader, DataTableInstance } from "./types";

const columnName = <TData extends object>(header: DataTableHeader<TData>) =>
  renderColumnLabel(header) ?? getColumnLabel(header);

const getActiveValues = <TData extends object>(header: DataTableHeader<TData>) => {
  const value = header.column.getFilterValue();
  return Array.isArray(value) && value.length > 0 ? (value as string[]) : undefined;
};

const describeFilter = <TData extends object>(
  header: DataTableHeader<TData>,
  values: string[],
): string => {
  const { meta } = header.column.columnDef;
  const [first] = values;
  switch (meta?.type) {
    case "select":
      return values.map(meta.selectProps?.getItemLabel ?? ((item: string) => item)).join(", ");
    case "date":
      return parseDateRangeFilter(first)?.join(" – ") ?? first;
    case "number": {
      const filter = parseNumberFilter(first);
      if (!filter) return first;
      return filter.operator === "between"
        ? `${filter.value} – ${filter.to}`
        : `${operatorSymbols[filter.operator]} ${filter.value}`;
    }
    default:
      return first;
  }
};

interface SheetOptionProps {
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
}

const SheetOption = ({ active, onSelect, children }: SheetOptionProps) => (
  <styled.button
    type="button"
    role="radio"
    aria-checked={active}
    display="flex"
    alignItems="center"
    gap="3"
    minHeight="12"
    px="4"
    width="100%"
    textAlign="left"
    cursor="pointer"
    fontWeight={active ? "semibold" : undefined}
    borderBottomWidth="1px"
    borderBottomColor="border.muted"
    onClick={onSelect}
  >
    <Box
      flex="1"
      minWidth="0"
      truncate
    >
      {children}
    </Box>
    {active && (
      <Box
        color="colorPalette.fg"
        flexShrink="0"
      >
        <CheckIcon size={18} />
      </Box>
    )}
  </styled.button>
);

interface DataTableCardsToolbarProps<TData extends object> {
  table: DataTableInstance<TData>;
  headers: DataTableHeader<TData>[];
  showFilters: boolean;
}

export const DataTableCardsToolbar = <TData extends object>({
  table,
  headers,
  showFilters,
}: DataTableCardsToolbarProps<TData>) => {
  const { labels } = useDataTableContext();
  const [sheet, setSheet] = useState<"sort" | "filters" | null>(null);
  const closeSheet = () => setSheet(null);

  const filterable = showFilters ? headers.filter((header) => header.column.getCanFilter()) : [];
  const searchHeader = filterable.find(({ column: { columnDef } }) => {
    const meta = columnDef.meta;
    return meta?.card === "title" && (meta.type ?? "input") === "input";
  });
  const drawerHeaders = filterable.filter((header) => header !== searchHeader);
  const activeFilters = drawerHeaders.flatMap((header) => {
    const values = getActiveValues(header);
    return values ? [{ header, values }] : [];
  });
  const sortHeaders = headers.filter((header) => header.column.getCanSort());
  const sortedHeader = sortHeaders.find((header) => header.column.getIsSorted());
  const sortDirection = sortedHeader?.column.getIsSorted() || null;

  if (!searchHeader && drawerHeaders.length === 0 && sortHeaders.length === 0) return null;

  const SortIcon =
    sortDirection === "asc"
      ? ArrowUpIcon
      : sortDirection === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon;

  const resetDrawerFilters = () => {
    const drawerIds = new Set(drawerHeaders.map((header) => header.column.id));
    table.setColumnFilters((filters) => filters.filter((filter) => !drawerIds.has(filter.id)));
  };

  const doneButton = (
    <Button
      width="full"
      size="lg"
      colorPalette="brand"
      onClick={closeSheet}
    >
      {labels.done}
    </Button>
  );

  return (
    <Stack
      gap="2"
      px="3"
      pt="3"
      pb="2"
      flexShrink="0"
    >
      <HStack gap="2">
        <Box
          flex="1"
          minWidth="0"
        >
          {searchHeader && (
            <ColumnFilter
              header={searchHeader}
              layout="field"
            />
          )}
        </Box>
        {sortHeaders.length > 0 && (
          <IconButton
            variant="outline"
            colorPalette={sortedHeader ? "brand" : "neutral"}
            flexShrink="0"
            aria-label={
              sortedHeader ? `${labels.sortBy} ${getColumnLabel(sortedHeader)}` : labels.sort
            }
            onClick={() => setSheet("sort")}
          >
            <SortIcon />
          </IconButton>
        )}
        {drawerHeaders.length > 0 && (
          <IconButton
            variant="outline"
            colorPalette={activeFilters.length > 0 ? "brand" : "neutral"}
            position="relative"
            overflow="visible"
            flexShrink="0"
            aria-label={
              activeFilters.length > 0
                ? `${labels.filters} (${activeFilters.length})`
                : labels.filters
            }
            onClick={() => setSheet("filters")}
          >
            <SlidersHorizontalIcon />
            {activeFilters.length > 0 && (
              <Badge
                aria-hidden
                size="sm"
                variant="solid"
                colorPalette="brand"
                position="absolute"
                top="-1.5"
                right="-1.5"
                minWidth="4.5"
                justifyContent="center"
                borderRadius="full"
              >
                {activeFilters.length}
              </Badge>
            )}
          </IconButton>
        )}
      </HStack>

      {activeFilters.length > 0 && (
        <HStack
          gap="1.5"
          overflowX="auto"
          css={{ scrollbarWidth: "none" }}
        >
          {activeFilters.map(({ header, values }) => (
            <Button
              key={header.id}
              size="sm"
              variant="subtle"
              borderRadius="full"
              flexShrink="0"
              aria-label={`${labels.removeFilter} ${getColumnLabel(header)}`}
              onClick={() => header.column.setFilterValue(undefined)}
            >
              {getColumnLabel(header)}: {describeFilter(header, values)}
              <XIcon />
            </Button>
          ))}
        </HStack>
      )}

      {sortHeaders.length > 0 && (
        <Sheet.Root
          open={sheet === "sort"}
          onOpenChange={({ open }) => {
            if (!open) closeSheet();
          }}
        >
          <Sheet.Content>
            <Sheet.Header
              endElement={
                sortedHeader && (
                  <Button
                    variant="plain"
                    onClick={() => table.setSorting([])}
                  >
                    {labels.clearSort}
                  </Button>
                )
              }
            >
              <Sheet.Title>{labels.sortBy}</Sheet.Title>
            </Sheet.Header>
            <Sheet.Body
              p="0"
              pb="4"
            >
              <Stack
                role="radiogroup"
                aria-label={labels.sortBy}
                gap="0"
              >
                {sortHeaders.map((header) => (
                  <SheetOption
                    key={header.id}
                    active={!!header.column.getIsSorted()}
                    onSelect={() => header.column.toggleSorting(sortDirection === "desc")}
                  >
                    {getColumnLabel(header)}
                  </SheetOption>
                ))}
              </Stack>
              <Box
                px="4"
                pt="4"
              >
                <SegmentGroup.Root
                  width="full"
                  value={sortDirection}
                  disabled={!sortedHeader}
                  onValueChange={(details) =>
                    sortedHeader?.column.toggleSorting(details.value === "desc")
                  }
                >
                  <SegmentGroup.Indicator />
                  <SegmentGroup.Item
                    value="asc"
                    flex="1"
                  >
                    <SegmentGroup.ItemText>
                      <HStack gap="1.5">
                        <ArrowUpIcon />
                        {labels.ascending}
                      </HStack>
                    </SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item
                    value="desc"
                    flex="1"
                  >
                    <SegmentGroup.ItemText>
                      <HStack gap="1.5">
                        <ArrowDownIcon />
                        {labels.descending}
                      </HStack>
                    </SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
              </Box>
            </Sheet.Body>
            <Sheet.Footer
              borderTopWidth="1px"
              borderTopColor="border"
            >
              {doneButton}
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet.Root>
      )}

      {drawerHeaders.length > 0 && (
        <Sheet.Root
          open={sheet === "filters"}
          onOpenChange={({ open }) => {
            if (!open) closeSheet();
          }}
        >
          <Sheet.Content>
            <Sheet.Header
              endElement={
                activeFilters.length > 0 && (
                  <Button
                    variant="plain"
                    onClick={resetDrawerFilters}
                  >
                    {labels.resetFilters}
                  </Button>
                )
              }
            >
              <Sheet.Title>{labels.filters}</Sheet.Title>
            </Sheet.Header>
            <Sheet.Body
              p="0"
              pb="4"
            >
              <Stack
                gap="4"
                px="4"
                pt="2"
              >
                {drawerHeaders.map((header) => (
                  <Stack
                    key={header.id}
                    gap="1.5"
                  >
                    <Text
                      textStyle="sm"
                      fontWeight="medium"
                      color="fg.muted"
                    >
                      {columnName(header)}
                    </Text>
                    <ColumnFilter
                      header={header}
                      layout="field"
                    />
                  </Stack>
                ))}
              </Stack>
            </Sheet.Body>
            <Sheet.Footer
              borderTopWidth="1px"
              borderTopColor="border"
            >
              {doneButton}
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet.Root>
      )}
    </Stack>
  );
};
