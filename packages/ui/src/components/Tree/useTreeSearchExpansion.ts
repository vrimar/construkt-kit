import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import type { TreeCollection } from "./treeCollection";
import { getExpandableBranchValues } from "./treeCollectionUtils";

interface UseTreeSearchExpansionOptions<TNode> {
  collection: TreeCollection<TNode>;
  displayedCollection: TreeCollection<TNode>;
  expandedValue: string[] | undefined;
  defaultExpandedValue: string[] | undefined;
  onExpandedChange: ((expandedValue: string[]) => void) | undefined;
  normalizedQuery: string;
  expandOnSearch: boolean;
  loadedValues: ReadonlySet<string>;
}

interface CollapsedDuringQuery {
  query: string;
  values: string[];
}

const NO_VALUES: string[] = [];

export function useTreeSearchExpansion<TNode>({
  collection,
  displayedCollection,
  expandedValue,
  defaultExpandedValue,
  onExpandedChange,
  normalizedQuery,
  expandOnSearch,
  loadedValues,
}: UseTreeSearchExpansionOptions<TNode>) {
  const [uncontrolledExpandedValue, setUncontrolledExpandedValue] = useState<string[]>(
    () => defaultExpandedValue ?? getExpandableBranchValues(collection),
  );
  const storedExpandedValue = expandedValue ?? uncontrolledExpandedValue;

  const [collapsedDuringQuery, setCollapsedDuringQuery] = useState<CollapsedDuringQuery>({
    query: normalizedQuery,
    values: NO_VALUES,
  });
  if (collapsedDuringQuery.query !== normalizedQuery) {
    setCollapsedDuringQuery({ query: normalizedQuery, values: NO_VALUES });
  }

  const searchExpanding = expandOnSearch && normalizedQuery !== "";
  const collapsedValues =
    collapsedDuringQuery.query === normalizedQuery ? collapsedDuringQuery.values : NO_VALUES;

  const expandableValues = useMemo(
    () => getExpandableBranchValues(displayedCollection, loadedValues),
    [displayedCollection, loadedValues],
  );
  const expandableValueSet = useMemo(() => new Set(expandableValues), [expandableValues]);

  const visibleExpandedValue = useMemo(() => {
    if (searchExpanding) {
      const collapsedSet = new Set(collapsedValues);
      return expandableValues.filter((treeValue) => !collapsedSet.has(treeValue));
    }
    return storedExpandedValue.filter((treeValue) => expandableValueSet.has(treeValue));
  }, [collapsedValues, expandableValueSet, expandableValues, searchExpanding, storedExpandedValue]);

  const latestRef = useLatestRef({ expandedValue, onExpandedChange });
  // Written through on commit so updates landing in the same tick build on each other.
  const storedRef = useRef(storedExpandedValue);
  const [, rerender] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    storedRef.current = storedExpandedValue;
  });

  const commitStored = useCallback(
    (nextExpandedValue: string[]) => {
      storedRef.current = nextExpandedValue;
      if (latestRef.current.expandedValue === undefined) {
        setUncontrolledExpandedValue(nextExpandedValue);
      } else {
        // An owner keeping its value won't re-render this, leaving the write-through stale.
        rerender();
      }
      latestRef.current.onExpandedChange?.(nextExpandedValue);
    },
    [latestRef],
  );

  const getOpenedValues = (nextVisibleExpandedValue: string[]) => {
    const visibleSet = new Set(visibleExpandedValue);
    return nextVisibleExpandedValue.filter((treeValue) => !visibleSet.has(treeValue));
  };

  const setExpandedValue = (nextVisibleExpandedValue: string[]) => {
    const unchanged =
      nextVisibleExpandedValue.length === visibleExpandedValue.length &&
      getOpenedValues(nextVisibleExpandedValue).length === 0;
    if (unchanged) return;

    if (searchExpanding) {
      const nextSet = new Set(nextVisibleExpandedValue);
      const closed = visibleExpandedValue.filter((treeValue) => !nextSet.has(treeValue));
      const nextCollapsed = new Set([...collapsedValues, ...closed]);
      nextVisibleExpandedValue.forEach((treeValue) => nextCollapsed.delete(treeValue));
      setCollapsedDuringQuery({ query: normalizedQuery, values: Array.from(nextCollapsed) });
      return;
    }

    const preservedExpandedValue = storedRef.current.filter(
      (treeValue) => !expandableValueSet.has(treeValue),
    );
    commitStored(Array.from(new Set([...preservedExpandedValue, ...nextVisibleExpandedValue])));
  };

  const expand = useCallback(
    (treeValue: string) => {
      const current = storedRef.current;
      if (!current.includes(treeValue)) commitStored([...current, treeValue]);
    },
    [commitStored],
  );

  return { visibleExpandedValue, getOpenedValues, setExpandedValue, expand };
}
