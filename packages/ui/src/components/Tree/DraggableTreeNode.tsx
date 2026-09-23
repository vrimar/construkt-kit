import { type TreeCollection, type TreeNode, useTreeViewContext } from "@ark-ui/react/tree-view";
import type { ReactNode } from "react";

import { TreeDndRow, TreeNodeLabel, type TreeNodeRenderDetails } from "./TreeRow";
import { TreeView } from "./TreeView";

export type DraggableTreeNodeRenderDetails<T extends TreeNode> = TreeNodeRenderDetails<T>;

export interface DraggableTreeNodeProps<T extends TreeNode> {
  node: T;
  indexPath: number[];
  /** Render custom row content (label + icons). Defaults to the node's string label. */
  renderNode?: (details: TreeNodeRenderDetails<T>) => ReactNode;
}

/**
 * Drop-in tree node: renders `NodeProvider` + `Branch`/`Item` recursively from the tree's
 * collection. Must be rendered inside a `TreeView.Root`/`RootProvider`; drag and drop is wired
 * when it is also inside a `TreeViewDndProvider`.
 */
export function DraggableTreeNode<T extends TreeNode>({
  node,
  indexPath,
  renderNode,
}: DraggableTreeNodeProps<T>) {
  const collection = useTreeViewContext().collection as TreeCollection<T>;

  const children = collection.getNodeChildren(node);
  const isBranch = collection.isBranchNode(node);

  const content = renderNode?.({ node, indexPath, isBranch }) ?? (
    <TreeNodeLabel isBranch={isBranch}>{collection.stringifyNode(node)}</TreeNodeLabel>
  );

  return (
    <TreeView.NodeProvider
      node={node}
      indexPath={indexPath}
    >
      {isBranch ? (
        <TreeView.Branch>
          <TreeDndRow isBranch>
            <TreeView.BranchIndicator />
            {content}
          </TreeDndRow>
          <TreeView.BranchContent>
            {children.map((child, index) => (
              <DraggableTreeNode
                key={collection.getNodeValue(child)}
                node={child}
                indexPath={[...indexPath, index]}
                renderNode={renderNode}
              />
            ))}
          </TreeView.BranchContent>
        </TreeView.Branch>
      ) : (
        <TreeDndRow isBranch={false}>{content}</TreeDndRow>
      )}
    </TreeView.NodeProvider>
  );
}
