import { createTreeCollection, TreeView as ChakraTreeView } from "@chakra-ui/react";

export { createTreeCollection, ChakraTreeView };

export { TreeView, useTreeView } from "./TreeView";
export type { TreeViewProps, TreeViewConfig, TreeViewItem } from "./TreeView";

export {
  syncDataLoaderFeature,
  asyncDataLoaderFeature,
  selectionFeature,
  hotkeysCoreFeature,
  dragAndDropFeature,
  keyboardDragAndDropFeature,
  renamingFeature,
  searchFeature,
  expandAllFeature,
  checkboxesFeature,
  propMemoizationFeature,
  createOnDropHandler,
  insertItemsAtTarget,
  removeItemsFromParents,
} from "@headless-tree/core";

export type { TreeConfig, TreeInstance, TreeState, ItemInstance } from "@headless-tree/core";

export { AssistiveTreeDescription } from "@headless-tree/react";
