import type {
  TreeCollection,
  TreeNode,
  TreeViewLoadChildrenCompleteDetails,
  TreeViewLoadChildrenDetails,
  TreeViewLoadChildrenErrorDetails,
} from "@ark-ui/react/tree-view";
import { useEffect, useRef, useState } from "react";

import { replaceNodeChildren } from "./treeCollectionUtils";

interface UseTreeLazyLoadOptions<TNode extends TreeNode> {
  collection: TreeCollection<TNode>;
  loadChildren: ((details: TreeViewLoadChildrenDetails<TNode>) => Promise<TNode[]>) | undefined;
  onLoadChildrenComplete:
    | ((details: TreeViewLoadChildrenCompleteDetails<TNode>) => void)
    | undefined;
  onLoadChildrenError: ((details: TreeViewLoadChildrenErrorDetails<TNode>) => void) | undefined;
  onLoaded: (value: string) => void;
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

const locateNode = <TNode extends TreeNode>(collection: TreeCollection<TNode>, value: string) => {
  const indexPath = collection.getIndexPath(value);
  const node = indexPath ? collection.at(indexPath) : undefined;
  if (!indexPath || node === undefined) return null;
  return { node, indexPath, valuePath: collection.getValuePath(indexPath) };
};

export function useTreeLazyLoad<TNode extends TreeNode>({
  collection,
  loadChildren,
  onLoadChildrenComplete,
  onLoadChildrenError,
  onLoaded,
  abortKey,
}: UseTreeLazyLoadOptions<TNode>) {
  const [loadingValues, setLoadingValues] = useState(NO_VALUES);

  const latest = { collection, onLoadChildrenComplete, onLoadChildrenError, onLoaded };
  const latestRef = useRef(latest);
  const [lineage, setLineage] = useState<LoadLineage<TNode>>(() => ({
    base: collection,
    merged: collection,
    loaded: NO_VALUES,
  }));
  const sourceRef = useRef(lineage);
  const controllersRef = useRef(new Map<string, AbortController>());

  useEffect(() => {
    latestRef.current = latest;
  });

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

  const handleLoaded = (value: string, children: TNode[]) => {
    const {
      collection: prop,
      onLoadChildrenComplete: onComplete,
      onLoaded: expand,
    } = latestRef.current;
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
    expand(value);
  };

  const handleFailed = (value: string, error: unknown) => {
    const { collection: prop, onLoadChildrenError: onError } = latestRef.current;
    const located = locateNode(getSource(prop), value);
    if (!located) return;
    onError?.({ nodes: [{ ...located, error: error as Error }] });
  };

  const start = (values: string[]) => {
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
          if (settle(value, controller)) handleLoaded(value, children);
        },
        (error: unknown) => {
          if (settle(value, controller)) handleFailed(value, error);
        },
      );
    }
  };

  return { loadingValues, loadedValues: getLoaded(lineage, collection), needsLoad, start };
}
