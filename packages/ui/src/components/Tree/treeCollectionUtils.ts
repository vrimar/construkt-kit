import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";

import { matchesQuery } from "../Listbox/managed";

export const filterTreeCollection = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  normalizedQuery: string,
  filter?: (node: TNode, query: string) => boolean,
) => {
  if (!normalizedQuery) return collection;

  return collection.filter((node) =>
    filter
      ? filter(node, normalizedQuery)
      : matchesQuery(collection.stringifyNode(node), normalizedQuery),
  );
};

export const getExpandableBranchValues = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
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

export const locateNode = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  value: string,
): { node: NonNullable<TNode>; indexPath: number[]; valuePath: string[] } | null => {
  const indexPath = collection.getIndexPath(value);
  const node = indexPath ? collection.at(indexPath) : undefined;
  if (!indexPath || node == null) return null;
  return { node, indexPath, valuePath: collection.getValuePath(indexPath) };
};

export const replaceNodeChildren = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  value: string,
  children: TNode[],
) => {
  const located = locateNode(collection, value);

  if (!located || collection.getNodeChildren(located.node).length > 0) return null;

  return collection.replace(located.indexPath, { ...located.node, children });
};

export const collectCheckableBranches = <TNode extends TreeNode>(
  collection: TreeCollection<TNode>,
  leafValues: ReadonlySet<string>,
  selectableLeafValues: ReadonlySet<string>,
) => {
  const values = new Set<string>();

  const visit = (node: TNode): { hasLeaf: boolean; hasEmptiedBranch: boolean } => {
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

  collection.getNodeChildren(collection.rootNode).forEach(visit);

  return values;
};
