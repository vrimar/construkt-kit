export type SortableAxis = "vertical" | "horizontal";

/** A side of the drop target, in `values` order. */
export type SortableEdge = "before" | "after";

/** Where a drop lands: beside its target, or onto it. */
export type SortableInstruction = { type: "reorder"; edge: SortableEdge } | { type: "onto" };

export interface SortableReorderDetails {
  sourceValue: string;
  targetValue: string;
  edge: SortableEdge;
}

export interface SortableDropOntoDetails {
  sourceValue: string;
  targetValue: string;
}

export interface SortableCanDropDetails {
  sourceValue: string;
  targetValue: string;
  instruction: SortableInstruction;
}

interface SortablePointer {
  client: { x: number; y: number };
  rect: { top: number; left: number; width: number; height: number };
  axis: SortableAxis;
  /** A right-to-left horizontal axis puts `before` on the right. */
  rtl?: boolean;
  /** Give the target's middle third to `onto`; otherwise its halves split before and after. */
  allowOnto: boolean;
}

/** The drop a pointer at `client` makes on a target occupying `rect`. */
export function getSortableInstruction({
  client,
  rect,
  axis,
  rtl = false,
  allowOnto,
}: SortablePointer): SortableInstruction {
  const vertical = axis === "vertical";
  const size = vertical ? rect.height : rect.width;
  const offset = vertical
    ? client.y - rect.top
    : rtl
      ? rect.left + rect.width - client.x
      : client.x - rect.left;
  const fraction = size > 0 ? offset / size : 0;
  if (allowOnto && fraction > 1 / 3 && fraction < 2 / 3) return { type: "onto" };
  return { type: "reorder", edge: fraction < 0.5 ? "before" : "after" };
}

/** Whether the reorder leaves `values` in the order it found them. */
export function isNoopReorder(
  values: readonly string[],
  { sourceValue, targetValue, edge }: SortableReorderDetails,
): boolean {
  const source = values.indexOf(sourceValue);
  const target = values.indexOf(targetValue);
  if (source < 0 || target < 0) return false;
  return target === source || target === source + (edge === "before" ? 1 : -1);
}

/**
 * A copy of `items` with the source moved to `edge` of the target. Returns the items unmoved when
 * either value is missing.
 */
export function applySortableReorder(
  values: readonly string[],
  details: SortableReorderDetails,
): string[];
export function applySortableReorder<T>(
  items: readonly T[],
  details: SortableReorderDetails,
  getValue: (item: T) => string,
): T[];
export function applySortableReorder<T>(
  items: readonly T[],
  { sourceValue, targetValue, edge }: SortableReorderDetails,
  getValue: (item: T) => string = (item) => item as string,
): T[] {
  const source = items.findIndex((item) => getValue(item) === sourceValue);
  const rest = items.filter((_, index) => index !== source);
  const target = rest.findIndex((item) => getValue(item) === targetValue);
  if (source < 0 || target < 0) return [...items];
  rest.splice(edge === "before" ? target : target + 1, 0, items[source]);
  return rest;
}
