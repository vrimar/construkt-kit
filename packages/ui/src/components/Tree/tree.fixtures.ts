import { createTreeCollection } from "@ark-ui/react/tree-view";

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
