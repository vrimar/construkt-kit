import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";
import { useTreeView } from "@ark-ui/react/tree-view";
import { CheckIcon, MinusIcon } from "lucide-react";

import { VirtualScrollArea } from "../VirtualScrollArea";
import { TreeView } from "./TreeView";

export interface CheckboxTreeProps<T extends TreeNode> {
  /** The tree collection. Create with `createTreeCollection()`. */
  collection: TreeCollection<T>;
  /** Controlled checked node IDs. */
  checkedValue?: string[];
  /** Callback when checked nodes change. */
  onCheckedChange?: (checkedValue: string[]) => void;
  /** Initial checked node IDs (uncontrolled). */
  defaultCheckedValue?: string[];
  /** Controlled expanded node IDs. */
  expandedValue?: string[];
  /** Callback when expanded nodes change. */
  onExpandedChange?: (expandedValue: string[]) => void;
  /** Initial expanded node IDs (uncontrolled). */
  defaultExpandedValue?: string[];
  /** Max height for the scroll area. @default "200px" */
  maxHeight?: string;
  /** Size variant. @default "md" */
  size?: "sm" | "md";
}

const ROW_HEIGHT = 32;

export const CheckboxTree = <T extends TreeNode>({
  collection,
  checkedValue,
  onCheckedChange,
  defaultCheckedValue,
  expandedValue,
  onExpandedChange,
  defaultExpandedValue,
  maxHeight = "200px",
  size,
}: CheckboxTreeProps<T>) => {
  const tree = useTreeView({
    collection,
    checkedValue,
    onCheckedChange: onCheckedChange
      ? (details) => onCheckedChange(details.checkedValue)
      : undefined,
    defaultCheckedValue,
    expandedValue,
    onExpandedChange: onExpandedChange
      ? (details) => onExpandedChange(details.expandedValue)
      : undefined,
    defaultExpandedValue,
  });

  const visibleNodes = tree.getVisibleNodes();

  return (
    <TreeView.RootProvider
      value={tree as ReturnType<typeof useTreeView>}
      size={size}
    >
      <VirtualScrollArea
        items={visibleNodes}
        itemHeight={ROW_HEIGHT}
        maxHeight={maxHeight}
        borderWidth="1px"
        borderColor="border"
        borderRadius="md"
        p="2"
      >
        {({ node, indexPath }) => {
          const nodeState = tree.getNodeState({ node, indexPath });
          const value = collection.getNodeValue(node);
          return (
            <TreeView.NodeProvider
              node={node}
              indexPath={indexPath}
            >
              {nodeState.isBranch ? (
                <TreeView.BranchControl
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    tree.focus(value);
                  }}
                >
                  <TreeView.BranchIndicator />
                  <TreeView.NodeCheckbox>
                    <TreeView.NodeCheckboxIndicator indeterminate={<MinusIcon />}>
                      <CheckIcon />
                    </TreeView.NodeCheckboxIndicator>
                  </TreeView.NodeCheckbox>
                  <TreeView.BranchText>{collection.stringifyNode(node)}</TreeView.BranchText>
                </TreeView.BranchControl>
              ) : (
                <TreeView.Item
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    tree.focus(value);
                  }}
                >
                  <TreeView.NodeCheckbox>
                    <TreeView.NodeCheckboxIndicator>
                      <CheckIcon />
                    </TreeView.NodeCheckboxIndicator>
                  </TreeView.NodeCheckbox>
                  <TreeView.ItemText>{collection.stringifyNode(node)}</TreeView.ItemText>
                </TreeView.Item>
              )}
            </TreeView.NodeProvider>
          );
        }}
      </VirtualScrollArea>
    </TreeView.RootProvider>
  );
};
