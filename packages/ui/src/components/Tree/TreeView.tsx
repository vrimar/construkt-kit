import { ark } from "@ark-ui/react/factory";
import {
  TreeView as ArkTreeView,
  TreeViewContext,
  TreeViewNodeContext,
  type TreeNode,
  useTreeViewContext,
  useTreeViewNodeContext,
} from "@ark-ui/react/tree-view";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type MouseEvent,
  createContext,
  useContext,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { type TreeViewVariantProps, treeView } from "#styled-system/recipes";

import type { StyledRootProps } from "../rootProps";

const { withProvider, withContext } = createSlotRecipeContext(treeView);

type RootProps = StyledRootProps<ArkTreeView.RootBaseProps<TreeNode>> & TreeViewVariantProps;

interface CheckableProps {
  /**
   * Rows carry a check state: each row is announced as checked, unchecked or mixed, Space toggles
   * it, and `NodeCheckbox` is its visual.
   */
  checkable?: boolean;
}

const CheckableContext = createContext(false);

const StyledRoot = withProvider(ArkTreeView.Root, "root") as ArkTreeView.RootComponent<RootProps>;
const StyledRootProvider = withProvider(
  ArkTreeView.RootProvider,
  "root",
) as ArkTreeView.RootProviderComponent<RootProps>;

const Root: ArkTreeView.RootComponent<RootProps & CheckableProps> = ({
  checkable = false,
  ...props
}) => (
  <CheckableContext value={checkable}>
    <StyledRoot {...props} />
  </CheckableContext>
);

const RootProvider: ArkTreeView.RootProviderComponent<RootProps & CheckableProps> = ({
  checkable = false,
  ...props
}) => (
  <CheckableContext value={checkable}>
    <StyledRootProvider {...props} />
  </CheckableContext>
);

function useAriaChecked(): "true" | "false" | "mixed" | undefined {
  const checkable = useContext(CheckableContext);
  const { checked } = useTreeViewNodeContext();
  if (!checkable) return undefined;
  return checked === "indeterminate" ? "mixed" : checked ? "true" : "false";
}

function useSpaceToggle<E extends HTMLElement>(
  onKeyDown: KeyboardEventHandler<E> | undefined,
): KeyboardEventHandler<E> {
  const checkable = useContext(CheckableContext);
  const tree = useTreeViewContext();
  const node = useTreeViewNodeContext();

  return (event: KeyboardEvent<E>) => {
    onKeyDown?.(event);
    if (!checkable || event.defaultPrevented || event.key !== " ") return;
    if (event.target !== event.currentTarget || node.disabled) return;
    event.preventDefault();
    tree.toggleChecked(node.value, node.isBranch);
  };
}

const Tree = withContext(ArkTreeView.Tree, "tree");
const Label = withContext(ArkTreeView.Label, "label");
const StyledBranch = withContext(ArkTreeView.Branch, "branch");
const StyledBranchControl = withContext(ArkTreeView.BranchControl, "branchControl", {
  defaultProps: { "data-reveal-group": "" },
});
const BranchTrigger = withContext(ArkTreeView.BranchTrigger, "branchTrigger");
const BranchIndicator = withContext(ArkTreeView.BranchIndicator, "branchIndicator", {
  defaultProps: { children: <ChevronRightIcon /> },
});
const BranchText = withContext(ArkTreeView.BranchText, "branchText");
const BranchContent = withContext(ArkTreeView.BranchContent, "branchContent");
const BranchIndentGuide = withContext(ArkTreeView.BranchIndentGuide, "branchIndentGuide");
const StyledItem = withContext(ArkTreeView.Item, "item", {
  defaultProps: { "data-reveal-group": "" },
});

function Branch(props: ComponentProps<typeof StyledBranch>) {
  return (
    <StyledBranch
      aria-checked={useAriaChecked()}
      {...props}
    />
  );
}

function BranchControl({ onKeyDown, ...props }: ComponentProps<typeof StyledBranchControl>) {
  return (
    <StyledBranchControl
      {...props}
      onKeyDown={useSpaceToggle(onKeyDown)}
    />
  );
}

function Item({ onKeyDown, ...props }: ComponentProps<typeof StyledItem>) {
  return (
    <StyledItem
      aria-checked={useAriaChecked()}
      {...props}
      onKeyDown={useSpaceToggle(onKeyDown)}
    />
  );
}

const ItemIndicator = withContext(ArkTreeView.ItemIndicator, "itemIndicator");
const ItemText = withContext(ArkTreeView.ItemText, "itemText");
const NodeProvider = ArkTreeView.NodeProvider;
const NodeCheckboxIndicator = ArkTreeView.NodeCheckboxIndicator;
// Not Ark's NodeCheckbox: a focusable `role="checkbox"` nested in the row fails `nested-interactive`.
const StyledNodeCheckbox = withContext(ark.span, "nodeCheckbox", {
  defaultProps: {
    "aria-hidden": true,
    "data-scope": "tree-view",
    "data-part": "node-checkbox",
    children: (
      <NodeCheckboxIndicator indeterminate={<MinusIcon />}>
        <CheckIcon />
      </NodeCheckboxIndicator>
    ),
  },
});

function NodeCheckbox({ onClick, ...props }: ComponentProps<typeof StyledNodeCheckbox>) {
  const tree = useTreeViewContext();
  const node = useTreeViewNodeContext();

  return (
    <StyledNodeCheckbox
      data-state={
        node.checked === "indeterminate" ? "indeterminate" : node.checked ? "checked" : "unchecked"
      }
      data-disabled={node.disabled || undefined}
      {...props}
      onClick={(event: MouseEvent<HTMLSpanElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || node.disabled || event.button !== 0) return;
        event.stopPropagation();
        tree.toggleChecked(node.value, node.isBranch);
        event.currentTarget
          .closest<HTMLElement>("[data-part=item], [data-part=branch-control]")
          ?.focus({ preventScroll: true });
      }}
    />
  );
}
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

export type TreeViewRootProps = ArkTreeView.RootComponentProps<
  TreeNode,
  RootProps & CheckableProps
>;
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
 * `NodeCheckbox` is decorative: set `checkable` on the root so the row itself carries the check
 * state and Space toggles it.
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
