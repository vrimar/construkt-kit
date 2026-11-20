import { useCallback, useMemo } from "react";

import { useSelectionSearch } from "../Listbox/managed";
import type { SelectionSearchOptions } from "../Listbox/types";
import type { SelectionSearch } from "../Listbox/useSelectionSearch";
import {
  type TreeCheckedState,
  TreeCollection,
  type TreeNodeAccessors,
  type TreeNodes,
} from "./treeCollection";
import { filterTreeCollection } from "./treeCollectionUtils";
import type { TreeNodeRenderDetails } from "./TreeRow";
import { useTreeCheckSelection } from "./useTreeCheckSelection";
import {
  type TreeLoadChildrenDetails,
  type TreeLoadChildrenErrorDetails,
  useTreeLazyLoad,
} from "./useTreeLazyLoad";
import { useTreeSearchExpansion } from "./useTreeSearchExpansion";

interface UseTreeSelectListBaseProps<TNode> extends TreeNodes<TNode> {
  /** Controlled selected leaf-node IDs. */
  value: string[];
  /** Callback when selected values change. */
  onValueChange: (value: string[]) => void;
  /**
   * Determine whether a node should show a checkbox. Select-all skips leaves it rejects. Defaults
   * to true for all nodes.
   */
  isNodeCheckable?: (details: TreeNodeRenderDetails<TNode>) => boolean;
  /**
   * Search configuration. The input shows unless `showInput` is `false`, with the placeholder
   * "Search..." by default.
   */
  search?: SelectionSearchOptions<TNode>;
  /**
   * Shows only the nodes it keeps, with their ancestors, on top of the search and with or without
   * a query; e.g. only the selected leaves. Drag and drop is off while it is set. A new function
   * re-filters every node, so keep it stable.
   */
  nodeFilter?: ((node: TNode) => boolean) | undefined;
  /**
   * Expand every branch that has children while a query is active. Collapsing a branch during a
   * search lasts until the query changes and does not call `onExpandedChange`. @default true
   */
  expandOnSearch?: boolean;
  /** Controlled expanded node IDs. */
  expandedValue?: string[];
  /** Initial expanded node IDs (uncontrolled). Defaults to all branches that have children. */
  defaultExpandedValue?: string[];
  /** Callback when expanded nodes change. */
  onExpandedChange?: (expandedValue: string[]) => void;
}

type TreeSelectListLoadProps<TNode> =
  | { loadChildren?: never; onLoadChildrenComplete?: never; onLoadChildrenError?: never }
  | {
      /**
       * Loads a branch's children when it is expanded. A node needs loading while it has a
       * non-zero children count, no children and no finished load; `nodes` not handed back by
       * `onLoadChildrenComplete` start afresh. The branch stays collapsed until the load
       * finishes, then opens even if it came back empty.
       */
      loadChildren: (node: TNode, details: TreeLoadChildrenDetails) => Promise<TNode[]>;
      /** Receives `nodes` with the loaded children merged in; pass them back as `nodes`. */
      onLoadChildrenComplete: (nodes: TNode[]) => void;
      /** Called when `loadChildren` rejects; the branch stays collapsed and retries on next expand. */
      onLoadChildrenError?: (error: unknown, details: TreeLoadChildrenErrorDetails<TNode>) => void;
    };

export type UseTreeSelectListProps<TNode> = UseTreeSelectListBaseProps<TNode> &
  TreeSelectListLoadProps<TNode>;

/**
 * A tree select list's selection, for controls outside the list. "Displayed" leaves are those the
 * search and `nodeFilter` leave on show, collapsed branches included.
 */
export interface UseTreeSelectListReturn {
  /** Every displayed selectable leaf is selected; false while none is displayed. */
  allSelected: boolean;
  /** Some, but not every, displayed selectable leaf is selected. */
  someSelected: boolean;
  /** A displayed selectable leaf is unselected, so `selectAll` would change the value. */
  canSelectAll: boolean;
  /** A displayed selectable leaf is selected, so `deselectAll` would change the value. */
  canDeselectAll: boolean;
  /** Selects every displayed selectable leaf through `onValueChange`. */
  selectAll: () => void;
  /** Deselects every displayed selectable leaf through `onValueChange`, keeping the rest. */
  deselectAll: () => void;
  /** Enabled, checkable leaves in `nodes`, whatever the search and `nodeFilter` show. */
  selectableCount: number;
  /** How many of the `selectableCount` leaves are selected. */
  selectedCount: number;
}

