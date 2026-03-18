import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";
import { SquareCheckIcon, SquareIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Box, Flex } from "styled-system/jsx";

import { IconButton } from "../Buttons";
import { SearchInput } from "../Input/SearchInput";
import { Tooltip } from "../Tooltip";
import { CheckboxTree } from "../Tree";
import { DEFAULT_TREE_SIZE, type TreeSize } from "../Tree/treeShared";

const filterTreeCollection = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  query: string,
  searchPredicate?: (node: TNode, query: string) => boolean,
) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return collection;

  return collection.filter((node) => {
    if (searchPredicate) return searchPredicate(node, normalizedQuery);

    return collection.stringifyNode(node).toLowerCase().includes(normalizedQuery);
  });
};

const collectLeafValues = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  nodes: TNode[],
) => {
  const values: string[] = [];

  const visit = (node: TNode) => {
    if (!collection.isBranchNode(node)) {
      values.push(collection.getNodeValue(node));
      return;
    }

    collection.getNodeChildren(node).forEach(visit);
  };

  nodes.forEach(visit);

  return values;
};

const collectBranchValues = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  nodes: TNode[],
) => {
  const values: string[] = [];

  const visit = (node: TNode) => {
    if (collection.isBranchNode(node)) {
      values.push(collection.getNodeValue(node));
    }

    collection.getNodeChildren(node).forEach(visit);
  };

  nodes.forEach(visit);

  return values;
};

const collectBranchesWithLeafDescendants = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  nodes: TNode[],
) => {
  const values = new Set<string>();

  const visit = (node: TNode): boolean => {
    if (!collection.isBranchNode(node)) {
      return true;
    }

    let hasLeafDescendant = false;

    collection.getNodeChildren(node).forEach((childNode) => {
      if (visit(childNode)) {
        hasLeafDescendant = true;
      }
    });

    if (hasLeafDescendant) {
      values.add(collection.getNodeValue(node));
    }

    return hasLeafDescendant;
  };

  nodes.forEach(visit);

  return values;
};

const collectCheckedLeafValues = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  nodes: TNode[],
  checkedTreeValues: string[],
) => {
  const checkedSet = new Set(checkedTreeValues);
  const selectedValues = new Set<string>();

  const collectSubtreeLeafValues = (node: TNode) => {
    if (!collection.isBranchNode(node)) {
      selectedValues.add(collection.getNodeValue(node));
      return;
    }

    collection.getNodeChildren(node).forEach(collectSubtreeLeafValues);
  };

  const visit = (node: TNode) => {
    const treeValue = collection.getNodeValue(node);

    if (checkedSet.has(treeValue)) {
      collectSubtreeLeafValues(node);
      return;
    }

    collection.getNodeChildren(node).forEach(visit);
  };

  nodes.forEach(visit);

  return Array.from(selectedValues);
};

const mergeFilteredValue = <TNode extends TreeNode>({
  collection,
  value,
  visibleNodes,
  checkedTreeValues,
}: {
  collection: TreeCollection<TNode>;
  value: string[];
  visibleNodes: TNode[];
  checkedTreeValues: string[];
}) => {
  const visibleLeafValueSet = new Set(collectLeafValues(collection, visibleNodes));
  const preservedValue = value.filter((treeValue) => !visibleLeafValueSet.has(treeValue));
  const visibleValue = collectCheckedLeafValues(collection, visibleNodes, checkedTreeValues);

  return Array.from(new Set([...preservedValue, ...visibleValue]));
};

export interface TreeSelectProps<TNode extends TreeNode> {
  collection: TreeCollection<TNode>;
  value: string[];
  onValueChange: (value: string[]) => void;
  renderNode?: (node: TNode) => ReactNode;
  renderActions?: (node: TNode) => ReactNode;
  searchPlaceholder?: string;
  searchPredicate?: (node: TNode, query: string) => boolean;
  showSearch?: boolean;
  showSelectAll?: boolean;
  expandedValue?: string[];
  defaultExpandedValue?: string[];
  onExpandedValueChange?: (expandedValue: string[]) => void;
  maxHeight?: string;
  size?: TreeSize;
}

