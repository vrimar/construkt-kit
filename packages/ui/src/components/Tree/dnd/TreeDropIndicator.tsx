import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import type { ComponentProps, CSSProperties } from "react";

import { TreeView } from "../TreeView";
import { instructionLevel } from "./treeDropLogic";

type DropIndicatorColorPalette = ComponentProps<typeof TreeView.DropIndicator>["colorPalette"];

/**
 * Renders the drop line / make-child outline for the active hitbox instruction.
 * Positioned inside a (relative) row; indentation reuses the recipe's `--tree-indent`
 * geometry so it stays aligned across size variants.
 */
export function TreeDropIndicator({
  instruction,
  colorPalette,
}: {
  instruction: Instruction | null;
  /** Override the indicator accent (defaults to the recipe's blue). */
  colorPalette?: DropIndicatorColorPalette;
}) {
  if (!instruction || instruction.type === "instruction-blocked") return null;

  const style: CSSProperties & { "--drop-level"?: number } = {
    "--drop-level": instructionLevel(instruction),
  };

  return (
    <TreeView.DropIndicator
      aria-hidden="true"
      data-instruction={instruction.type}
      colorPalette={colorPalette}
      style={style}
    />
  );
}
