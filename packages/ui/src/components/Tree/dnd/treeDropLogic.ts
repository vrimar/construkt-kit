import type { ItemMode } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";

import { TreeCollection, type TreeNodes, isDescendantPath } from "../treeCollection";

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
 * Apply a drop instruction to the tree, returning NEW nodes with the dragged node(s) moved, or
 * `null` when the drop is invalid or a no-op. Values missing from the tree are skipped, a node
 * moves along with a dragged ancestor, and moved nodes keep their document order.
 */
export function applyTreeDrop<T>(tree: TreeNodes<T>, args: TreeDropArgs): T[] | null {
  const next = dropInto(TreeCollection.from(tree), args);
  return next ? (next.nodes as T[]) : null;
}

export function dropInto<T>(
  collection: TreeCollection<T>,
  { sourceValues, targetValue, instruction, isBranchLoaded }: TreeDropArgs,
): TreeCollection<T> | null {
  const targetPath = collection.getIndexPath(targetValue);
  if (!targetPath?.length || !isDropTargetValid(collection, sourceValues, targetValue)) {
    return null;
  }

  const sourcePaths = [...new Set(sourceValues)].flatMap((sourceValue) => {
    const sourcePath = collection.getIndexPath(sourceValue);
    return sourcePath?.length ? [sourcePath] : [];
  });
  const movedPaths = sourcePaths
    .filter((path) => !sourcePaths.some((other) => isDescendantPath(other, path)))
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
  const sourceParentValues = movedPaths.flatMap((path) =>
    collection.getValuePath(path.slice(0, -1)).slice(-1),
  );
  const remaining = collection.remove(movedPaths);
  const anchorPath = remaining.getIndexPath(anchor.value);
  if (!anchorPath?.length) return null;

  const inserted =
    anchor.position === "after"
      ? remaining.insertAfter(anchorPath, movedNodes)
      : remaining.insertBefore(
          anchor.position === "inside" ? [...anchorPath, 0] : anchorPath,
          movedNodes,
        );
  const next = inserted && keepBranches(inserted, sourceParentValues);
  return next && !next.isEqual(collection) ? next : null;
}

// Removing a branch's last child leaves `children: []`, which reads as a leaf.
function keepBranches<T>(collection: TreeCollection<T>, values: string[]): TreeCollection<T> {
  return values.reduce((current, value) => {
    const indexPath = current.getIndexPath(value);
    const node = indexPath ? current.at(indexPath) : undefined;
    if (!indexPath || node === undefined || current.isBranchNode(node)) return current;
    return current.replace(indexPath, { ...node, childrenCount: 0 });
  }, collection);
}

export function canNestInto<T>(
  collection: TreeCollection<T>,
  node: T | undefined,
  loaded: boolean,
): boolean {
  if (node === undefined || !collection.isBranchNode(node)) return false;
  return (
    loaded || collection.getNodeChildren(node).length > 0 || !collection.getNodeChildrenCount(node)
  );
}

function compareIndexPaths(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

export function isDropTargetValid<T>(
  collection: TreeCollection<T>,
  sourceValues: readonly string[],
  targetValue: string,
): boolean {
  const targetPath = collection.getIndexPath(targetValue);
  if (!targetPath?.length) return false;
  return sourceValues.every((sourceValue) => {
    if (sourceValue === targetValue) return false;
    const sourcePath = collection.getIndexPath(sourceValue);
    return !sourcePath?.length || !isDescendantPath(sourcePath, targetPath);
  });
}

interface DropAnchor {
  value: string;
  position: "before" | "after" | "inside";
}

function getDropAnchor<T>(
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
export function isLastChildOfParent<T>(
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

export interface TreeKeyboardMoveResult<T> extends KeyboardDropTarget {
  /** The nodes after the move. */
  nodes: T[];
}

export function getKeyboardDropTarget<T>(
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
 * Returns the new nodes plus the equivalent drop target/instruction, or `null` when the move
 * isn't possible.
 */
export function moveNodeByKeyboard<T>(
  tree: TreeNodes<T>,
  value: string,
  move: TreeKeyboardMove,
): TreeKeyboardMoveResult<T> | null {
  const collection = TreeCollection.from(tree);
  const target = getKeyboardDropTarget(collection, value, move);
  if (!target) return null;
  const next = dropInto(collection, { sourceValues: [value], ...target });
  return next ? { nodes: next.nodes as T[], ...target } : null;
}
