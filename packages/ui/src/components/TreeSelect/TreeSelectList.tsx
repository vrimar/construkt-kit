import { ChevronDownIcon, ChevronRightIcon, SquareCheckIcon, SquareIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Box, Flex } from "styled-system/jsx";
import { IconButton } from "../Buttons";
import { Text } from "../Text";

import { Checkbox } from "../Checkbox";
import { SearchInput } from "../Input/SearchInput";
import { ScrollArea } from "../ScrollArea";
import { Tooltip } from "../Tooltip";

export interface TreeSelectGroup<T> {
  id: string | number;
  name: string;
  children: T[];
}

export interface TreeSelectListProps<T> {
  groups: TreeSelectGroup<T>[];
  selected: (string | number)[];
  onSelectedChange: (ids: (string | number)[]) => void;
  getId: (item: T) => string | number;
  getLabel: (item: T) => string;
  searchPlaceholder?: string;
  showCheckboxes?: boolean;
  showToggleAll?: boolean;
  renderItem?: (item: T) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  onGroupSelect?: (group: TreeSelectGroup<T>) => void;
  renderGroupLabel?: (group: TreeSelectGroup<T>) => React.ReactNode;
  renderGroupActions?: (group: TreeSelectGroup<T>) => React.ReactNode;
}

export const TreeSelectList = <T,>({
  groups,
  selected,
  onSelectedChange,
  getId,
  getLabel,
  searchPlaceholder = "Search...",
  showCheckboxes = true,
  showToggleAll = true,
  renderItem,
  renderActions,
  onGroupSelect,
  renderGroupLabel,
  renderGroupActions,
}: TreeSelectListProps<T>) => {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string | number>>(new Set());

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const allItemIds = useMemo(() => groups.flatMap((g) => g.children.map(getId)), [groups, getId]);

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    const query = search.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        children: group.children.filter((item) => getLabel(item).toLowerCase().includes(query)),
      }))
      .filter((group) => group.children.length > 0 || group.name.toLowerCase().includes(query));
  }, [groups, search, getLabel]);

  const allSelected = allItemIds.length > 0 && allItemIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allItemIds.some((id) => selectedSet.has(id));

  const toggleAll = () => {
    if (allSelected) {
      onSelectedChange([]);
    } else {
      onSelectedChange(allItemIds);
    }
  };

  const isGroupSelected = (group: TreeSelectGroup<T>) =>
    group.children.length > 0 && group.children.every((item) => selectedSet.has(getId(item)));

  const isGroupIndeterminate = (group: TreeSelectGroup<T>) =>
    !isGroupSelected(group) && group.children.some((item) => selectedSet.has(getId(item)));

  const toggleGroup = (group: TreeSelectGroup<T>) => {
    const groupIds = group.children.map(getId);
    if (isGroupSelected(group)) {
      onSelectedChange(selected.filter((id) => !groupIds.includes(id)));
    } else {
      const newIds = groupIds.filter((id) => !selectedSet.has(id));
      onSelectedChange([...selected, ...newIds]);
    }
  };

  const toggleItem = (item: T) => {
    const id = getId(item);
    if (selectedSet.has(id)) {
      onSelectedChange(selected.filter((s) => s !== id));
    } else {
      onSelectedChange([...selected, id]);
    }
  };

  const toggleCollapse = (groupId: string | number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <Flex
      direction="column"
      height="100%"
    >
      <Flex
        borderBottom="1px solid"
        borderColor="border"
        align="center"
      >
        <Box flex="1">
          <SearchInput
            size="sm"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            variant="plain"
          />
        </Box>
        {showToggleAll && showCheckboxes && (
          <Tooltip content={allSelected ? "Deselect all" : "Select all"}>
            <IconButton
              aria-label={allSelected ? "Deselect all" : "Select all"}
              size="xs"
              variant="plain"
              color="fg.muted"
              mr="1"
              flexShrink={0}
              onClick={toggleAll}
            >
              {allSelected || someSelected ? <SquareCheckIcon /> : <SquareIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Flex>

      <ScrollArea
        flex="1"
        px="3"
      >
        {filteredGroups.map((group) => {
          const isCollapsed = collapsed.has(group.id);
          return (
            <Box key={group.id}>
              <Flex
                px="3"
                py="1.5"
                align="center"
                gap="1"
                cursor="pointer"
                _hover={{ bg: "bg.muted" }}
                onClick={() => {
                  if (onGroupSelect) {
                    onGroupSelect(group);
                  } else {
                    toggleCollapse(group.id);
                  }
                }}
              >
                {showCheckboxes && (
                  <Checkbox
                    size="sm"
                    checked={isGroupIndeterminate(group) ? "indeterminate" : isGroupSelected(group)}
                    onCheckedChange={() => toggleGroup(group)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                )}

                <Box
                  color="fg.muted"
                  fontSize="xs"
                  flexShrink={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(group.id);
                  }}
                >
                  {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                </Box>

                <Box
                  flex="1"
                  minWidth="0"
                >
                  {renderGroupLabel ? (
                    renderGroupLabel(group)
                  ) : (
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      truncate
                    >
                      {group.name}
                    </Text>
                  )}
                </Box>

                {renderGroupActions && <Box flexShrink={0}>{renderGroupActions(group)}</Box>}
              </Flex>

              {!isCollapsed &&
                group.children.map((item) => {
                  const id = getId(item);
                  const isSelected = selectedSet.has(id);
                  return (
                    <Flex
                      key={id}
                      px="3"
                      py="1.5"
                      pl={showCheckboxes ? "7" : "8"}
                      align="center"
                      gap="2"
                      cursor="pointer"
                      bg={isSelected && !showCheckboxes ? "bg.subtle" : undefined}
                      _hover={{ bg: "bg.muted" }}
                      onClick={() => {
                        if (showCheckboxes) {
                          toggleItem(item);
                        } else {
                          onSelectedChange([id]);
                        }
                      }}
                    >
                      {showCheckboxes && (
                        <Checkbox
                          size="sm"
                          checked={isSelected}
                          onCheckedChange={() => toggleItem(item)}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                      )}
                      <Box
                        flex="1"
                        minWidth="0"
                      >
                        {renderItem ? (
                          renderItem(item)
                        ) : (
                          <Text
                            fontSize="sm"
                            truncate
                          >
                            {getLabel(item)}
                          </Text>
                        )}
                      </Box>
                      {renderActions && <Box flexShrink={0}>{renderActions(item)}</Box>}
                    </Flex>
                  );
                })}
            </Box>
          );
        })}
      </ScrollArea>
    </Flex>
  );
};
