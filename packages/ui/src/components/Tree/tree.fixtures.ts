export interface TestNode {
  id: string;
  label: string;
  disabled?: boolean;
  childrenCount?: number;
  children?: TestNode[];
}

export const testAccessors = {
  getNodeValue: (node: TestNode) => node.id,
  getNodeLabel: (node: TestNode) => node.label,
};

export const testTree = (nodes: TestNode[]) => ({ nodes, ...testAccessors });

export const findTestNode = (nodes: readonly TestNode[], id: string): TestNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findTestNode(node.children ?? [], id);
    if (found) return found;
  }
  return undefined;
};

export const childIdsOf = (nodes: readonly TestNode[] | null | undefined, parentValue?: string) => {
  if (!nodes) throw new Error("expected nodes");
  if (parentValue === undefined) return nodes.map((node) => node.id);
  const parent = findTestNode(nodes, parentValue);
  if (!parent) throw new Error(`no node ${parentValue}`);
  return (parent.children ?? []).map((node) => node.id);
};
