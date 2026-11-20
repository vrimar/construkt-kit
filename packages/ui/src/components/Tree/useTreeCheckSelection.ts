import { useCallback, useMemo } from "react";

import { getSelectAllState } from "../Listbox/managed";
import type { TreeCheckedState, TreeCollection } from "./treeCollection";
import { collectCheckableBranches } from "./treeCollectionUtils";
import type { TreeNodeRenderDetails } from "./TreeRow";

interface UseTreeCheckSelectionOptions<TNode> {
  collection: TreeCollection<TNode>;
  displayedCollection: TreeCollection<TNode>;
  value: string[];
  onValueChange: (value: string[]) => void;
  isNodeCheckable: ((details: TreeNodeRenderDetails<TNode>) => boolean) | undefined;
  toSourceIndexPath: (indexPath: number[]) => number[];
}

const getSelectableLeafValues = <TNode>(
  collection: TreeCollection<TNode>,
  isLeafCheckable: (node: TNode, indexPath: number[]) => boolean,
) => {
  const values: string[] = [];
  collection.visit({
    onEnter: (node, indexPath) => {
      if (
        !collection.isBranchNode(node) &&
        !collection.getNodeDisabled(node) &&
        isLeafCheckable(node, indexPath)
      ) {
        values.push(collection.getNodeValue(node));
      }
    },
  });
  return values;
};

export function useTreeCheckSelection<TNode>({
  collection,
  displayedCollection,
  value,
  onValueChange,
  isNodeCheckable,
  toSourceIndexPath,
}: UseTreeCheckSelectionOptions<TNode>) {
  // Filtering keeps a matching branch with no children, which then reads as a leaf.
  const leafValueSet = useMemo(() => new Set(collection.getDescendantValues([])), [collection]);
  const valueSet = useMemo(() => new Set(value), [value]);

  const isLeafCheckable = useCallback(
    (node: TNode, indexPath: number[]) =>
      leafValueSet.has(displayedCollection.getNodeValue(node)) &&
      (isNodeCheckable?.({ node, indexPath: toSourceIndexPath(indexPath), isBranch: false }) ??
        true),
    [displayedCollection, isNodeCheckable, leafValueSet, toSourceIndexPath],
  );

  const selectableLeafValues = useMemo(
    () => getSelectableLeafValues(displayedCollection, isLeafCheckable),
    [displayedCollection, isLeafCheckable],
  );

  const treeSelectableLeafValues = useMemo(
    () =>
      displayedCollection === collection
        ? selectableLeafValues
        : getSelectableLeafValues(
            collection,
            (node, indexPath) => isNodeCheckable?.({ node, indexPath, isBranch: false }) ?? true,
          ),
    [collection, displayedCollection, isNodeCheckable, selectableLeafValues],
  );

  const selectedCount = useMemo(
    () => treeSelectableLeafValues.filter((leafValue) => valueSet.has(leafValue)).length,
    [treeSelectableLeafValues, valueSet],
  );

  const selectableLeafSet = useMemo(() => new Set(selectableLeafValues), [selectableLeafValues]);

  const checkableBranches = useMemo(
    () => collectCheckableBranches(displayedCollection, leafValueSet, selectableLeafSet),
    [displayedCollection, leafValueSet, selectableLeafSet],
  );

  const selectAll = useMemo(
    () => getSelectAllState(value, selectableLeafValues),
    [selectableLeafValues, value],
  );

  const isCheckable = ({ node, indexPath, isBranch }: TreeNodeRenderDetails<TNode>) => {
    if (!isBranch) return isLeafCheckable(node, indexPath);
    if (!checkableBranches.has(displayedCollection.getNodeValue(node))) return false;
    return isNodeCheckable?.({ node, indexPath: toSourceIndexPath(indexPath), isBranch }) ?? true;
  };

  const selectableLeavesOf = (node: TNode, isBranch: boolean) => {
    const nodeValue = displayedCollection.getNodeValue(node);
    const leafValues = isBranch ? displayedCollection.getDescendantValues(nodeValue) : [nodeValue];
    return leafValues.filter((leafValue) => selectableLeafSet.has(leafValue));
  };

  const checkedState = (node: TNode, isBranch: boolean): TreeCheckedState => {
    if (!isBranch) return valueSet.has(displayedCollection.getNodeValue(node));
    const { allSelected, someSelected } = getSelectAllState(value, selectableLeavesOf(node, true));
    return allSelected ? true : someSelected ? "indeterminate" : false;
  };

  const toggle = (node: TNode, isBranch: boolean) => {
    if (displayedCollection.getNodeDisabled(node)) return;
    const selectable = selectableLeavesOf(node, isBranch);
    if (selectable.length) onValueChange(getSelectAllState(value, selectable).toggle());
  };

  return {
    selectAll,
    hasDisplayedSelectable: selectableLeafValues.length > 0,
    selectableCount: treeSelectableLeafValues.length,
    selectedCount,
    isCheckable,
    checkedState,
    toggle,
  };
}
