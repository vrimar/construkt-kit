import { matchesQuery } from "../Listbox/managed";
import type { TreeCollection } from "./treeCollection";

export const filterTreeCollection = <T>(
  collection: TreeCollection<T>,
  normalizedQuery: string,
  filter?: (node: T, query: string) => boolean,
) => {
  if (!normalizedQuery) return collection;

  return collection.filter((node) =>
    filter
      ? filter(node, normalizedQuery)
      : matchesQuery(collection.stringifyNode(node), normalizedQuery),
  );
};

export const getExpandableBranchValues = <T>(
  collection: TreeCollection<T>,
  loadedValues?: ReadonlySet<string>,
) => {
  const values: string[] = [];

  collection.visit({
    onEnter: (node) => {
      const value = collection.getNodeValue(node);
      if (collection.getNodeChildren(node).length > 0 || loadedValues?.has(value)) {
        values.push(value);
      }
    },
  });

  return values;
};

export const locateNode = <T>(
  collection: TreeCollection<T>,
  value: string,
): { node: T; indexPath: number[]; valuePath: string[] } | null => {
  const indexPath = collection.getIndexPath(value);
  const node = indexPath ? collection.at(indexPath) : undefined;
  if (!indexPath || node === undefined) return null;
  return { node, indexPath, valuePath: collection.getValuePath(indexPath) };
};

export const replaceNodeChildren = <T>(
  collection: TreeCollection<T>,
  value: string,
  children: T[],
) => {
  const located = locateNode(collection, value);

  if (!located || collection.getNodeChildren(located.node).length > 0) return null;

  return collection.replace(located.indexPath, { ...located.node, children });
};

export const collectCheckableBranches = <T>(
  collection: TreeCollection<T>,
  leafValues: ReadonlySet<string>,
  selectableLeafValues: ReadonlySet<string>,
) => {
  const values = new Set<string>();

  const visit = (node: T): { hasLeaf: boolean; hasEmptiedBranch: boolean } => {
    if (!collection.isBranchNode(node)) {
      const value = collection.getNodeValue(node);
      return { hasLeaf: selectableLeafValues.has(value), hasEmptiedBranch: !leafValues.has(value) };
    }

    let hasLeaf = false;
    let hasEmptiedBranch = false;

    collection.getNodeChildren(node).forEach((childNode) => {
      const descendants = visit(childNode);
      hasLeaf ||= descendants.hasLeaf;
      hasEmptiedBranch ||= descendants.hasEmptiedBranch;
    });

    // Checking this branch would also check every emptied branch below it as a leaf.
    if (hasLeaf && !hasEmptiedBranch) {
      values.add(collection.getNodeValue(node));
    }

    return { hasLeaf, hasEmptiedBranch };
  };

  collection.nodes.forEach(visit);

  return values;
};
