import { useEffect, useRef, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import type { TreeCollection } from "./treeCollection";
import { replaceNodeChildren } from "./treeCollectionUtils";

/** Where the branch `loadChildren` loads sits, and the signal that aborts the load. */
export interface TreeLoadChildrenDetails {
  indexPath: number[];
  valuePath: string[];
  signal: AbortSignal;
}

/** The branch whose `loadChildren` rejected. */
export interface TreeLoadChildrenErrorDetails<T> {
  node: T;
  indexPath: number[];
  valuePath: string[];
}

export interface TreeLazyLoadProps<T> {
  /**
   * Loads a branch's children when it is expanded. A node needs loading while it has a non-zero
   * children count, no children and no finished load; `nodes` not handed back by
   * `onLoadChildrenComplete` start afresh. The branch stays collapsed until the load finishes, then
   * opens even if it came back empty.
   */
  loadChildren?: ((node: T, details: TreeLoadChildrenDetails) => Promise<T[]>) | undefined;
  /** Receives `nodes` with the loaded children merged in; pass them back as `nodes`. */
  onLoadChildrenComplete?: ((nodes: T[]) => void) | undefined;
  /** Called when `loadChildren` rejects; the branch stays collapsed and retries on next expand. */
  onLoadChildrenError?:
    | ((error: unknown, details: TreeLoadChildrenErrorDetails<T>) => void)
    | undefined;
}

interface UseTreeLazyLoadOptions<T> extends TreeLazyLoadProps<T> {
  collection: TreeCollection<T>;
  abortKey: string;
}

export interface TreeLazyLoad<T> {
  loadingValues: ReadonlySet<string>;
  needsLoad: (value: string) => boolean;
  /** Whether a branch's children are in; `undefined` without a `loadChildren` to know it. */
  isLoaded: ((value: string) => boolean) | undefined;
  start: (values: string[], onLoaded: (value: string) => void) => void;
  /** Keeps the loads of `prev` for `next`, the same nodes rearranged. */
  carry: (prev: readonly T[], next: readonly T[]) => void;
}

const NO_VALUES: ReadonlySet<string> = new Set();

interface LoadLineage<T> {
  base: readonly T[];
  merged: readonly T[];
  loaded: ReadonlySet<string>;
}

// Loads count only within one lineage; nodes built anew may hold the branch unloaded again.
const getLoaded = <T>(lineage: LoadLineage<T>, nodes: readonly T[]) =>
  lineage.base === nodes || lineage.merged === nodes ? lineage.loaded : NO_VALUES;

export function useTreeLazyLoad<T>({
  collection,
  loadChildren,
  onLoadChildrenComplete,
  onLoadChildrenError,
  abortKey,
}: UseTreeLazyLoadOptions<T>): TreeLazyLoad<T> & { loadedValues: ReadonlySet<string> } {
  const [loadingValues, setLoadingValues] = useState(NO_VALUES);

  const latestRef = useLatestRef({
    collection,
    onLoadChildrenComplete,
    onLoadChildrenError,
  });
  const [lineage, setLineage] = useState<LoadLineage<T>>(() => ({
    base: collection.nodes,
    merged: collection.nodes,
    loaded: NO_VALUES,
  }));
  const sourceRef = useRef(lineage);
  const controllersRef = useRef(new Map<string, AbortController>());

  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
      setLoadingValues(NO_VALUES);
    };
  }, [abortKey]);

  // Merges stay visible to later completions until the nodes prop moves on from `base`.
  const getSource = (prop: TreeCollection<T>) =>
    sourceRef.current.base === prop.nodes ? prop.copy(sourceRef.current.merged) : prop;

  const needsLoad = (value: string) => {
    if (!loadChildren) return false;
    const source = getSource(collection);
    const node = source.findNode(value);
    return (
      node !== undefined &&
      (source.getNodeChildrenCount(node) ?? 0) > 0 &&
      source.getNodeChildren(node).length === 0 &&
      !getLoaded(sourceRef.current, collection.nodes).has(value)
    );
  };

  const settle = (value: string, controller: AbortController) => {
    if (controller.signal.aborted) return false;
    if (controllersRef.current.get(value) === controller) controllersRef.current.delete(value);
    setLoadingValues((prev) => {
      if (!prev.has(value)) return prev;
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
    return true;
  };

  const handleLoaded = (value: string, children: T[], onLoaded: (value: string) => void) => {
    const { collection: prop, onLoadChildrenComplete: onComplete } = latestRef.current;
    const source = getSource(prop);
    if (source.findNode(value) === undefined) return;

    const next = replaceNodeChildren(source, value, children);
    sourceRef.current = {
      base: prop.nodes,
      merged: (next ?? source).nodes,
      loaded: new Set(getLoaded(sourceRef.current, prop.nodes)).add(value),
    };
    setLineage(sourceRef.current);
    if (next) onComplete?.(next.nodes as T[]);
    onLoaded(value);
  };

  const handleFailed = (value: string, error: unknown) => {
    const { collection: prop, onLoadChildrenError: onError } = latestRef.current;
    const located = getSource(prop).locate(value);
    if (located) onError?.(error, located);
  };

  const carry = (prev: readonly T[], next: readonly T[]) => {
    sourceRef.current = { base: prev, merged: next, loaded: getLoaded(sourceRef.current, prev) };
    setLineage(sourceRef.current);
  };

  const start = (values: string[], onLoaded: (value: string) => void) => {
    if (!loadChildren) return;

    for (const value of values) {
      if (controllersRef.current.has(value) || !needsLoad(value)) continue;
      const located = getSource(collection).locate(value);
      if (!located) continue;

      const controller = new AbortController();
      controllersRef.current.set(value, controller);
      setLoadingValues((prev) => new Set(prev).add(value));

      const { node, indexPath, valuePath } = located;
      new Promise<T[]>((resolve) => {
        resolve(loadChildren(node, { indexPath, valuePath, signal: controller.signal }));
      }).then(
        (children) => {
          if (settle(value, controller)) handleLoaded(value, children, onLoaded);
        },
        (error: unknown) => {
          if (settle(value, controller)) handleFailed(value, error);
        },
      );
    }
  };

  return {
    loadingValues,
    loadedValues: getLoaded(lineage, collection.nodes),
    needsLoad,
    isLoaded: loadChildren ? (value) => !needsLoad(value) : undefined,
    start,
    carry,
  };
}
