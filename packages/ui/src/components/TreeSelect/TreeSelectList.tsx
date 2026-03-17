import { createTreeCollection, useTreeView } from "@ark-ui/react/tree-view";
import { CheckIcon, MinusIcon, SquareCheckIcon, SquareIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Box, Flex } from "styled-system/jsx";
import { IconButton } from "../Buttons";

import { SearchInput } from "../Input/SearchInput";
import { ScrollArea } from "../ScrollArea";
import { Tooltip } from "../Tooltip";
import { TreeView } from "../Tree/TreeView";

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
  defaultCollapsed?: boolean;
  renderItem?: (item: T) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  onGroupSelect?: (group: TreeSelectGroup<T>) => void;
  renderGroupLabel?: (group: TreeSelectGroup<T>) => React.ReactNode;
  renderGroupActions?: (group: TreeSelectGroup<T>) => React.ReactNode;
}

interface SelectNode<T> {
  id: string;
  name: string;
  children?: SelectNode<T>[];
  _item?: T;
  _group?: TreeSelectGroup<T>;
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
  defaultCollapsed = false,
  renderItem,
  renderActions,
  onGroupSelect,
  renderGroupLabel,
  renderGroupActions,
}: TreeSelectListProps<T>) => {
  const [search, setSearch] = useState("");

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

  // Build tree collection + lookup maps
  const { collection, rootChildren, itemIdMap } = useMemo(() => {
    const itemIdMap = new Map<string, string | number>();

    const rootChildren: SelectNode<T>[] = filteredGroups.map((group) => ({
      id: `g-${group.id}`,
      name: group.name,
      _group: group,
      children: group.children.map((item) => {
        const originalId = getId(item);
        const treeId = `i-${originalId}`;
        itemIdMap.set(treeId, originalId);
        return { id: treeId, name: getLabel(item), _item: item };
      }),
    }));

    const collection = createTreeCollection<SelectNode<T>>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      rootNode: { id: "ROOT", name: "", children: rootChildren },
    });

    return { collection, rootChildren, itemIdMap };
  }, [filteredGroups, getId, getLabel]);

  // Selected → checkedValue mapping
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const checkedValue = useMemo(() => {
    const treeIds: string[] = [];
    for (const group of filteredGroups) {
      let allChildrenSelected = group.children.length > 0;
      for (const item of group.children) {
        const itemId = getId(item);
        if (selectedSet.has(itemId)) {
          treeIds.push(`i-${itemId}`);
        } else {
          allChildrenSelected = false;
        }
      }
      if (allChildrenSelected && group.children.length > 0) {
        treeIds.push(`g-${group.id}`);
      }
    }
    return treeIds;
  }, [selectedSet, filteredGroups, getId]);

  // Extract leaf IDs from tree checked change → original IDs
  const handleCheckedChange = (details: { checkedValue: string[] }) => {
    const newSelected = details.checkedValue
      .filter((id) => itemIdMap.has(id))
      .map((id) => itemIdMap.get(id)!);
    onSelectedChange(newSelected);
  };

  // Expanded state — keep full set, filter for current collection
  const [expandedValue, setExpandedValue] = useState<string[]>(() =>
    defaultCollapsed ? [] : groups.map((g) => `g-${g.id}`),
  );

  const filteredGroupIdSet = useMemo(
    () => new Set(filteredGroups.map((g) => `g-${g.id}`)),
    [filteredGroups],
  );

  const validExpandedValue = useMemo(
    () => expandedValue.filter((id) => filteredGroupIdSet.has(id)),
    [expandedValue, filteredGroupIdSet],
  );

  const handleExpandedChange = (details: { expandedValue: string[] }) => {
    setExpandedValue((prev) => {
      // Preserve expanded IDs for groups not in the current filtered set
      const preserved = prev.filter((id) => !filteredGroupIdSet.has(id));
      return [...preserved, ...details.expandedValue];
    });
  };

  // Toggle all (across ALL items, not just filtered)
  const allItemIds = useMemo(() => groups.flatMap((g) => g.children.map(getId)), [groups, getId]);
  const allSelected = allItemIds.length > 0 && allItemIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allItemIds.some((id) => selectedSet.has(id));

  const toggleAll = () => {
    onSelectedChange(allSelected ? [] : allItemIds);
  };

  const tree = useTreeView({
    collection,
    checkedValue: showCheckboxes ? checkedValue : undefined,
    onCheckedChange: showCheckboxes ? handleCheckedChange : undefined,
    expandedValue: validExpandedValue,
    onExpandedChange: handleExpandedChange,
  });

  return (
    <Flex
      direction="column"
      height="100%"
    >
      <Flex
        borderBottomWidth="1px"
        borderColor="border"
        align="center"
        mb="2"
      >
        <Box
          flex="1"
          px="2"
        >
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

      <TreeView.RootProvider
        value={tree as ReturnType<typeof useTreeView>}
        size="sm"
      >
        <ScrollArea
          flex="1"
          px="1"
        >
          <TreeView.Tree>
            {rootChildren.map((groupNode, groupIndex) => (
              <TreeView.NodeProvider
                key={groupNode.id}
                node={groupNode}
                indexPath={[groupIndex]}
              >
                <TreeView.Branch>
                  <TreeView.BranchControl>
                    {showCheckboxes && (
                      <TreeView.NodeCheckbox>
                        <TreeView.NodeCheckboxIndicator indeterminate={<MinusIcon />}>
                          <CheckIcon />
                        </TreeView.NodeCheckboxIndicator>
                      </TreeView.NodeCheckbox>
                    )}
                    <TreeView.BranchIndicator />
                    <Box
                      flex="1"
                      minWidth="0"
                      onClick={
                        onGroupSelect
                          ? (e) => {
                              e.stopPropagation();
                              onGroupSelect(groupNode._group!);
                            }
                          : undefined
                      }
                    >
                      {renderGroupLabel ? (
                        renderGroupLabel(groupNode._group!)
                      ) : (
                        <TreeView.BranchText fontWeight="semibold">
                          {groupNode.name}
                        </TreeView.BranchText>
                      )}
                    </Box>
                    {renderGroupActions && (
                      <Box
                        flexShrink={0}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        {renderGroupActions(groupNode._group!)}
                      </Box>
                    )}
                  </TreeView.BranchControl>
                  <TreeView.BranchContent>
                    {groupNode.children?.map((itemNode, itemIndex) => (
                      <TreeView.NodeProvider
                        key={itemNode.id}
                        node={itemNode}
                        indexPath={[groupIndex, itemIndex]}
                      >
                        <TreeView.Item
                          onClick={
                            !showCheckboxes
                              ? () => {
                                  const originalId = itemIdMap.get(itemNode.id);
                                  if (originalId !== undefined) onSelectedChange([originalId]);
                                }
                              : undefined
                          }
                        >
                          {showCheckboxes && (
                            <TreeView.NodeCheckbox>
                              <TreeView.NodeCheckboxIndicator>
                                <CheckIcon />
                              </TreeView.NodeCheckboxIndicator>
                            </TreeView.NodeCheckbox>
                          )}
                          <Box
                            flex="1"
                            minWidth="0"
                          >
                            {renderItem ? (
                              renderItem(itemNode._item!)
                            ) : (
                              <TreeView.ItemText>{itemNode.name}</TreeView.ItemText>
                            )}
                          </Box>
                          {renderActions && (
                            <Box
                              flexShrink={0}
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                              {renderActions(itemNode._item!)}
                            </Box>
                          )}
                        </TreeView.Item>
                      </TreeView.NodeProvider>
                    ))}
                  </TreeView.BranchContent>
                </TreeView.Branch>
              </TreeView.NodeProvider>
            ))}
          </TreeView.Tree>
        </ScrollArea>
      </TreeView.RootProvider>
    </Flex>
  );
};
