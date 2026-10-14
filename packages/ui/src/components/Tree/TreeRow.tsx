import type { TreeNode } from "@ark-ui/react/tree-view";
import type { ComponentProps, ReactNode } from "react";

import { useTreeDndContext } from "./dnd/TreeDndContext";
import { TreeDropIndicator } from "./dnd/TreeDropIndicator";
import { useTreeNodeDnd } from "./dnd/useTreeNodeDnd";
import { TreeView } from "./TreeView";

export interface TreeNodeRenderDetails<T extends TreeNode> {
  node: T;
  indexPath: number[];
  isBranch: boolean;
}

type TreeRowPartProps = ComponentProps<typeof TreeView.Item> & {
  isBranch: boolean;
  loading?: boolean;
};

export function TreeRowPart({ isBranch, loading, ...props }: TreeRowPartProps) {
  const partProps = {
    "data-loading": loading || undefined,
    "aria-busy": loading || undefined,
    ...props,
  };
  // A union of the two styled parts is too complex for TS (TS2590); keep the elements separate.
  return isBranch ? <TreeView.BranchControl {...partProps} /> : <TreeView.Item {...partProps} />;
}

export function TreeDndRow(props: TreeRowPartProps) {
  return useTreeDndContext() ? <DraggableTreeRow {...props} /> : <TreeRowPart {...props} />;
}

function DraggableTreeRow({ children, ...props }: TreeRowPartProps) {
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
