import { treeView } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileIcon, FolderIcon } from "lucide-react";
import { useState } from "react";

import {
  DraggableTreeNode,
  type TreeNodeRenderDetails,
  TreeView,
  TreeViewDndProvider,
  createTreeCollection,
} from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const collection = createTreeCollection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "root",
    name: "",
    children: [
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
    ],
  },
});

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

const meta: Meta = {
  title: "Components/TreeView",
  tags: ["autodocs"],
};

export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        collection={collection}
        defaultExpandedValue={["src", "components"]}
      >
        <TreeView.Tree>
          {collection.rootNode.children?.map((node, index) => (
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
};

export const WithCustomRender: StoryObj = {
  render: () => (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        collection={collection}
        defaultExpandedValue={["src"]}
      >
        <TreeView.Tree>
          {collection.rootNode.children?.map((node, index) => (
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
};

export const WithCheckboxes: StoryObj = {
  render: () => (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        collection={collection}
        defaultExpandedValue={["src", "components"]}
      >
        <TreeView.Tree>
          {collection.rootNode.children?.map((node, index) => (
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
};

function DragAndDropExample() {
  const [treeCollection, setTreeCollection] = useState(collection);

  return (
    <Box
      maxW="320px"
      border="1px solid"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <TreeView.Root
        collection={treeCollection}
        defaultExpandedValue={["src", "components"]}
      >
        <TreeViewDndProvider
          collection={treeCollection}
          onCollectionChange={setTreeCollection}
        >
          <TreeView.Tree>
            {treeCollection.rootNode.children?.map((node, index) => (
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

export const WithDragAndDrop: StoryObj = {
  render: () => <DragAndDropExample />,
};

export const Sizes: StoryObj = {
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
            collection={collection}
            defaultExpandedValue={["src"]}
            size={size}
          >
            <TreeView.Tree>
              {collection.rootNode.children?.map((node, index) => (
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
};
