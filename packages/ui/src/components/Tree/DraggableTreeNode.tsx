import type { ReactNode } from "react";

import { TreeDndRow, TreeNodeContent, type TreeNodeRenderDetails } from "./TreeRow";
import { TreeView, useTreeContext } from "./TreeView";

export interface DraggableTreeNodeProps<T> {
  node: T;
  indexPath: number[];
  /** Render custom row content (label + icons). Defaults to the node's string label. */
  renderNode?: (details: TreeNodeRenderDetails<T>) => ReactNode;
}

/**
 * Drop-in tree node: renders `NodeProvider` + `Branch`/`Item` recursively from the tree's
 * nodes. Must be rendered inside a `TreeView.Root`; drag and drop is wired when it is also inside
 * a `TreeViewDndProvider`.
 */
export function DraggableTreeNode<T>({ node, indexPath, renderNode }: DraggableTreeNodeProps<T>) {
  const { collection } = useTreeContext();

  const children = collection.getNodeChildren(node);
  const isBranch = collection.isBranchNode(node);

  const content = (
    <TreeNodeContent
      details={{ node, indexPath, isBranch }}
      renderNode={renderNode}
    />
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
                node={child as T}
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
