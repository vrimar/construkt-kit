import preview from "@construkt-kit/story-kit/preview";
import { FileIcon, FolderIcon } from "lucide-react";
import { useState } from "react";

import { treeView } from "#styled-system/recipes";

import { DraggableTreeNode, type TreeNodeRenderDetails, TreeView, TreeViewDndProvider } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const accessors = {
  getNodeValue: (node: Node) => node.id,
  getNodeLabel: (node: Node) => node.name,
};

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
          { id: "dialog", name: "Dialog.tsx" },
        ],
      },
      {
        id: "utils",
        name: "utils",
        children: [
          { id: "format", name: "format.ts" },
          { id: "validate", name: "validate.ts" },
        ],
      },
      { id: "index-ts", name: "index.ts" },
    ],
  },
  {
    id: "docs",
    name: "docs",
    children: [
      { id: "readme", name: "README.md" },
      { id: "changelog", name: "CHANGELOG.md" },
    ],
  },
  {
    id: "config",
    name: "config",
    children: [{ id: "tsconfig", name: "tsconfig.json" }],
  },
];

const renderWithIcons = ({ node, isBranch }: TreeNodeRenderDetails<Node>) =>
  isBranch ? (
    <>
      <FolderIcon />
      <TreeView.BranchText>{node.name}</TreeView.BranchText>
    </>
  ) : (
    <>
      <FileIcon />
      <TreeView.ItemText>{node.name}</TreeView.ItemText>
    </>
  );

const renderWithCheckbox = ({ node, isBranch }: TreeNodeRenderDetails<Node>) => (
  <>
    <TreeView.NodeCheckbox />
    {isBranch ? (
      <TreeView.BranchText>{node.name}</TreeView.BranchText>
    ) : (
      <TreeView.ItemText>{node.name}</TreeView.ItemText>
    )}
  </>
);

const meta = preview.meta({
  title: "Components/TreeView",
  tags: ["autodocs"],
});

export const Basic = meta.story({
  render: () => (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        nodes={nodes}
        {...accessors}
        defaultExpandedValue={["src", "components"]}
      >
        <TreeView.Tree>
          {nodes.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              indexPath={[index]}
            />
          ))}
        </TreeView.Tree>
      </TreeView.Root>
    </Box>
  ),
});

export const WithCustomRender = meta.story({
  render: () => (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        nodes={nodes}
        {...accessors}
        defaultExpandedValue={["src"]}
      >
        <TreeView.Tree>
          {nodes.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              indexPath={[index]}
              renderNode={renderWithIcons}
            />
          ))}
        </TreeView.Tree>
      </TreeView.Root>
    </Box>
  ),
});

export const WithCheckboxes = meta.story({
  render: () => (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        nodes={nodes}
        {...accessors}
        defaultExpandedValue={["src", "components"]}
        checkable
      >
        <TreeView.Tree>
          {nodes.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              indexPath={[index]}
              renderNode={renderWithCheckbox}
            />
          ))}
        </TreeView.Tree>
      </TreeView.Root>
    </Box>
  ),
});

function DragAndDropExample() {
  const [treeNodes, setTreeNodes] = useState(nodes);

  return (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        nodes={treeNodes}
        {...accessors}
        defaultExpandedValue={["src", "components"]}
      >
        <TreeViewDndProvider onNodesChange={setTreeNodes}>
          <TreeView.Tree>
            {treeNodes.map((node, index) => (
              <DraggableTreeNode
                key={node.id}
                node={node}
                indexPath={[index]}
                renderNode={renderWithIcons}
              />
            ))}
          </TreeView.Tree>
        </TreeViewDndProvider>
      </TreeView.Root>
    </Box>
  );
}

export const WithDragAndDrop = meta.story({
  render: () => <DragAndDropExample />,
});

const sectionNodes: Node[] = ["Design", "Engineering", "Marketing", "Sales"].map((section) => ({
  id: section,
  name: section,
  children: Array.from({ length: 8 }, (_, index) => ({
    id: `${section}-${index + 1}`,
    name: `${section} file ${index + 1}`,
  })),
}));

const renderWithCount = ({ node, isBranch }: TreeNodeRenderDetails<Node>) =>
  isBranch ? (
    <>
      <TreeView.BranchText>{node.name}</TreeView.BranchText>
      <TreeView.BranchCount>{node.children?.length}</TreeView.BranchCount>
    </>
  ) : (
    <TreeView.ItemText>{node.name}</TreeView.ItemText>
  );

/** Each branch row sticks to the top of the scroll container while its children scroll past. */
export const StickyBranches = meta.story({
  render: () => (
    <Box
      maxW="320px"
      h="280px"
      overflowY="auto"
      border="1px solid"
      borderColor="border"
      rounded="md"
      px="2"
      pb="2"
    >
      <TreeView.Root
        nodes={sectionNodes}
        {...accessors}
        defaultExpandedValue={["Design", "Engineering", "Marketing", "Sales"]}
        stickyBranches
      >
        <TreeView.Tree>
          {sectionNodes.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              indexPath={[index]}
              renderNode={renderWithCount}
            />
          ))}
        </TreeView.Tree>
      </TreeView.Root>
    </Box>
  ),
});

const longNameNodes: Node[] = [
  {
    id: "redesign",
    name: "Website redesign, phase 2 (research from March to April)",
    children: [
      { id: "interviews", name: "Interview notes from the first round of customer calls" },
      { id: "sitemap", name: "Sitemap" },
      { id: "comparison", name: "Comparison against the three nearest competitors by feature" },
    ],
  },
];

/** Long names wrap onto two lines before truncating. */
export const ClampedText = meta.story({
  render: () => (
    <Box
      maxW="240px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        nodes={longNameNodes}
        {...accessors}
        defaultExpandedValue={["redesign"]}
        clampText
      >
        <TreeView.Tree>
          {longNameNodes.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              indexPath={[index]}
              renderNode={renderWithIcons}
            />
          ))}
        </TreeView.Tree>
      </TreeView.Root>
    </Box>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={treeView.variantMap.size}
      renderPreview={(size) => (
        <Box
          minW="240px"
          border="1px solid"
          borderColor="border"
          rounded="md"
          p="2"
        >
          <TreeView.Root
            nodes={nodes}
            {...accessors}
            defaultExpandedValue={["src"]}
            size={size}
          >
            <TreeView.Tree>
              {nodes.map((node, index) => (
                <DraggableTreeNode
                  key={node.id}
                  node={node}
                  indexPath={[index]}
                />
              ))}
            </TreeView.Tree>
          </TreeView.Root>
        </Box>
      )}
    />
  ),
});
