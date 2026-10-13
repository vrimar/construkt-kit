import type {
  TreeCollection,
  TreeNode,
  TreeViewLoadChildrenCompleteDetails,
  TreeViewLoadChildrenDetails,
  TreeViewLoadChildrenErrorDetails,
} from "@ark-ui/react/tree-view";
import { useEffect, useRef, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import { locateNode, replaceNodeChildren } from "./treeCollectionUtils";

interface UseTreeLazyLoadOptions<TNode extends TreeNode> {
  collection: TreeCollection<TNode>;
  loadChildren: ((details: TreeViewLoadChildrenDetails<TNode>) => Promise<TNode[]>) | undefined;
  onLoadChildrenComplete:
    | ((details: TreeViewLoadChildrenCompleteDetails<TNode>) => void)
    | undefined;
  onLoadChildrenError: ((details: TreeViewLoadChildrenErrorDetails<TNode>) => void) | undefined;
  abortKey: string;
}

const NO_VALUES: ReadonlySet<string> = new Set();

interface LoadLineage<TNode extends TreeNode> {
  base: TreeCollection<TNode>;
  merged: TreeCollection<TNode>;
  loaded: ReadonlySet<string>;
}

// Loads count only within one lineage; a collection built anew may hold the branch unloaded again.
const getLoaded = <TNode extends TreeNode>(
  lineage: LoadLineage<TNode>,
  prop: TreeCollection<TNode>,
) => (lineage.base === prop || lineage.merged === prop ? lineage.loaded : NO_VALUES);

export function useTreeLazyLoad<TNode extends TreeNode>({
  collection,
  loadChildren,
  onLoadChildrenComplete,
  onLoadChildrenError,
  abortKey,
}: UseTreeLazyLoadOptions<TNode>) {
  const [loadingValues, setLoadingValues] = useState(NO_VALUES);

  const latestRef = useLatestRef({
    collection,
    onLoadChildrenComplete,
    onLoadChildrenError,
  });
  const [lineage, setLineage] = useState<LoadLineage<TNode>>(() => ({
    base: collection,
    merged: collection,
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

  // Merges stay visible to later completions until the collection prop moves on from `base`.
  const getSource = (prop: TreeCollection<TNode>) =>
    sourceRef.current.base === prop ? sourceRef.current.merged : prop;

  const needsLoad = (value: string) => {
    if (!loadChildren) return false;
    const source = getSource(collection);
    const node = source.findNode(value);
    return (
      node !== undefined &&
      source.getNodeChildrenCount(node) != null &&
      source.getNodeChildren(node).length === 0 &&
      !getLoaded(sourceRef.current, collection).has(value)
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

  const handleLoaded = (value: string, children: TNode[], onLoaded: (value: string) => void) => {
    const { collection: prop, onLoadChildrenComplete: onComplete } = latestRef.current;
    const source = getSource(prop);
    if (source.findNode(value) === undefined) return;

    const next = replaceNodeChildren(source, value, children);
    sourceRef.current = {
      base: prop,
      merged: next ?? source,
      loaded: new Set(getLoaded(sourceRef.current, prop)).add(value),
    };
    setLineage(sourceRef.current);
    if (next) onComplete?.({ collection: next });
    onLoaded(value);
  };

  const handleFailed = (value: string, error: unknown) => {
    const { collection: prop, onLoadChildrenError: onError } = latestRef.current;
    const located = locateNode(getSource(prop), value);
    if (!located) return;
    onError?.({ nodes: [{ ...located, error: error as Error }] });
  };

  const carry = (prev: TreeCollection<TNode>, next: TreeCollection<TNode>) => {
    sourceRef.current = { base: prev, merged: next, loaded: getLoaded(sourceRef.current, prev) };
    setLineage(sourceRef.current);
  };

  const start = (values: string[], onLoaded: (value: string) => void) => {
    if (!loadChildren) return;

    for (const value of values) {
      if (controllersRef.current.has(value) || !needsLoad(value)) continue;
      const located = locateNode(getSource(collection), value);
      if (!located) continue;

      const controller = new AbortController();
      controllersRef.current.set(value, controller);
      setLoadingValues((prev) => new Set(prev).add(value));

      new Promise<TNode[]>((resolve) => {
        resolve(loadChildren({ ...located, signal: controller.signal }));
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

  return { loadingValues, loadedValues: getLoaded(lineage, collection), needsLoad, start, carry };
}
