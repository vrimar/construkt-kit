import type { TreeNode } from "@ark-ui/react/tree-view";
import type { ReactNode } from "react";

import { useTreeDndContext } from "./dnd/TreeDndContext";
import { TreeDropIndicator } from "./dnd/TreeDropIndicator";
import { useTreeNodeDnd } from "./dnd/useTreeNodeDnd";
import { TreeView } from "./TreeView";

export interface DraggableTreeNodeRenderDetails<T extends TreeNode> {
  node: T;
  indexPath: number[];
  isBranch: boolean;
}

export interface DraggableTreeNodeProps<T extends TreeNode> {
  node: T;
  indexPath: number[];
  /** Render custom row content (label + icons). Defaults to the node's string label. */
  renderNode?: (details: DraggableTreeNodeRenderDetails<T>) => ReactNode;
}

/**
 * Drop-in draggable tree node: renders `NodeProvider` + `Branch`/`Item`, wires drag &
 * drop, and shows the drop indicator. Must be rendered inside a `TreeViewDndProvider`
 * (and a `TreeView.Root`/`RootProvider`); it reads the collection from the DnD context.
 */
export function DraggableTreeNode<T extends TreeNode>({
  node,
  indexPath,
  renderNode,
}: DraggableTreeNodeProps<T>) {
  const dnd = useTreeDndContext();
  if (!dnd) {
    throw new Error("DraggableTreeNode must be rendered inside a <TreeViewDndProvider>.");
  }
  const collection = dnd.collectionRef.current;

  const children = collection.getNodeChildren(node);
  const isBranch = collection.isBranchNode(node);
  const label = collection.stringifyNode(node);

  const content =
    renderNode?.({ node, indexPath, isBranch }) ??
    (isBranch ? (
      <TreeView.BranchText>{label}</TreeView.BranchText>
    ) : (
      <TreeView.ItemText>{label}</TreeView.ItemText>
    ));

  return (
    <TreeView.NodeProvider
      node={node}
      indexPath={indexPath}
    >
      {isBranch ? (
        <TreeView.Branch>
          <DraggableRow isBranch>{content}</DraggableRow>
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
        <DraggableRow isBranch={false}>{content}</DraggableRow>
      )}
    </TreeView.NodeProvider>
  );
}

function DraggableRow({ isBranch, children }: { isBranch: boolean; children: ReactNode }) {
  const { ref, isDragging, instruction, dragPreview } = useTreeNodeDnd();

  if (isBranch) {
    return (
      <TreeView.BranchControl
        ref={ref}
        data-dragging={isDragging || undefined}
      >
        <TreeView.BranchIndicator />
        {children}
        <TreeDropIndicator instruction={instruction} />
        {dragPreview}
      </TreeView.BranchControl>
    );
  }

  return (
    <TreeView.Item
      ref={ref}
      data-dragging={isDragging || undefined}
    >
      {children}
      <TreeDropIndicator instruction={instruction} />
      {dragPreview}
    </TreeView.Item>
  );
}
