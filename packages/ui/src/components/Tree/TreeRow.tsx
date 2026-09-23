import type { TreeNode } from "@ark-ui/react/tree-view";
import type { ComponentProps, ReactNode } from "react";

import { TreeDropIndicator } from "./dnd/TreeDropIndicator";
import { useTreeNodeDnd } from "./dnd/useTreeNodeDnd";
import { TreeView } from "./TreeView";

export interface TreeNodeRenderDetails<T extends TreeNode> {
  node: T;
  indexPath: number[];
  isBranch: boolean;
}

type TreeRowPartProps = ComponentProps<typeof TreeView.Item> & { isBranch: boolean };

export function TreeRowPart({ isBranch, ...props }: TreeRowPartProps) {
  const Part = isBranch ? TreeView.BranchControl : TreeView.Item;
  return <Part {...props} />;
}

export function TreeDndRow({ children, ...props }: TreeRowPartProps) {
  const { ref, isDragging, instruction, dragPreview } = useTreeNodeDnd();

  return (
    <TreeRowPart
      ref={ref}
      data-dragging={isDragging || undefined}
      {...props}
    >
      {children}
      <TreeDropIndicator instruction={instruction} />
      {dragPreview}
    </TreeRowPart>
  );
}

export function TreeNodeLabel({ isBranch, children }: { isBranch: boolean; children: ReactNode }) {
  return isBranch ? (
    <TreeView.BranchText>{children}</TreeView.BranchText>
  ) : (
    <TreeView.ItemText>{children}</TreeView.ItemText>
  );
}
