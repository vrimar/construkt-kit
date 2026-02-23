export function transformArray<T>(arraySrc: T[], getKey: (item: T) => string | number) {
  return arraySrc.reduce(
    (prev, cur) => {
      const key = getKey(cur);
      prev[key] = cur;
      return prev;
    },
    {} as Record<string, T>,
  );
}

export function addOrRemove<T>(arr: T[], value: T) {
  if (arr.find((v) => v === value)) return arr.filter((v) => v !== value);
  else return [...arr, value];
}

export function addOrRemoveByKey<T, K>(arr: T[], value: T, key: (item: T) => K) {
  const k = key(value);
  const exists = arr.some((v) => key(v) === k);

  return exists ? arr.filter((v) => key(v) !== k) : [...arr, value];
}

export function getFirstItemId<T extends { id: number }>(arr?: T[]) {
  if (!arr || arr.length === 0) return 0;
  return arr[0].id;
}

export function getLastItemId<T extends { id: number }>(arr?: T[]) {
  if (!arr) return 0;
  if (arr.length === 0) return 0;
  return arr[arr.length - 1].id;
}

export function findInTree<T>(
  tree: T[],
  predicate: (node: T) => boolean,
  getChildren: (node: T) => T[] | undefined,
): T | null {
  for (const node of tree) {
    if (predicate(node)) {
      return node;
    }
    const children = getChildren(node);
    if (children) {
      const found = findInTree(children, predicate, getChildren);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