export interface TreeSelectListState<TNode> extends UseTreeSelectListReturn {
  search: SelectionSearch;
  displayedCollection: TreeCollection<TNode>;
  dndAllowed: boolean;
  expandedValue: string[];
  onExpandedChange: (expandedValue: string[]) => void;
  toSourceIndexPath: (indexPath: number[]) => number[];
  isCheckable: (details: TreeNodeRenderDetails<TNode>) => boolean;
  checkedState: (node: TNode, isBranch: boolean) => TreeCheckedState;
  toggle: (node: TNode, isBranch: boolean) => void;
  loadingValues: ReadonlySet<string>;
  isBranchLoaded: (value: string) => boolean;
  carryLoads: (nextNodes: readonly TNode[]) => void;
}

/**
 * The state behind `TreeSelectList`: search, filtering, expansion, lazy loading and checked
 * leaves. Pass the result to `TreeSelectList.RootProvider` and render its parts inside.
 */
export function useTreeSelectList<TNode>(
  props: UseTreeSelectListProps<TNode>,
): UseTreeSelectListReturn {
  const {
    nodes,
    getNodeValue,
    getNodeLabel,
    getChildren,
    getChildrenCount,
    isNodeDisabled,
    value,
    onValueChange,
    isNodeCheckable,
    search: searchOptions,
    nodeFilter,
    expandOnSearch = true,
    expandedValue,
    defaultExpandedValue,
    onExpandedChange,
    loadChildren,
    onLoadChildrenComplete,
    onLoadChildrenError,
  } = props;

  const search = useSelectionSearch(searchOptions ?? true);
  const { normalizedQuery, filterQuery } = search;
  const searchFilter = searchOptions?.filter;

  const accessors: TreeNodeAccessors<TNode> = useMemo(
    () => ({ getNodeValue, getNodeLabel, getChildren, getChildrenCount, isNodeDisabled }),
    [getNodeValue, getNodeLabel, getChildren, getChildrenCount, isNodeDisabled],
  );
  const collection = useMemo(() => new TreeCollection(nodes, accessors), [nodes, accessors]);

  const displayedCollection = useMemo(
    () => filterTreeCollection(collection, filterQuery, searchFilter, nodeFilter),
    [collection, filterQuery, searchFilter, nodeFilter],
  );

  const lazyLoad = useTreeLazyLoad({
    collection,
    loadChildren,
    onLoadChildrenComplete,
    onLoadChildrenError,
    abortKey: search.external ? normalizedQuery : "",
  });

  const expansion = useTreeSearchExpansion({
    collection,
    displayedCollection,
    expandedValue,
    defaultExpandedValue,
    onExpandedChange,
    normalizedQuery,
    expandOnSearch,
    loadedValues: lazyLoad.loadedValues,
  });

  const handleExpandedChange = (nextExpandedValue: string[]) => {
    const deferredValues = expansion.getOpenedValues(nextExpandedValue).filter(lazyLoad.needsLoad);
    lazyLoad.start(deferredValues, expansion.expand);
    expansion.setExpandedValue(
      nextExpandedValue.filter((treeValue) => !deferredValues.includes(treeValue)),
    );
  };

  const toSourceIndexPath = useCallback(
    (indexPath: number[]) =>
      displayedCollection === collection
        ? indexPath
        : collection.getIndexPath(displayedCollection.getValuePath(indexPath)),
    [collection, displayedCollection],
  );

  const checks = useTreeCheckSelection({
    collection,
    displayedCollection,
    value,
    onValueChange,
    isNodeCheckable,
    toSourceIndexPath,
  });
  const { allSelected, someSelected } = checks.selectAll;
  const canSelectAll = !allSelected && checks.hasDisplayedSelectable;
  const canDeselectAll = allSelected || someSelected;

  const state: TreeSelectListState<TNode> = {
    allSelected,
    someSelected,
    canSelectAll,
    canDeselectAll,
    selectAll: () => {
      if (canSelectAll) onValueChange(checks.selectAll.select());
    },
    deselectAll: () => {
      if (canDeselectAll) onValueChange(checks.selectAll.clear());
    },
    selectableCount: checks.selectableCount,
    selectedCount: checks.selectedCount,
    search,
    displayedCollection,
    dndAllowed: normalizedQuery === "" && nodeFilter == null,
    expandedValue: expansion.visibleExpandedValue,
    onExpandedChange: handleExpandedChange,
    toSourceIndexPath,
    isCheckable: checks.isCheckable,
    checkedState: checks.checkedState,
    toggle: checks.toggle,
    loadingValues: lazyLoad.loadingValues,
    isBranchLoaded: (treeValue) => !lazyLoad.needsLoad(treeValue),
    carryLoads: (nextNodes) => lazyLoad.carry(nodes, nextNodes),
  };
  return state;
}
