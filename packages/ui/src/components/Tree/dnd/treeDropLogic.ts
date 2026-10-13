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
  /**
   * Whether a branch with a non-zero `childrenCount` but no `children` has already loaded them, so
   * `make-child` may nest into it. Nesting into an unloaded branch would stop its real children
   * from ever loading. Defaults to `false`.
   */
  isBranchLoaded?: (value: string) => boolean;
}

/**
 * Apply a drop instruction to the collection, returning a NEW collection with the
 * dragged node(s) moved, or `null` when the drop is invalid or a no-op. Values missing from
 * the collection are skipped, a node moves along with a dragged ancestor, and moved nodes keep
 * their document order.
 */
export function applyTreeDrop<T extends TreeNode>(
  collection: TreeCollection<T>,
  { sourceValues, targetValue, instruction, isBranchLoaded }: TreeDropArgs,
): TreeCollection<T> | null {
  const targetPath = collection.getIndexPath(targetValue);
  if (!targetPath?.length) return null;

  const sourcePaths: number[][] = [];
  for (const sourceValue of new Set(sourceValues)) {
    if (sourceValue === targetValue) return null; // can't drop onto a dragged node
    const sourcePath = collection.getIndexPath(sourceValue);
    if (!sourcePath?.length) continue;
    // Never drop a node into its own subtree. `contains` only checks a prefix match, so
    // guard the length too — otherwise an ancestor target (shorter path) is wrongly blocked.
    if (isWithinSubtree(sourcePath, targetPath)) return null;
    sourcePaths.push(sourcePath);
  }
  const movedPaths = sourcePaths
    .filter((path) => !sourcePaths.some((other) => isWithinSubtree(other, path)))
    .sort(compareIndexPaths);
  if (!movedPaths.length) return null;

  if (
    instruction.type === "make-child" &&
    !canNestInto(collection, collection.at(targetPath), isBranchLoaded?.(targetValue) ?? false)
  ) {
    return null;
  }

  const anchor = getDropAnchor(collection, targetPath, targetValue, instruction);
  if (!anchor) return null;

  const movedNodes = movedPaths.flatMap((path) => collection.at(path) ?? []);
  const remaining = collection.remove(movedPaths);
  const anchorPath = remaining.getIndexPath(anchor.value);
  if (!anchorPath?.length) return null;

  const next =
    anchor.position === "after"
      ? remaining.insertAfter(anchorPath, movedNodes)
      : remaining.insertBefore(
          anchor.position === "inside" ? [...anchorPath, 0] : anchorPath,
          movedNodes,
        );
  return next && !next.isEqual(collection) ? next : null;
}

export function canNestInto<T extends TreeNode>(
  collection: TreeCollection<T>,
  node: T | undefined,
  loaded: boolean,
): boolean {
  if (node === undefined || !collection.isBranchNode(node)) return false;
  return (
    loaded || collection.getNodeChildren(node).length > 0 || !collection.getNodeChildrenCount(node)
  );
}

/** Whether `targetPath` lies strictly inside `sourcePath`'s subtree (a descendant). */
function isWithinSubtree(sourcePath: number[], targetPath: number[]): boolean {
  return targetPath.length > sourcePath.length && sourcePath.every((v, i) => targetPath[i] === v);
}

function compareIndexPaths(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
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

interface DropAnchor {
  value: string;
  position: "before" | "after" | "inside";
}

function getDropAnchor<T extends TreeNode>(
  collection: TreeCollection<T>,
  targetPath: number[],
  targetValue: string,
  instruction: TreeDropInstruction,
): DropAnchor | null {
  switch (instruction.type) {
    case "reorder-above":
      return { value: targetValue, position: "before" };
    case "reorder-below":
      return { value: targetValue, position: "after" };
    case "make-child":
      return { value: targetValue, position: "inside" };
    case "reparent": {
      // desiredLevel is 0-based; drop as the next sibling after the target's ancestor at that level
      const ancestor = collection.at(targetPath.slice(0, instruction.desiredLevel + 1));
      return ancestor === undefined
        ? null
        : { value: collection.getNodeValue(ancestor), position: "after" };
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
