import type { TreeCollection, TreeNode } from "@ark-ui/react/tree-view";
import type { ItemMode } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";

/**
 * Where a drop lands relative to its target row. `currentLevel` is the target row's depth;
 * `reparent` moves the node out to `desiredLevel`, after the target's ancestor at that depth.
 */
export type TreeDropInstruction =
  | { type: "reorder-above" | "reorder-below" | "make-child"; currentLevel: number }
  | { type: "reparent"; desiredLevel: number };

export interface TreeDropArgs {
  /** One or more dragged nodes (multi-drag moves them together). */
  sourceValues: string[];
  targetValue: string;
  instruction: TreeDropInstruction;
}

/**
 * Apply a drop instruction to the collection, returning a NEW collection with the
 * dragged node(s) moved, or `null` when the drop is invalid or a no-op. Values missing from
 * the collection are skipped, and a node moves along with a dragged ancestor.
 *
 * `TreeCollection.move` keys its remove/insert operations to the original index paths,
 * so it handles sibling index-shift internally — we only compute the destination path.
 */
export function applyTreeDrop<T extends TreeNode>(
  collection: TreeCollection<T>,
  { sourceValues, targetValue, instruction }: TreeDropArgs,
): TreeCollection<T> | null {
  const targetPath = collection.getIndexPath(targetValue);
  if (!targetPath?.length) return null;

  const sourcePaths: number[][] = [];
  for (const sourceValue of sourceValues) {
    if (sourceValue === targetValue) return null; // can't drop onto a dragged node
    const sourcePath = collection.getIndexPath(sourceValue);
    if (!sourcePath?.length) continue;
    // Never drop a node into its own subtree. `contains` only checks a prefix match, so
    // guard the length too — otherwise an ancestor target (shorter path) is wrongly blocked.
    if (isWithinSubtree(sourcePath, targetPath)) return null;
    sourcePaths.push(sourcePath);
  }
  const movedPaths = sourcePaths.filter(
    (path) => !sourcePaths.some((other) => isWithinSubtree(other, path)),
  );
  if (!movedPaths.length) return null;

  // make-child only nests into an actual branch; never turn a leaf into a parent.
  if (instruction.type === "make-child") {
    const targetNode = collection.at(targetPath);
    if (!targetNode || !collection.isBranchNode(targetNode)) return null;
  }

  const to = getDestinationIndexPath(targetPath, instruction);
  if (!to?.length) return null;

  const next = collection.move(movedPaths, to);
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
function getDestinationIndexPath(
  targetPath: number[],
  instruction: TreeDropInstruction,
): number[] | null {
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
  }
}

export function instructionLevel(instruction: TreeDropInstruction): number {
  return instruction.type === "reparent" ? instruction.desiredLevel : instruction.currentLevel;
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

export interface KeyboardDropTarget {
  /** The relative node the move is expressed against (for canDrop / announcements). */
  targetValue: string;
  /** The equivalent drag instruction, so keyboard moves reuse the same validation. */
  instruction: TreeDropInstruction;
}

export interface KeyboardMoveResult<T extends TreeNode> extends KeyboardDropTarget {
  next: TreeCollection<T>;
}

export function getKeyboardDropTarget<T extends TreeNode>(
  collection: TreeCollection<T>,
  value: string,
  move: TreeKeyboardMove,
): KeyboardDropTarget | null {
  const path = collection.getIndexPath(value);
  if (!path?.length) return null;
  const index = path[path.length - 1];
  const currentLevel = path.length - 1;
  const siblings = collection.getSiblingNodes(path);

  const against = (target: T | undefined, instruction: TreeDropInstruction) =>
    target === undefined ? null : { targetValue: collection.getNodeValue(target), instruction };

  switch (move) {
    case "up":
      return against(siblings[index - 1], { type: "reorder-above", currentLevel });
    case "down":
      return against(siblings[index + 1], { type: "reorder-below", currentLevel });
    case "indent":
      return against(siblings[index - 1], { type: "make-child", currentLevel });
    case "outdent":
      if (currentLevel === 0) return null;
      return against(collection.at(path.slice(0, -1)), {
        type: "reparent",
        desiredLevel: currentLevel - 1,
      });
  }
}

/**
 * Keyboard-driven reorder of `value`: `up`/`down` among siblings, `indent` to the first child
 * of the previous sibling (must be a branch), `outdent` to become the parent's next sibling.
 * Returns the new collection plus the equivalent drop target/instruction, or `null` when the
 * move isn't possible.
 */
export function moveNodeByKeyboard<T extends TreeNode>(
  collection: TreeCollection<T>,
  value: string,
  move: TreeKeyboardMove,
): KeyboardMoveResult<T> | null {
  const target = getKeyboardDropTarget(collection, value, move);
  if (!target) return null;
  const next = applyTreeDrop(collection, { sourceValues: [value], ...target });
  return next ? { next, ...target } : null;
}
