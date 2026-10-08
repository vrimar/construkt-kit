import type { CSSProperties } from "react";

import { TreeView } from "../TreeView";
import { instructionLevel, type TreeDropInstruction } from "./treeDropLogic";

/**
 * Renders the drop line / make-child outline for the active hitbox instruction.
 * Positioned inside a (relative) row; indentation reuses the recipe's `--tree-indent`
 * geometry so it stays aligned across size variants.
 */
export function TreeDropIndicator({ instruction }: { instruction: TreeDropInstruction | null }) {
  if (!instruction) return null;

  const style: CSSProperties & { "--drop-level"?: number } = {
    "--drop-level": instructionLevel(instruction),
  };

  return (
    <TreeView.DropIndicator
      aria-hidden="true"
      data-instruction={instruction.type}
      style={style}
    />
  );
}
