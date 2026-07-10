import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import type { ComponentProps, CSSProperties } from "react";

import { TreeView } from "../TreeView";

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

  const style: CSSProperties = {};

  if (instruction.type !== "make-child") {
    const level =
      instruction.type === "reparent" ? instruction.desiredLevel : instruction.currentLevel;
    style.insetInlineStart = `calc(var(--tree-padding-inline) + (${level} * var(--tree-indent)))`;
  }

  if (instruction.type === "reorder-above") {
    style.insetBlockStart = 0;
    style.transform = "translateY(-50%)";
  } else if (instruction.type === "reorder-below" || instruction.type === "reparent") {
    style.insetBlockStart = "auto";
    style.insetBlockEnd = 0;
    style.transform = "translateY(50%)";
  }

  return (
    <TreeView.DropIndicator
      aria-hidden="true"
      data-instruction={instruction.type}
      colorPalette={colorPalette}
      style={style}
    />
  );
}
