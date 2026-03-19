import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";

export const filterTreeCollection = <TNode extends TreeNode>(
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

export const collectLeafValues = <TNode extends TreeNode>(
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

export const collectBranchValues = <TNode extends TreeNode>(
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

export const collectBranchesWithLeafDescendants = <TNode extends TreeNode>(
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

export const collectCheckedLeafValues = <TNode extends TreeNode>(
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

export const mergeFilteredValue = <TNode extends TreeNode>({
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
