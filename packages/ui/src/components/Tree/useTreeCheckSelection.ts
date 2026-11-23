import { useCallback, useMemo } from "react";

import { getSelectAllState } from "../selection";
import type { TreeCollection } from "./treeCollection";
import { collectCheckableBranches } from "./treeCollectionUtils";
import type { TreeNodeRenderDetails } from "./TreeRow";
import type { UseTreeSelectListReturn } from "./useTreeSelectList";

interface UseTreeCheckSelectionOptions<TNode> {
  collection: TreeCollection<TNode>;
  displayedCollection: TreeCollection<TNode>;
  value: string[];
  onValueChange: (value: string[]) => void;
  isNodeCheckable: ((details: TreeNodeRenderDetails<TNode>) => boolean) | undefined;
  toSourceIndexPath: (indexPath: number[]) => number[];
}

/** The leaves `accepts` takes, and those of them that are enabled, in tree order. */
const collectCheckableLeaves = <TNode>(
  collection: TreeCollection<TNode>,
  accepts: (node: TNode, indexPath: number[]) => boolean,
) => {
  const checkable = new Set<string>();
  const selectable: string[] = [];
  collection.visit({
    onEnter: (node, indexPath) => {
      if (collection.isBranchNode(node) || !accepts(node, indexPath)) return;
      const value = collection.getNodeValue(node);
      checkable.add(value);
      if (!collection.getNodeDisabled(node)) selectable.push(value);
    },
  });
  return { checkable, selectable };
};

export function useTreeCheckSelection<TNode>({
  collection,
  displayedCollection,
  value,
  onValueChange,
  isNodeCheckable,
  toSourceIndexPath,
}: UseTreeCheckSelectionOptions<TNode>): UseTreeSelectListReturn & {
  isCheckable: (node: TNode) => boolean;
} {
  // Filtering keeps a matching branch with no children, which then reads as a leaf.
  const leafValueSet = useMemo(() => new Set(collection.getDescendantValues([])), [collection]);
  const valueSet = useMemo(() => new Set(value), [value]);

  const { checkableValues, selectableLeafValues } = useMemo(() => {
    const accepts = (node: TNode, indexPath: number[], isBranch: boolean) =>
      isNodeCheckable?.({ node, indexPath: toSourceIndexPath(indexPath), isBranch }) ?? true;
    const leaves = collectCheckableLeaves(
      displayedCollection,
      (node, indexPath) =>
        leafValueSet.has(displayedCollection.getNodeValue(node)) && accepts(node, indexPath, false),
    );
    const branches = collectCheckableBranches(
      displayedCollection,
      leafValueSet,
      new Set(leaves.selectable),
    );
    displayedCollection.visit({
      onEnter: (node, indexPath) => {
        const nodeValue = displayedCollection.getNodeValue(node);
        if (branches.has(nodeValue) && accepts(node, indexPath, true)) {
          leaves.checkable.add(nodeValue);
        }
      },
    });
    return { checkableValues: leaves.checkable, selectableLeafValues: leaves.selectable };
  }, [displayedCollection, isNodeCheckable, leafValueSet, toSourceIndexPath]);

  const treeSelectableLeafValues = useMemo(
    () =>
      displayedCollection === collection
        ? selectableLeafValues
        : collectCheckableLeaves(
            collection,
            (node, indexPath) => isNodeCheckable?.({ node, indexPath, isBranch: false }) ?? true,
          ).selectable,
    [collection, displayedCollection, isNodeCheckable, selectableLeafValues],
  );

  const selectedCount = useMemo(
    () => treeSelectableLeafValues.filter((leafValue) => valueSet.has(leafValue)).length,
    [treeSelectableLeafValues, valueSet],
  );

  const selectAllState = useMemo(
    () => getSelectAllState(value, selectableLeafValues),
    [selectableLeafValues, value],
  );
  const { allSelected, someSelected } = selectAllState;
  const canSelectAll = !allSelected && selectableLeafValues.length > 0;
  const canDeselectAll = allSelected || someSelected;

  const isCheckable = useCallback(
    (node: TNode) => checkableValues.has(displayedCollection.getNodeValue(node)),
    [checkableValues, displayedCollection],
  );

  return {
    allSelected,
    someSelected,
    canSelectAll,
    canDeselectAll,
    selectAll: () => {
      if (canSelectAll) onValueChange(selectAllState.select());
    },
    deselectAll: () => {
      if (canDeselectAll) onValueChange(selectAllState.clear());
    },
    selectableCount: treeSelectableLeafValues.length,
    selectedCount,
    isCheckable,
  };
}
