import type { RowId } from "../rows/rowNode";

export type SelectMode = "replace" | "toggle" | "range";

export interface SelectOptions {
  anchor: RowId | undefined;
  order: readonly RowId[];
  single: boolean;
}

export function selectIds(
  current: readonly RowId[],
  id: RowId,
  mode: SelectMode,
  { anchor, order, single }: SelectOptions,
): RowId[] {
  if (single || mode === "replace") return current.length === 1 && current[0] === id ? [] : [id];
  if (mode === "toggle") {
    return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  }
  const from = anchor === undefined ? -1 : order.indexOf(anchor);
  const to = order.indexOf(id);
  if (from < 0 || to < 0) return [id];
  return order.slice(Math.min(from, to), Math.max(from, to) + 1);
}

export interface RowTree {
  childIdsOf(id: RowId): readonly RowId[];
  parentIdOf(id: RowId): RowId | undefined;
}

export function cascadeRows(
  previous: ReadonlySet<RowId>,
  requested: readonly RowId[],
  tree: RowTree,
  selectable: (id: RowId) => boolean,
): RowId[] {
  const next = new Set(requested);
  const added = new Set(requested.filter((id) => !previous.has(id)));
  const changed = [...added, ...[...previous].filter((id) => !next.has(id))];
  const descend = (id: RowId, on: boolean) => {
    for (const child of tree.childIdsOf(id)) {
      if (on && selectable(child)) next.add(child);
      else if (!on) next.delete(child);
      descend(child, on);
    }
  };
  for (const id of changed) descend(id, next.has(id));

  const ancestors = new Map<RowId, number>();
  for (const id of changed) {
    let depth = 0;
    for (let parent = tree.parentIdOf(id); parent !== undefined; parent = tree.parentIdOf(parent)) {
      depth++;
      ancestors.set(parent, Math.max(depth, ancestors.get(parent) ?? 0));
    }
  }
  const nearestFirst = [...ancestors].sort((a, b) => a[1] - b[1]).map(([id]) => id);
  for (const parent of nearestFirst) {
    const children = tree.childIdsOf(parent).filter(selectable);
    if (children.length > 0 && children.every((child) => next.has(child)) && selectable(parent)) {
      next.add(parent);
    } else if (!added.has(parent)) {
      next.delete(parent);
    }
  }
  return [...next];
}

export function partialRows(ids: readonly RowId[], tree: RowTree): Set<RowId> {
  const selected = new Set(ids);
  const partial = new Set<RowId>();
  for (const id of ids) {
    for (let parent = tree.parentIdOf(id); parent !== undefined; parent = tree.parentIdOf(parent)) {
      if (selected.has(parent) || partial.has(parent)) break;
      partial.add(parent);
    }
  }
  return partial;
}
