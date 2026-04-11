import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, FileIcon, FolderIcon, MinusIcon } from "lucide-react";
import { createTreeCollection, TreeView } from ".";
import { Box, Flex } from "../Layout";

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

const meta: Meta = {
  title: "Components/TreeView",
  tags: ["autodocs"],
};

export default meta;

function TreeNode({ node, indexPath }: { node: Node; indexPath: number[] }) {
  return (
    <TreeView.NodeProvider
      key={node.id}
      node={node}
      indexPath={indexPath}
    >
      {node.children ? (
        <TreeView.Branch>
          <TreeView.BranchControl>
            <TreeView.BranchIndicator />
            <TreeView.BranchText>{node.name}</TreeView.BranchText>
          </TreeView.BranchControl>
          <TreeView.BranchContent>
            {node.children.map((child, index) => (
              <TreeNode
                key={child.id}
                node={child}
                indexPath={[...indexPath, index]}
              />
            ))}
          </TreeView.BranchContent>
        </TreeView.Branch>
      ) : (
        <TreeView.Item>
          <TreeView.ItemText>{node.name}</TreeView.ItemText>
        </TreeView.Item>
      )}
    </TreeView.NodeProvider>
  );
}

function CustomTreeNode({ node, indexPath }: { node: Node; indexPath: number[] }) {
  return (
    <TreeView.NodeProvider
      key={node.id}
      node={node}
      indexPath={indexPath}
    >
      {node.children ? (
        <TreeView.Branch>
          <TreeView.BranchControl>
            <TreeView.BranchIndicator />
            <FolderIcon />
            <TreeView.BranchText>{node.name}</TreeView.BranchText>
          </TreeView.BranchControl>
          <TreeView.BranchContent>
            {node.children.map((child, index) => (
              <CustomTreeNode
                key={child.id}
                node={child}
                indexPath={[...indexPath, index]}
              />
            ))}
          </TreeView.BranchContent>
        </TreeView.Branch>
      ) : (
        <TreeView.Item>
          <FileIcon />
          <TreeView.ItemText>{node.name}</TreeView.ItemText>
        </TreeView.Item>
      )}
    </TreeView.NodeProvider>
  );
}

function CheckboxTreeNode({ node, indexPath }: { node: Node; indexPath: number[] }) {
  return (
    <TreeView.NodeProvider
      key={node.id}
      node={node}
      indexPath={indexPath}
    >
      {node.children ? (
        <TreeView.Branch>
          <TreeView.BranchControl>
            <TreeView.NodeCheckbox>
              <TreeView.NodeCheckboxIndicator indeterminate={<MinusIcon />}>
                <CheckIcon />
              </TreeView.NodeCheckboxIndicator>
            </TreeView.NodeCheckbox>
            <TreeView.BranchIndicator />
            <TreeView.BranchText>{node.name}</TreeView.BranchText>
          </TreeView.BranchControl>
          <TreeView.BranchContent>
            {node.children.map((child, index) => (
              <CheckboxTreeNode
                key={child.id}
                node={child}
                indexPath={[...indexPath, index]}
              />
            ))}
          </TreeView.BranchContent>
        </TreeView.Branch>
      ) : (
        <TreeView.Item>
          <TreeView.NodeCheckbox>
            <TreeView.NodeCheckboxIndicator indeterminate={<MinusIcon />}>
              <CheckIcon />
            </TreeView.NodeCheckboxIndicator>
          </TreeView.NodeCheckbox>
          <TreeView.ItemText>{node.name}</TreeView.ItemText>
        </TreeView.Item>
      )}
    </TreeView.NodeProvider>
  );
}

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
          {collection.rootNode.children!.map((node, index) => (
            <TreeNode
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
          {collection.rootNode.children!.map((node, index) => (
            <CustomTreeNode
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
          {collection.rootNode.children!.map((node, index) => (
            <CheckboxTreeNode
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

export const Sizes: StoryObj = {
  render: () => (
    <Flex
      gap="6"
      p="4"
      align="flex-start"
    >
      {(["sm", "md"] as const).map((size) => (
        <Box
          key={size}
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
              {collection.rootNode.children!.map((node, index) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  indexPath={[index]}
                />
              ))}
            </TreeView.Tree>
          </TreeView.Root>
        </Box>
      ))}
    </Flex>
  ),
};
