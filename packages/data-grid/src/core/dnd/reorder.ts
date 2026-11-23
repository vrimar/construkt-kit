import type { RowModel } from "../rows/rowModel";
import type { DropPosition } from "./types";

export interface Placement<Id> {
  targetId: Id;
  position: DropPosition;
}

export interface SiblingAxis<Id> {
  prev(id: Id): Id | undefined;
  next(id: Id): Id | undefined;
}

export function dropSlot(
  fraction: number,
  canDropOnto: boolean,
  canDropBetween: boolean,
): DropPosition | null {
  if (!canDropBetween) return canDropOnto ? "onto" : null;
  if (fraction < 1 / 3) return "before";
  if (fraction > 2 / 3) return "after";
  if (canDropOnto) return "onto";
  return fraction < 0.5 ? "before" : "after";
}

export function isContiguous<Id>(axis: SiblingAxis<Id>, ordered: readonly Id[]): boolean {
  return ordered.every((id, index) => index === 0 || axis.next(ordered[index - 1]) === id);
}

export function settleGap<Id>(
  axis: SiblingAxis<Id>,
  dragged: ReadonlySet<Id>,
  contiguous: boolean,
  placement: Placement<Id>,
): Placement<Id> | null {
  if (placement.position === "onto") {
    return dragged.has(placement.targetId) ? null : placement;
  }
  const before = placement.position === "before";
  const previous = before ? axis.prev(placement.targetId) : placement.targetId;
  const following = before ? placement.targetId : axis.next(placement.targetId);
  if (contiguous) {
    const touches =
      (previous !== undefined && dragged.has(previous)) ||
      (following !== undefined && dragged.has(following));
    if (touches) return null;
  }
  if (!dragged.has(placement.targetId)) return placement;
  for (let id = following; id !== undefined; id = axis.next(id)) {
    if (!dragged.has(id)) return { targetId: id, position: "before" };
  }
  for (let id = previous; id !== undefined; id = axis.prev(id)) {
    if (!dragged.has(id)) return { targetId: id, position: "after" };
  }
  return null;
}

export const neighbour = <Id>(axis: SiblingAxis<Id>, id: Id, step: -1 | 1): Id | undefined =>
  step < 0 ? axis.prev(id) : axis.next(id);

export function rowAxis<TRow>(model: RowModel<TRow>): SiblingAxis<number> {
  return {
    prev: (index) => {
      const candidate = index - 1;
      if (candidate < 0 || candidate === model.parentOf(index)) return undefined;
      return model.ancestorAt(candidate, model.depthOf(index));
    },
    next: (index) => {
      const end = model.subtreeEnd(index);
      return end < model.rowCount && model.parentOf(end) === model.parentOf(index)
        ? end
        : undefined;
    },
  };
}

export function lastChild<TRow>(model: RowModel<TRow>, parent: number): number {
  const end = parent < 0 ? model.rowCount : model.subtreeEnd(parent);
  return model.ancestorAt(end - 1, parent < 0 ? 0 : model.depthOf(parent) + 1);
}

export function listAxis<Id>(ids: readonly Id[]): SiblingAxis<Id> {
  const position = new Map(ids.map((id, index) => [id, index]));
  const at = (id: Id, step: number) => {
    const index = position.get(id);
    return index === undefined ? undefined : ids[index + step];
  };
  return { prev: (id) => at(id, -1), next: (id) => at(id, 1) };
}
