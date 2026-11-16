import { ark } from "@ark-ui/react/factory";
import {
  TreeView as ArkTreeView,
  TreeViewContext,
  TreeViewNodeContext,
  type TreeNode,
} from "@ark-ui/react/tree-view";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type TreeViewVariantProps, treeView } from "#styled-system/recipes";

import type { StyledRootProps } from "../rootProps";

const { withProvider, withContext } = createSlotRecipeContext(treeView);

type RootProps = StyledRootProps<ArkTreeView.RootBaseProps<TreeNode>> & TreeViewVariantProps;

const Root = withProvider(ArkTreeView.Root, "root") as ArkTreeView.RootComponent<RootProps>;
const RootProvider = withProvider(
  ArkTreeView.RootProvider,
  "root",
) as ArkTreeView.RootProviderComponent<RootProps>;
const Tree = withContext(ArkTreeView.Tree, "tree");
const Label = withContext(ArkTreeView.Label, "label");
const Branch = withContext(ArkTreeView.Branch, "branch");
const BranchControl = withContext(ArkTreeView.BranchControl, "branchControl", {
  defaultProps: { "data-reveal-group": "" },
});
const BranchTrigger = withContext(ArkTreeView.BranchTrigger, "branchTrigger");
const BranchIndicator = withContext(ArkTreeView.BranchIndicator, "branchIndicator", {
  defaultProps: { children: <ChevronRightIcon /> },
});
const BranchText = withContext(ArkTreeView.BranchText, "branchText");
const BranchContent = withContext(ArkTreeView.BranchContent, "branchContent");
const BranchIndentGuide = withContext(ArkTreeView.BranchIndentGuide, "branchIndentGuide");
const Item = withContext(ArkTreeView.Item, "item", {
  defaultProps: { "data-reveal-group": "" },
});
const ItemIndicator = withContext(ArkTreeView.ItemIndicator, "itemIndicator");
const ItemText = withContext(ArkTreeView.ItemText, "itemText");
const NodeProvider = ArkTreeView.NodeProvider;
const NodeCheckboxIndicator = ArkTreeView.NodeCheckboxIndicator;
const NodeCheckbox = withContext(ArkTreeView.NodeCheckbox, "nodeCheckbox", {
  defaultProps: {
    children: (
      <NodeCheckboxIndicator indeterminate={<MinusIcon />}>
        <CheckIcon />
      </NodeCheckboxIndicator>
    ),
  },
});
const StyledNodeRenameInput = withContext(ArkTreeView.NodeRenameInput, "nodeRenameInput");
// Not an Ark part — a drag-and-drop drop indicator that inherits the tree's size context.
const DropIndicator = withContext(ark.div, "dropIndicator");
const StyledNodeActions = withContext(ark.div, "nodeActions");
const BranchCount = withContext(ark.span, "branchCount");
export const FlatIndentGuide = withContext(ark.div, "branchIndentGuide");
export const FlatBranchControl = withContext(ark.div, "branchControl");
export const FlatBranchIndicator = withContext(ark.span, "branchIndicator");
export const FlatNodeCheckbox = withContext(ark.span, "nodeCheckbox");
export const TreeRowContent = withContext(ark.div, "nodeContent");

function NodeActions({ onClick, onKeyDown, ...props }: ComponentProps<typeof StyledNodeActions>) {
  return (
    <StyledNodeActions
      {...props}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        onKeyDown?.(event);
      }}
    />
  );
}

function NodeRenameInput({ onClick, ...props }: ComponentProps<typeof StyledNodeRenameInput>) {
  return (
    <StyledNodeRenameInput
      {...props}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
    />
  );
}

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
 *
 * `NodeActions` holds a row's trailing controls and keeps their clicks and keys from the row; the
 * root's `actionsVisibility="hover"` reveals them with the row. `BranchCount` is a muted count at
 * the end of a branch row.
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
  BranchCount,
  BranchContent,
  BranchIndentGuide,
  Item,
  ItemIndicator,
  ItemText,
  NodeProvider,
  NodeCheckbox,
  NodeCheckboxIndicator,
  NodeRenameInput,
  NodeActions,
  DropIndicator,
  Context: TreeViewContext,
  NodeContext: TreeViewNodeContext,
};
