import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@chakra-ui/react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
  createOnDropHandler,
} from "@headless-tree/core";
import { FiFile, FiFolder } from "react-icons/fi";

import { TreeView, useTreeView } from "./TreeView";

interface Item {
  name: string;
  children?: string[];
  isFolder?: boolean;
}

const items: Record<string, Item> = {
  root: { name: "Root", children: ["src", "docs", "config"], isFolder: true },
  src: { name: "src", children: ["components", "utils", "index-ts"], isFolder: true },
  components: { name: "components", children: ["button", "input", "dialog"], isFolder: true },
  button: { name: "Button.tsx" },
  input: { name: "Input.tsx" },
  dialog: { name: "Dialog.tsx" },
  utils: { name: "utils", children: ["format", "validate"], isFolder: true },
  format: { name: "format.ts" },
  validate: { name: "validate.ts" },
  "index-ts": { name: "index.ts" },
  docs: { name: "docs", children: ["readme", "changelog"], isFolder: true },
  readme: { name: "README.md" },
  changelog: { name: "CHANGELOG.md" },
  config: { name: "config", children: ["tsconfig"], isFolder: true },
  tsconfig: { name: "tsconfig.json" },
};

const meta: Meta = {
  title: "Components/TreeView",
  tags: ["autodocs"],
};

export default meta;

export const Basic: StoryObj = {
  render: () => {
    const tree = useTreeView<Item>({
      rootItemId: "root",
      getItemName: (item) => item.getItemData().name,
      isItemFolder: (item) => !!item.getItemData().isFolder,
      initialState: { expandedItems: ["src", "components"] },
      indent: 20,
      dataLoader: {
        getItem: (id) => items[id],
        getChildren: (id) => items[id].children ?? [],
      },
    });

    return (
      <Box
        maxW="320px"
        border="1px solid"
        borderColor="border"
        rounded="md"
        p="2"
      >
        <TreeView tree={tree} />
      </Box>
    );
  },
};

export const WithCustomRender: StoryObj = {
  render: () => {
    const tree = useTreeView<Item>({
      rootItemId: "root",
      getItemName: (item) => item.getItemData().name,
      isItemFolder: (item) => !!item.getItemData().isFolder,
      initialState: { expandedItems: ["src"] },
      indent: 20,
      dataLoader: {
        getItem: (id) => items[id],
        getChildren: (id) => items[id].children ?? [],
      },
    });

    return (
      <Box
        maxW="320px"
        border="1px solid"
        borderColor="border"
        rounded="md"
        p="2"
      >
        <TreeView
          tree={tree}
          renderItem={(item) => (
            <Box
              asChild
              display="flex"
              alignItems="center"
              gap="2"
              w="full"
              textAlign="start"
              rounded="sm"
              cursor="pointer"
              userSelect="none"
              px="2"
              py="1"
              _hover={{ bg: "bg.subtle" }}
              style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
              {...(item.isSelected() && { bg: "colorPalette.subtle", color: "colorPalette.fg" })}
            >
              <button {...item.getProps()}>
                <Box
                  as="span"
                  color="fg.muted"
                >
                  {item.isFolder() ? <FiFolder /> : <FiFile />}
                </Box>
                <Box
                  as="span"
                  truncate
                >
                  {item.getItemName()}
                </Box>
              </button>
            </Box>
          )}
        />
      </Box>
    );
  },
};

export const DragAndDrop: StoryObj = {
  render: () => {
    const data: Record<string, Item> = JSON.parse(JSON.stringify(items));

    const tree = useTreeView<Item>({
      rootItemId: "root",
      getItemName: (item) => item.getItemData().name,
      isItemFolder: (item) => !!item.getItemData().isFolder,
      initialState: { expandedItems: ["src", "components", "docs"] },
      indent: 20,
      canReorder: true,
      onDrop: createOnDropHandler((item, newChildren) => {
        data[item.getId()].children = newChildren;
      }),
      dataLoader: {
        getItem: (id) => data[id],
        getChildren: (id) => data[id].children ?? [],
      },
      features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature, dragAndDropFeature],
    });

    return (
      <Box
        maxW="320px"
        border="1px solid"
        borderColor="border"
        rounded="md"
        p="2"
      >
        <TreeView tree={tree} />
        <Box
          style={tree.getDragLineStyle()}
          h="0.5"
          bg="colorPalette.solid"
          position="relative"
        />
      </Box>
    );
  },
};
