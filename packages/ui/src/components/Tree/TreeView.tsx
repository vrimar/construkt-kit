import {
  TreeView as ArkTreeView,
  TreeViewContext,
  TreeViewNodeContext,
} from "@ark-ui/react/tree-view";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { createStyleContext } from "styled-system/jsx";
import { type TreeViewVariantProps, treeView } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(treeView);

type RootProps = TreeViewVariantProps;

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

export type TreeViewRootProps = ComponentProps<typeof Root>;

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
  Context: TreeViewContext,
  NodeContext: TreeViewNodeContext,
};