export const TreeSelect = <TNode extends TreeNode>({
  collection,
  value,
  onValueChange,
  renderNode,
  renderActions,
  searchPlaceholder = "Search...",
  searchPredicate,
  showSearch = true,
  showSelectAll = true,
  expandedValue,
  defaultExpandedValue,
  onExpandedValueChange,
  maxHeight = "320px",
  size = DEFAULT_TREE_SIZE,
}: TreeSelectProps<TNode>) => {
  const [search, setSearch] = useState("");
  const selectAllButtonSize = size === "sm" ? "xs" : "sm";

  const filteredCollection = useMemo(
    () => filterTreeCollection(collection, search, searchPredicate),
    [collection, search, searchPredicate],
  );

  const rootNodes = useMemo(
    () => filteredCollection.getNodeChildren(filteredCollection.rootNode),
    [filteredCollection],
  );

  const allRootNodes = useMemo(() => collection.getNodeChildren(collection.rootNode), [collection]);

  const handleCheckedChange = (checkedValue: string[]) => {
    onValueChange(
      mergeFilteredValue({
        collection: filteredCollection,
        value,
        visibleNodes: rootNodes,
        checkedTreeValues: checkedValue,
      }),
    );
  };

  const allExpandedValue = useMemo(
    () => collectBranchValues(collection, allRootNodes),
    [allRootNodes, collection],
  );

  const [uncontrolledExpandedValue, setUncontrolledExpandedValue] = useState<string[]>(
    defaultExpandedValue ?? allExpandedValue,
  );

  const resolvedExpandedValue = expandedValue ?? uncontrolledExpandedValue;

  const filteredExpandableValueSet = useMemo(
    () => new Set(collectBranchValues(filteredCollection, rootNodes)),
    [filteredCollection, rootNodes],
  );

  const visibleExpandedValue = useMemo(
    () => resolvedExpandedValue.filter((treeValue) => filteredExpandableValueSet.has(treeValue)),
    [filteredExpandableValueSet, resolvedExpandedValue],
  );

  const handleExpandedChange = (nextVisibleExpandedValue: string[]) => {
    const preservedExpandedValue = resolvedExpandedValue.filter(
      (treeValue) => !filteredExpandableValueSet.has(treeValue),
    );
    const nextExpandedValue = [...preservedExpandedValue, ...nextVisibleExpandedValue];

    if (expandedValue === undefined) {
      setUncontrolledExpandedValue(nextExpandedValue);
    }

    onExpandedValueChange?.(nextExpandedValue);
  };

  const allSelectableValues = useMemo(
    () => collectLeafValues(collection, allRootNodes),
    [allRootNodes, collection],
  );

  const selectedSet = useMemo(() => new Set(value), [value]);

  const allSelected =
    allSelectableValues.length > 0 &&
    allSelectableValues.every((selectionValue) => selectedSet.has(selectionValue));
  const someSelected =
    !allSelected && allSelectableValues.some((selectionValue) => selectedSet.has(selectionValue));

  const selectableSubtrees = useMemo(
    () => collectBranchesWithLeafDescendants(filteredCollection, rootNodes),
    [filteredCollection, rootNodes],
  );

  return (
    <Flex
      direction="column"
      height="100%"
    >
      {(showSearch || showSelectAll) && (
        <Flex
          borderBottomWidth="1px"
          borderColor="border"
          align="center"
          mb="2"
        >
          {showSearch && (
            <Box
              flex="1"
              px="2"
            >
              <SearchInput
                size={size}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch("")}
                variant="plain"
              />
            </Box>
          )}
          {showSelectAll && (
            <Tooltip content={allSelected ? "Deselect all" : "Select all"}>
              <IconButton
                aria-label={allSelected ? "Deselect all" : "Select all"}
                size={selectAllButtonSize}
                variant="plain"
                color="fg.muted"
                mr="1"
                flexShrink={0}
                onClick={() => onValueChange(allSelected ? [] : allSelectableValues)}
              >
                {allSelected || someSelected ? <SquareCheckIcon /> : <SquareIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Flex>
      )}
      <Box
        flex="1"
        minHeight="0"
      >
        <CheckboxTree
          collection={filteredCollection}
          checkedValue={value}
          onCheckedChange={handleCheckedChange}
          expandedValue={visibleExpandedValue}
          onExpandedChange={handleExpandedChange}
          maxHeight={maxHeight}
          size={size}
          renderNode={({ node }) => renderNode?.(node)}
          renderActions={({ node }) => renderActions?.(node)}
          isNodeCheckable={({ node, isBranch }) =>
            isBranch ? selectableSubtrees.has(filteredCollection.getNodeValue(node)) : true
          }
        />
      </Box>
    </Flex>
  );
};
