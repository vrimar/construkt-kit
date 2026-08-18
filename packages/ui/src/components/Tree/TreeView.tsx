import { ark } from "@ark-ui/react/factory";
import {
  TreeView as ArkTreeView,
  TreeViewContext,
  TreeViewNodeContext,
} from "@ark-ui/react/tree-view";
import { type HTMLStyledProps, createStyleContext } from "@construkt-kit/styled-system/jsx";
import { type TreeViewVariantProps, treeView } from "@construkt-kit/styled-system/recipes";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";

const { withProvider, withContext } = createStyleContext(treeView);

type RootProps = HTMLStyledProps<"div"> & TreeViewVariantProps;

const Root = withProvider(ArkTreeView.Root, "root") as ArkTreeView.RootComponent<RootProps>;
const RootProvider = withProvider(
  ArkTreeView.RootProvider,
  "root",
) as ArkTreeView.RootProviderComponent<RootProps>;
const Tree = withContext(ArkTreeView.Tree, "tree");
const Label = withContext(ArkTreeView.Label, "label");
const Branch = withContext(ArkTreeView.Branch, "branch");
const BranchControl = withContext(ArkTreeView.BranchControl, "branchControl");
const BranchTrigger = withContext(ArkTreeView.BranchTrigger, "branchTrigger");
const BranchIndicator = withContext(ArkTreeView.BranchIndicator, "branchIndicator", {
  defaultProps: { children: <ChevronRightIcon /> },
});
const BranchText = withContext(ArkTreeView.BranchText, "branchText");
const BranchContent = withContext(ArkTreeView.BranchContent, "branchContent");
const BranchIndentGuide = withContext(ArkTreeView.BranchIndentGuide, "branchIndentGuide");
const Item = withContext(ArkTreeView.Item, "item");
const ItemIndicator = withContext(ArkTreeView.ItemIndicator, "itemIndicator");
const ItemText = withContext(ArkTreeView.ItemText, "itemText");
const NodeProvider = ArkTreeView.NodeProvider;
const NodeCheckbox = withContext(ArkTreeView.NodeCheckbox, "nodeCheckbox");
const NodeCheckboxIndicator = ArkTreeView.NodeCheckboxIndicator;
const NodeRenameInput = withContext(ArkTreeView.NodeRenameInput, "nodeRenameInput");
// Not an Ark part — a drag-and-drop drop indicator that inherits the tree's size context.
const DropIndicator = withContext(ark.div, "dropIndicator");

export type TreeViewRootProps = ComponentProps<typeof Root>;
export type { TreeViewVariantProps };

/**
 * Styled Ark UI TreeView primitives. Drive `Root` with a collection from
 * `createTreeCollection`, recursing over nodes inside `NodeProvider` (needs
 * `node` + `indexPath`) to render `Branch`/`Item` parts.
 *
 * `DropIndicator` is a low-level styled slot for drag-and-drop that expects a
 * manually set `data-instruction` and inset — most consumers should use the
 * higher-level `TreeDropIndicator` (from `./dnd`) instead.
 */
export const TreeView = {
  Root,
  RootProvider,
  Tree,
  Label,
  Branch,
  BranchControl,
  BranchTrigger,
  BranchIndicator,
  BranchText,
  BranchContent,
  BranchIndentGuide,
  Item,
  ItemIndicator,
  ItemText,
  NodeProvider,
  NodeCheckbox,
  NodeCheckboxIndicator,
  NodeRenameInput,
  DropIndicator,
  Context: TreeViewContext,
  NodeContext: TreeViewNodeContext,
};
