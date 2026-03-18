export type TreeSize = "sm" | "md";

export const DEFAULT_TREE_SIZE: TreeSize = "md";

export const TREE_ROW_HEIGHT_ESTIMATE: Record<TreeSize, number> = {
  sm: 28,
  md: 32,
};