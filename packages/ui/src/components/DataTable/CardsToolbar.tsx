import { CheckIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Box, HStack, Stack, styled } from "#styled-system/jsx";

import { Badge } from "../Badge";
import { Button, IconButton } from "../Buttons";
import { SegmentGroup } from "../SegmentGroup";
import { Sheet } from "../Sheet";
import { Text } from "../Text";
import { columnMeta, getFilterValues } from "./columns";
import { useDataTableContext } from "./context";
import { getColumnLabel, renderColumnLabel } from "./Header/columnLabel";
import { SortIcon } from "./Header/ColumnSorter";
import { ColumnFilter } from "./Header/Filters/ColumnFilter";
import { filterKinds } from "./Header/Filters/filterKinds";
import type { DataTableHeader, DataTableInstance } from "./types";

const columnName = <TData extends object>(header: DataTableHeader<TData>) =>
  renderColumnLabel(header) ?? getColumnLabel(header);

const describeFilter = <TData extends object>(
  header: DataTableHeader<TData>,
  values: string[],
): string => {
  const meta = columnMeta(header.column);
  return filterKinds[meta.type].describe(values, meta);
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

interface DraftSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  clearLabel: string;
  onClear: (() => void) | undefined;
  onDone: () => void;
  children: ReactNode;
}

const DraftSheet = ({
  open,
  onClose,
  title,
  clearLabel,
  onClear,
  onDone,
  children,
}: DraftSheetProps) => {
  const { labels } = useDataTableContext();

  return (
    <Sheet.Root
      open={open}
      onOpenChange={({ open: next }) => {
        if (!next) onClose();
      }}
    >
      <Sheet.Content>
        <Sheet.Header
          endElement={
            onClear && (
              <Button
                variant="plain"
                onClick={onClear}
              >
                {clearLabel}
              </Button>
            )
          }
        >
          <Sheet.Title>{title}</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body
          p="0"
          pb="4"
        >
          {children}
        </Sheet.Body>
        <Sheet.Footer
          borderTopWidth="1px"
          borderTopColor="border"
        >
          <Button
            width="full"
            size="lg"
            colorPalette="brand"
            onClick={onDone}
          >
            {labels.done}
          </Button>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  );
};

interface DataTableCardsToolbarProps<TData extends object> {
  table: DataTableInstance<TData>;
  headers: DataTableHeader<TData>[];
  showFilters: boolean;
}

type FilterDraft = Record<string, string[] | undefined>;

interface SortDraft {
  id: string;
  desc: boolean;
}

export const DataTableCardsToolbar = <TData extends object>({
  table,
  headers,
  showFilters,
}: DataTableCardsToolbarProps<TData>) => {
  const { labels } = useDataTableContext();
  const [sheet, setSheet] = useState<"sort" | "filters" | null>(null);
  const [sortDraft, setSortDraft] = useState<SortDraft | null>(null);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>({});
  const closeSheet = () => setSheet(null);

  const filterable = showFilters ? headers.filter((header) => header.column.getCanFilter()) : [];
  const searchHeader = filterable.find(({ column }) => {
    const meta = columnMeta(column);
    return meta.card === "title" && meta.type === "input";
  });
  const drawerHeaders = filterable.filter((header) => header !== searchHeader);
  const activeFilters = drawerHeaders.flatMap((header) => {
    const values = getFilterValues(header.column);
    return values.length > 0 ? [{ header, values }] : [];
  });
  const sortHeaders = headers.filter((header) => header.column.getCanSort());
  const [currentSort] = table.state.sorting;
  const sortedColumn =
    currentSort && table.getAllLeafColumns().find((column) => column.id === currentSort.id);
  const sortDirection = sortedColumn?.getIsSorted() ?? false;
  const appliedSort: SortDraft | null = sortedColumn
    ? { id: sortedColumn.id, desc: sortDirection === "desc" }
    : null;

  if (!searchHeader && drawerHeaders.length === 0 && sortHeaders.length === 0) return null;

  const openSort = () => {
    setSortDraft(appliedSort);
    setSheet("sort");
  };

  const applySort = () => {
    table.setSorting(sortDraft ? [sortDraft] : []);
    closeSheet();
  };

  const openFilters = () => {
    setFilterDraft(
      Object.fromEntries(
        drawerHeaders.map((header) => [header.column.id, getFilterValues(header.column)]),
      ),
    );
    setSheet("filters");
  };

  const applyFilters = () => {
    const drawerIds = new Set(drawerHeaders.map((header) => header.column.id));
    table.setColumnFilters((filters) => [
      ...filters.filter((filter) => !drawerIds.has(filter.id)),
      ...Object.entries(filterDraft).flatMap(([id, value]) =>
        value && value.length > 0 ? [{ id, value }] : [],
      ),
    ]);
    closeSheet();
  };

  const hasFilterDraft = Object.values(filterDraft).some((value) => value && value.length > 0);

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
            colorPalette={sortedColumn ? "brand" : "neutral"}
            flexShrink="0"
            aria-label={
              sortedColumn
                ? `${labels.sortBy} ${getColumnLabel({ column: sortedColumn })}`
                : labels.sort
            }
            onClick={openSort}
          >
            <SortIcon sort={sortDirection} />
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
            onClick={openFilters}
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
        <DraftSheet
          open={sheet === "sort"}
          onClose={closeSheet}
          title={labels.sortBy}
          clearLabel={labels.clearSort}
          onClear={sortDraft ? () => setSortDraft(null) : undefined}
          onDone={applySort}
        >
          <Stack
            role="radiogroup"
            aria-label={labels.sortBy}
            gap="0"
          >
            {sortHeaders.map((header) => (
              <SheetOption
                key={header.id}
                active={sortDraft?.id === header.column.id}
                onSelect={() =>
                  setSortDraft((draft) => ({
                    id: header.column.id,
                    desc: draft?.desc ?? false,
                  }))
                }
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
              value={sortDraft ? (sortDraft.desc ? "desc" : "asc") : null}
              disabled={!sortDraft}
              onValueChange={(details) =>
                setSortDraft((draft) => draft && { ...draft, desc: details.value === "desc" })
              }
            >
              <SegmentGroup.Indicator />
              <SegmentGroup.Item
                value="asc"
                flex="1"
              >
                <SegmentGroup.ItemText>
                  <HStack gap="1.5">
                    <SortIcon sort="asc" />
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
                    <SortIcon sort="desc" />
                    {labels.descending}
                  </HStack>
                </SegmentGroup.ItemText>
                <SegmentGroup.ItemHiddenInput />
              </SegmentGroup.Item>
            </SegmentGroup.Root>
          </Box>
        </DraftSheet>
      )}

      {drawerHeaders.length > 0 && (
        <DraftSheet
          open={sheet === "filters"}
          onClose={closeSheet}
          title={labels.filters}
          clearLabel={labels.resetFilters}
          onClear={hasFilterDraft ? () => setFilterDraft({}) : undefined}
          onDone={applyFilters}
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
                  draft={{
                    value: filterDraft[header.column.id],
                    onChange: (value) =>
                      setFilterDraft((draft) => ({ ...draft, [header.column.id]: value })),
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </DraftSheet>
      )}
    </Stack>
  );
};
