import type { BoxProps } from "@chakra-ui/react";
import { Box, Stack, Text } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { Virtuoso } from "react-virtuoso";

import { SearchInput } from "../Input";
import { LoadingOverlay } from "../LoadingOverlay";
import { ScrollArea } from "../ScrollArea";
import { SelectListItem } from "./SelectListItem";

export type SelectValue = string | number;

export interface SelectListProps<T, V extends SelectValue> {
  items: readonly T[];
  selected: (V | undefined) | V[];
  onSelect: (item: T) => unknown;
  getValue: (item: T) => V;
  getLabel: (item: T) => string;
  renderLabel?: (item: T) => React.ReactNode;
  searchPlaceholder?: string;
  searchable?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => unknown;
  searchFilter?: (item: T, query: string) => boolean;
  renderActions?: (item: T) => React.ReactNode;
  onOpenChange?: (value: boolean) => unknown;
  contentProps?: BoxProps;
  activeItemStyle?: "checkmark" | "none";
  isLoading?: boolean;
  virtual?: boolean;
}

export const SelectList = <T, V extends SelectValue>({
  items,
  getValue,
  getLabel,
  renderLabel,
  onSelect,
  selected,
  searchable = true,
  searchQuery,
  onSearchQueryChange,
  searchFilter,
  renderActions,
  searchPlaceholder = "Search...",
  contentProps,
  activeItemStyle = "checkmark",
  isLoading,
  virtual,
}: SelectListProps<T, V>) => {
  const [scrollParent, setScrollParent] = useState<HTMLElement | undefined>();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebounceQuery] = useState(searchQuery ?? "");
  const [lastActiveIndex, setLastActiveIndex] = useState<number>(0);

  const selectedItems = useMemo(
    () => (selected == null ? [] : Array.isArray(selected) ? selected : [selected]),
    [selected],
  );

  const finalQuery = searchQuery != null ? searchQuery : query;

  const selectedById = useMemo(() => {
    const map = new Map<V, boolean>();
    selectedItems.forEach((id) => {
      map.set(id, true);
    });
    return map;
  }, [selectedItems]);

  const filteredItems = useMemo(() => {
    if (!finalQuery) return items;
    return items.filter((item) => {
      const lowercaseQuery = finalQuery.toLowerCase();
      return searchFilter
        ? searchFilter(item, lowercaseQuery)
        : getLabel(item).toLowerCase().includes(lowercaseQuery);
    });
  }, [items, finalQuery, searchFilter, getLabel]);

  const handleShiftSelect = (index: number) => {
    const beginIndex = index > lastActiveIndex ? lastActiveIndex + 1 : index;
    const endIndex = index > lastActiveIndex ? index + 1 : lastActiveIndex;

    for (let i = beginIndex; i < endIndex; i++) {
      const sibling = filteredItems[i];
      onSelect(sibling);
    }
  };

  const handleSelect = (item: T, index: number, e: React.MouseEvent<HTMLDivElement>) => {
    const mouseEvent = e.nativeEvent as MouseEvent;

    if (mouseEvent.shiftKey) handleShiftSelect(index);
    else onSelect(item);
    setLastActiveIndex(index);
  };

  const handleQueryChange = (value: string) => {
    if (searchQuery !== null && onSearchQueryChange) onSearchQueryChange(value);
    else setQuery(value);
  };

  useDebounce(() => handleQueryChange(debouncedQuery), 500, [debouncedQuery]);

  const hasEmptyMessage = !isLoading && filteredItems.length === 0;

  return (
    <Stack
      gap="0"
      height="100%"
      width="100%"
      flex="1"
    >
      {searchable && (
        <SearchInput
          autoFocus
          variant="flushed"
          width="100%"
          placeholder={searchPlaceholder}
          borderBottomWidth="1px"
          borderBottomColor="border"
          value={debouncedQuery}
          onChange={(e) => setDebounceQuery(e.target.value)}
          onClear={() => {
            setDebounceQuery("");
            handleQueryChange("");
          }}
        />
      )}
      <Box
        display="flex"
        maxHeight="320px"
        width="100%"
        p="2"
        {...contentProps}
      >
        <LoadingOverlay isActive={isLoading ? true : false} />
        {hasEmptyMessage && (
          <Box
            display="flex"
            flex="1"
            minWidth="100%"
            minHeight="100%"
            alignContent="center"
            justifyContent="center"
            p="1"
          >
            <Text width="100%">No items available</Text>
          </Box>
        )}
        <ScrollArea
          width="100%"
          ref={setScrollParent as any}
        >
          {virtual ? (
            <Virtuoso
              data={filteredItems}
              itemContent={(itemIndex, item) => {
                const isSelected = selectedById.has(getValue(item));
                const itemValue = getValue(item);

                return (
                  <SelectListItem
                    key={itemValue}
                    isSelected={isSelected}
                    item={item}
                    renderLabel={renderLabel || getLabel}
                    onSelect={(item, e) => handleSelect(item, itemIndex, e)}
                    activeItemStyle={activeItemStyle}
                    renderActions={renderActions}
                  />
                );
              }}
              customScrollParent={scrollParent}
            />
          ) : (
            <Box maxWidth="100%">
              {filteredItems.map((item, itemIndex) => {
                const isSelected = selectedById.has(getValue(item));
                const itemValue = getValue(item);

                return (
                  <SelectListItem
                    key={itemValue}
                    isSelected={isSelected}
                    item={item}
                    renderLabel={renderLabel || getLabel}
                    onSelect={(item, e) => handleSelect(item, itemIndex, e)}
                    activeItemStyle={activeItemStyle}
                    renderActions={renderActions}
                  />
                );
              })}
            </Box>
          )}
        </ScrollArea>
      </Box>
    </Stack>
  );
};
