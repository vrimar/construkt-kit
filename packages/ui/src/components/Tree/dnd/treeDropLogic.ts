import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";
import type { Instruction, ItemMode } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";

export type { Instruction as TreeDropInstruction, ItemMode };

export interface TreeDropArgs {
  /** One or more dragged nodes (multi-drag moves them together). */
  sourceValues: string[];
  targetValue: string;
  instruction: Instruction;
}

/**
 * Apply a hitbox instruction to the collection, returning a NEW collection with the
 * dragged node(s) moved, or `null` when the drop is invalid or a no-op.
 *
 * `TreeCollection.move` keys its remove/insert operations to the original index paths,
 * so it handles sibling index-shift internally — we only compute the destination path.
 */
export function applyTreeDrop<T extends TreeNode>(
  collection: TreeCollection<T>,
  { sourceValues, targetValue, instruction }: TreeDropArgs,
): TreeCollection<T> | null {
  if (instruction.type === "instruction-blocked") return null;

  const targetPath = collection.getIndexPath(targetValue);
  if (!targetPath?.length) return null;

  const sourcePaths: number[][] = [];
  for (const sourceValue of sourceValues) {
    if (sourceValue === targetValue) return null; // can't drop onto a dragged node
    const sourcePath = collection.getIndexPath(sourceValue);
    if (!sourcePath?.length) return null;
    // Never drop a node into its own subtree. `contains` only checks a prefix match, so
    // guard the length too — otherwise an ancestor target (shorter path) is wrongly blocked.
    if (isWithinSubtree(sourcePath, targetPath)) return null;
    sourcePaths.push(sourcePath);
  }
  if (!sourcePaths.length) return null;

  // make-child only nests into an actual branch; never turn a leaf into a parent.
  if (instruction.type === "make-child") {
    const targetNode = collection.at(targetPath);
    if (!targetNode || !collection.isBranchNode(targetNode)) return null;
  }

  const to = getDestinationIndexPath(targetPath, instruction);
  if (!to?.length) return null;

  const next = collection.move(sourcePaths, to);
  return next.isEqual(collection) ? null : next;
}

/** Whether `targetPath` lies strictly inside `sourcePath`'s subtree (a descendant). */
function isWithinSubtree(sourcePath: number[], targetPath: number[]): boolean {
  return targetPath.length > sourcePath.length && sourcePath.every((v, i) => targetPath[i] === v);
}

/**
 * Whether `nodeValue` is a descendant of `ancestorValue` — a drop that must be rejected.
 * Used by drop targets so descendant rows never present a drop affordance.
 */
export function isDescendantValue<T extends TreeNode>(
  collection: TreeCollection<T>,
  ancestorValue: string,
  nodeValue: string,
): boolean {
  if (ancestorValue === nodeValue) return false;
  const ancestorPath = collection.getIndexPath(ancestorValue);
  const nodePath = collection.getIndexPath(nodeValue);
  if (!ancestorPath || !nodePath) return false;
  return isWithinSubtree(ancestorPath, nodePath);
}

/** Destination index path (splice position under a parent) for a given instruction. */
function getDestinationIndexPath(targetPath: number[], instruction: Instruction): number[] | null {
  const parent = targetPath.slice(0, -1);
  const index = targetPath[targetPath.length - 1];

  switch (instruction.type) {
    case "reorder-above":
      return targetPath;
    case "reorder-below":
      return [...parent, index + 1];
    case "make-child":
      // insert as the first child of the target branch
      return [...targetPath, 0];
    case "reparent": {
      // desiredLevel is 0-based; drop as the next sibling after the target's ancestor at that level
      const ancestorPath = targetPath.slice(0, instruction.desiredLevel + 1);
      if (!ancestorPath.length) return null;
      return [...ancestorPath.slice(0, -1), ancestorPath[ancestorPath.length - 1] + 1];
    }
    default:
      return null;
  }
}

/**
 * Hitbox item mode for a row. `"expanded"` takes precedence so `make-child` drops land
 * above an open branch's children; `"last-in-group"` enables reparent (outdent).
 */
export function getItemMode({
  isBranch,
  isExpanded,
  isLastChild,
}: {
  isBranch: boolean;
  isExpanded: boolean;
  isLastChild: boolean;
}): ItemMode {
  if (isBranch && isExpanded) return "expanded";
  if (isLastChild) return "last-in-group";
  return "standard";
}

/** Whether the node at `indexPath` is the last child of its parent. */
export function isLastChildOfParent<T extends TreeNode>(
  collection: TreeCollection<T>,
  indexPath: number[],
): boolean {
  const siblings = collection.getSiblingNodes(indexPath);
  return indexPath[indexPath.length - 1] === siblings.length - 1;
}

export type TreeKeyboardMove = "up" | "down" | "indent" | "outdent";

export interface KeyboardMoveResult<T extends TreeNode> {
  next: TreeCollection<T>;
  /** The relative node the move is expressed against (for canDrop / announcements). */
  targetValue: string;
  /** The equivalent drag instruction, so keyboard moves reuse the same validation. */
  instruction: Instruction;
}

/**
 * Keyboard-driven reorder of `value`: `up`/`down` among siblings, `indent` into the previous
 * sibling (must be a branch), `outdent` to become the parent's next sibling. Returns the new
 * collection plus the equivalent drop target/instruction, or `null` when the move isn't possible.
 */
export function moveNodeByKeyboard<T extends TreeNode>(
  collection: TreeCollection<T>,
  value: string,
  move: TreeKeyboardMove,
): KeyboardMoveResult<T> | null {
  const path = collection.getIndexPath(value);
  if (!path?.length) return null;
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  const currentLevel = path.length - 1;
  const siblings = collection.getSiblingNodes(path);

  let to: number[] | null = null;
  let target: T | undefined;
  let instruction: Instruction | undefined;

  switch (move) {
    case "up":
      if (index === 0) return null;
      to = [...parentPath, index - 1];
      target = siblings[index - 1];
      instruction = { type: "reorder-above", currentLevel, indentPerLevel: 0 };
      break;
    case "down":
      if (index >= siblings.length - 1) return null;
      to = [...parentPath, index + 2];
      target = siblings[index + 1];
      instruction = { type: "reorder-below", currentLevel, indentPerLevel: 0 };
      break;
    case "indent": {
      if (index === 0) return null;
      const prev = siblings[index - 1];
      if (!collection.isBranchNode(prev)) return null; // don't turn a leaf into a branch
      to = [...parentPath, index - 1, collection.getNodeChildren(prev).length];
      target = prev;
      instruction = { type: "make-child", currentLevel, indentPerLevel: 0 };
      break;
    }
    case "outdent":
      if (path.length < 2) return null; // already at root
      to = [...parentPath.slice(0, -1), parentPath[parentPath.length - 1] + 1];
      target = collection.at(parentPath);
      instruction = {
        type: "reparent",
        currentLevel,
        desiredLevel: currentLevel - 1,
        indentPerLevel: 0,
      };
      break;
  }
  if (!to || !target || !instruction) return null;

  const next = collection.move([path], to);
  if (next.isEqual(collection)) return null;
  return { next, targetValue: collection.getNodeValue(target), instruction };
}
