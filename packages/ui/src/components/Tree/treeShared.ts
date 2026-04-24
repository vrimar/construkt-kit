export type TreeSize = "sm" | "md";

export const DEFAULT_TREE_SIZE: TreeSize = "md";

/**
 * Estimated row heights per size variant for virtual scroll.
 * Must stay in sync with the `treeView` recipe in `@b3/preset/src/theme/recipes/tree-view.ts`
 * (padding-y + text line-height for each size).
 */
export const TREE_ROW_HEIGHT_ESTIMATE: Record<TreeSize, number> = {
  sm: 28,
  md: 32,
};
