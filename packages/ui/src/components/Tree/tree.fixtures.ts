import { type TreeCollection, createTreeCollection } from "@ark-ui/react/tree-view";

export interface TestNode {
  id: string;
  label: string;
  disabled?: boolean;
  childrenCount?: number;
  children?: TestNode[];
}

export const createTestTree = (children: TestNode[]) =>
  createTreeCollection<TestNode>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.label,
    rootNode: { id: "ROOT", label: "", children },
  });

export const childIdsOf = (
  collection: TreeCollection<TestNode> | null | undefined,
  parentValue?: string,
) => {
  if (!collection) throw new Error("expected a collection");
  const parent = parentValue === undefined ? collection.rootNode : collection.findNode(parentValue);
  if (!parent) throw new Error(`no node ${parentValue}`);
  return collection.getNodeChildren(parent).map((node) => node.id);
};
