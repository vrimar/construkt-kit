import preview from "@construkt-kit/story-kit/preview";
import { FileIcon, FolderIcon } from "lucide-react";

import {
  DraggableTreeNode,
  TreeDropIndicator,
  type TreeDropInstruction,
  type TreeNodeRenderDetails,
  TreeView,
} from ".";
import { Box } from "../Layout";

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const nodes: Node[] = [
  {
    id: "src",
    name: "src",
    children: [
      {
        id: "components",
        name: "components",
        children: [
          { id: "button", name: "Button.tsx" },
          { id: "input", name: "Input.tsx" },
        ],
      },
      {
        id: "utils",
        name: "utils",
        children: [{ id: "format", name: "format.ts" }],
      },
      { id: "index-ts", name: "index.ts" },
    ],
  },
  { id: "readme", name: "README.md" },
];

const nodeValue = (node: Node) => node.id;
const nodeLabel = (node: Node) => node.name;

const TARGET = "utils";

function DropTargetTree({ instruction }: { instruction: TreeDropInstruction | null }) {
  const renderNode = ({ node, isBranch }: TreeNodeRenderDetails<Node>) => (
    <>
      {isBranch ? <FolderIcon /> : <FileIcon />}
      {isBranch ? (
        <TreeView.BranchText>{node.name}</TreeView.BranchText>
      ) : (
        <TreeView.ItemText>{node.name}</TreeView.ItemText>
      )}
      {node.id === TARGET && <TreeDropIndicator instruction={instruction} />}
    </>
  );

  return (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        nodes={nodes}
        getNodeValue={nodeValue}
        getNodeLabel={nodeLabel}
        defaultExpandedValue={["src", "components"]}
      >
        <TreeView.Tree>
          {nodes.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              indexPath={[index]}
              renderNode={renderNode}
            />
          ))}
        </TreeView.Tree>
      </TreeView.Root>
    </Box>
  );
}

const meta = preview.meta({
  title: "Components/Tree/TreeDropIndicator",
  component: TreeDropIndicator,
  tags: ["autodocs"],
  render: (args) => <DropTargetTree {...args} />,
});

export const ReorderAbove = meta.story({
  args: { instruction: { type: "reorder-above", currentLevel: 1 } },
});

export const ReorderBelow = meta.story({
  args: { instruction: { type: "reorder-below", currentLevel: 1 } },
});

export const MakeChild = meta.story({
  args: { instruction: { type: "make-child", currentLevel: 1 } },
});
