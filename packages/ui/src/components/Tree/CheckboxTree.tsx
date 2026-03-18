import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";
import { useTreeView } from "@ark-ui/react/tree-view";
import { CheckIcon, MinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Box } from "styled-system/jsx";

import { VirtualScrollArea } from "../VirtualScrollArea";
import { TreeView } from "./TreeView";
import { DEFAULT_TREE_SIZE, TREE_ROW_HEIGHT_ESTIMATE, type TreeSize } from "./treeShared";

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
  size?: TreeSize;
  /** Render custom node content. Defaults to the node label. */
  renderNode?: (details: { node: T; indexPath: number[]; isBranch: boolean }) => ReactNode;
  /** Render actions aligned to the end of a row. */
  renderActions?: (details: { node: T; indexPath: number[]; isBranch: boolean }) => ReactNode;
  /** Determine whether a node should show a checkbox. Defaults to true for all nodes. */
  isNodeCheckable?: (details: { node: T; indexPath: number[]; isBranch: boolean }) => boolean;
}

const TreeNodeCheckbox = () => (
  <TreeView.NodeCheckbox>
    <TreeView.NodeCheckboxIndicator indeterminate={<MinusIcon />}>
      <CheckIcon />
    </TreeView.NodeCheckboxIndicator>
  </TreeView.NodeCheckbox>
);

const TreeRowIndentGuides = ({ indexPath }: { indexPath: number[] }) => {
  const ancestorDepths = Array.from({ length: Math.max(0, indexPath.length - 1) }, (_, index) =>
    index + 1,
  );

  if (ancestorDepths.length === 0) return null;

  return ancestorDepths.map((depth) => (
    <Box
      key={depth}
      aria-hidden="true"
      data-part="branch-indent-guide"
      data-scope="tree-view"
      data-virtualized="true"
      position="absolute"
      top="0"
      bottom="0"
      width="1px"
      bg="border"
      pointerEvents="none"
      style={{
        insetInlineStart: `calc(var(--tree-padding-inline) + ((${depth} - 1) * var(--tree-indent)) + (var(--tree-icon-size) * 0.5))`,
      }}
    />
  ));
};

export const CheckboxTree = <T extends TreeNode>({
  collection,
  checkedValue,
  onCheckedChange,
  defaultCheckedValue,
  expandedValue,
  onExpandedChange,
  defaultExpandedValue,
  maxHeight = "200px",
  size = DEFAULT_TREE_SIZE,
  renderNode,
  renderActions,
  isNodeCheckable,
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
        itemHeight={TREE_ROW_HEIGHT_ESTIMATE[size]}
        getItemKey={(index) => collection.getNodeValue(visibleNodes[index].node)}
        maxHeight={maxHeight}
        measure
        borderWidth="1px"
        borderColor="border"
        borderRadius="md"
        p="2"
      >
        {({ node, indexPath }) => {
          const nodeState = tree.getNodeState({ node, indexPath });
          const value = collection.getNodeValue(node);
          const isBranch = nodeState.isBranch;
          const checkable = isNodeCheckable
            ? isNodeCheckable({ node, indexPath, isBranch })
            : true;
          const renderedNode = renderNode?.({ node, indexPath, isBranch });
          const renderedActions = renderActions?.({ node, indexPath, isBranch });

          return (
            <TreeView.NodeProvider
              key={value}
              node={node}
              indexPath={indexPath}
            >
              {isBranch ? (
                <TreeView.BranchControl
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    tree.focus(value);
                  }}
                >
                  <TreeRowIndentGuides indexPath={indexPath} />
                  <TreeView.BranchIndicator />
                  {checkable && <TreeNodeCheckbox />}
                  <Box
                    flex="1"
                    minWidth="0"
                  >
                    {renderedNode ?? (
                      <TreeView.BranchText>{collection.stringifyNode(node)}</TreeView.BranchText>
                    )}
                  </Box>
                  {renderedActions && (
                    <Box
                      flexShrink={0}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderedActions}
                    </Box>
                  )}
                </TreeView.BranchControl>
              ) : (
                <TreeView.Item
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    tree.focus(value);
                  }}
                >
                  <TreeRowIndentGuides indexPath={indexPath} />
                  {checkable && <TreeNodeCheckbox />}
                  <Box
                    flex="1"
                    minWidth="0"
                  >
                    {renderedNode ?? (
                      <TreeView.ItemText>{collection.stringifyNode(node)}</TreeView.ItemText>
                    )}
                  </Box>
                  {renderedActions && (
                    <Box
                      flexShrink={0}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderedActions}
                    </Box>
                  )}
                </TreeView.Item>
              )}
            </TreeView.NodeProvider>
          );
        }}
      </VirtualScrollArea>
    </TreeView.RootProvider>
  );
};
