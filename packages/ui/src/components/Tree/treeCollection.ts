/**
 * How a tree reads its nodes. The tree re-reads every node when one changes identity, so define
 * them outside render or memoize them.
 */
export interface TreeNodeAccessors<T> {
  /** A node's value: unique in the tree, and what expanded, selected and checked values hold. */
  getNodeValue: (node: T) => string;
  /** A node's text, which typeahead and the default row content read. */
  getNodeLabel: (node: T) => string;
  /**
   * A node's children. Defaults to its `children`. Drag and drop and lazy loading hand back nodes
   * with their new children in `children`, so a tree they change keeps its children there.
   */
  getChildren?: ((node: T) => readonly T[] | undefined) | undefined;
  /**
   * How many children a node has before they load. A node with a count is a branch even without
   * children. Defaults to its `childrenCount`.
   */
  getChildrenCount?: ((node: T) => number | undefined) | undefined;
  /** Defaults to the node's `disabled`. */
  isNodeDisabled?: ((node: T) => boolean) | undefined;
}

/** A row's check state: a branch is mixed while only some of its leaves are checked. */
export type TreeCheckedState = boolean | "indeterminate";

/** A tree's top-level nodes and how to read them. */
export interface TreeNodes<T> extends TreeNodeAccessors<T> {
  nodes: readonly T[];
}

interface DefaultFields<T> {
  children?: readonly T[] | undefined;
  childrenCount?: number | undefined;
  disabled?: boolean | undefined;
}

type VisitResult = "skip" | "stop" | undefined | void;

export interface TreeVisitOptions<T> {
  /** Leaves a node and its descendants out of the walk. */
  skip?: ((node: T, indexPath: number[]) => boolean) | undefined;
  onEnter: (node: T, indexPath: number[]) => VisitResult;
}

const NO_NODES: readonly never[] = [];

/**
 * A tree's nodes read through its accessors, with the walks and immutable edits the tree runs on.
 * Index paths start at the top-level nodes; the empty path is the tree itself.
 */
export class TreeCollection<T> {
  constructor(
    readonly nodes: readonly T[],
    readonly accessors: TreeNodeAccessors<T>,
  ) {}

  static from<T>({ nodes, ...accessors }: TreeNodes<T>): TreeCollection<T> {
    return new TreeCollection(nodes, accessors);
  }

  getNodeValue = (node: T): string => this.accessors.getNodeValue(node);

  stringifyNode = (node: T): string => this.accessors.getNodeLabel(node);

  getNodeChildren = (node: T): readonly T[] => {
    const { getChildren } = this.accessors;
    return (getChildren ? getChildren(node) : (node as DefaultFields<T>).children) ?? NO_NODES;
  };

  getNodeChildrenCount = (node: T): number | undefined => {
    const { getChildrenCount } = this.accessors;
    return getChildrenCount ? getChildrenCount(node) : (node as DefaultFields<T>).childrenCount;
  };

  getNodeDisabled = (node: T): boolean => {
    const { isNodeDisabled } = this.accessors;
    return isNodeDisabled ? isNodeDisabled(node) : Boolean((node as DefaultFields<T>).disabled);
  };

  isBranchNode = (node: T): boolean =>
    this.getNodeChildren(node).length > 0 || this.getNodeChildrenCount(node) != null;

  /** The children under `indexPath`, the top-level nodes for the empty path. */
  childrenAt(indexPath: readonly number[]): readonly T[] {
    if (indexPath.length === 0) return this.nodes;
    const node = this.at(indexPath);
    return node === undefined ? NO_NODES : this.getNodeChildren(node);
  }

  /** Walks the nodes depth first, entering each before its children. */
  visit({ skip, onEnter }: TreeVisitOptions<T>): void {
    const walk = (children: readonly T[], parentPath: number[]): boolean => {
      for (let index = 0; index < children.length; index += 1) {
        const node = children[index];
        const indexPath = [...parentPath, index];
        if (skip?.(node, indexPath)) continue;
        const result = onEnter(node, indexPath);
        if (result === "stop") return false;
        if (result !== "skip" && !walk(this.getNodeChildren(node), indexPath)) return false;
      }
      return true;
    };
    walk(this.nodes, []);
  }

  at(indexPath: readonly number[]): T | undefined {
    let children = this.nodes;
    let node: T | undefined;
    for (const index of indexPath) {
      node = children[index];
      if (node === undefined) return undefined;
      children = this.getNodeChildren(node);
    }
    return node;
  }

  getIndexPath(value: string): number[] | undefined;
  getIndexPath(valuePath: readonly string[]): number[];
  getIndexPath(valueOrPath: string | readonly string[]): number[] | undefined {
    if (typeof valueOrPath !== "string") {
      const indexPath: number[] = [];
      let children = this.nodes;
      for (const value of valueOrPath) {
        const index = children.findIndex((child) => this.getNodeValue(child) === value);
        if (index === -1) break;
        indexPath.push(index);
        children = this.getNodeChildren(children[index]);
      }
      return indexPath;
    }
    let found: number[] | undefined;
    this.visit({
      onEnter: (node, indexPath) => {
        if (this.getNodeValue(node) !== valueOrPath) return undefined;
        found = indexPath;
        return "stop";
      },
    });
    return found;
  }

  findNode(value: string): T | undefined {
    const indexPath = this.getIndexPath(value);
    return indexPath ? this.at(indexPath) : undefined;
  }

  /** The values from the top of the tree down to the node at `indexPath`. */
  getValuePath(indexPath: readonly number[]): string[] {
    const values: string[] = [];
    let children = this.nodes;
    for (const index of indexPath) {
      const node = children[index];
      if (node === undefined) break;
      values.push(this.getNodeValue(node));
      children = this.getNodeChildren(node);
    }
    return values;
  }

  stringify(value: string): string | null {
    const node = this.findNode(value);
    return node === undefined ? null : this.stringifyNode(node);
  }

  /** The siblings of the node at `indexPath`, itself included. */
  getSiblingNodes(indexPath: readonly number[]): readonly T[] {
    return this.childrenAt(indexPath.slice(0, -1));
  }

  /** The leaves under a node, or under the whole tree for the empty path. */
  getDescendantLeaves(valueOrIndexPath: string | readonly number[]): T[] {
    const indexPath =
      typeof valueOrIndexPath === "string" ? this.getIndexPath(valueOrIndexPath) : valueOrIndexPath;
    if (!indexPath) return [];
    const leaves: T[] = [];
    const collect = (children: readonly T[]) => {
      for (const child of children) {
        if (this.isBranchNode(child)) collect(this.getNodeChildren(child));
        else leaves.push(child);
      }
    };
    collect(this.childrenAt(indexPath));
    return leaves;
  }

  /** The leaf values under a node, or under the whole tree for the empty path. */
  getDescendantValues(valueOrIndexPath: string | readonly number[]): string[] {
    return this.getDescendantLeaves(valueOrIndexPath).map((leaf) => this.getNodeValue(leaf));
  }

  /** The values of every branch. */
  getBranchValues(): string[] {
    const values: string[] = [];
    this.visit({
      onEnter: (node) => {
        if (this.isBranchNode(node)) values.push(this.getNodeValue(node));
      },
    });
    return values;
  }

  /** Whether `other` holds the same values in the same places. */
  isEqual(other: TreeCollection<T>): boolean {
    const same = (a: readonly T[], b: readonly T[]): boolean =>
      a.length === b.length &&
      a.every(
        (node, index) =>
          this.getNodeValue(node) === other.getNodeValue(b[index]) &&
          same(this.getNodeChildren(node), other.getNodeChildren(b[index])),
      );
    return same(this.nodes, other.nodes);
  }

  copy(nodes: readonly T[]): TreeCollection<T> {
    return new TreeCollection(nodes, this.accessors);
  }

  private create(node: T, children: readonly T[]): T {
    const current = this.getNodeChildren(node);
    if (current.length === children.length && current.every((child, i) => child === children[i])) {
      return node;
    }
    return { ...node, children };
  }

  /** Rebuilds the path to `parentPath`, giving the children there to `edit`. */
  private editChildren(
    parentPath: readonly number[],
    edit: (children: readonly T[]) => readonly T[],
  ): TreeCollection<T> {
    const rebuild = (children: readonly T[], depth: number): readonly T[] => {
      if (depth === parentPath.length) return edit(children);
      const index = parentPath[depth];
      const node = children[index];
      if (node === undefined) return children;
      const next = [...children];
      next[index] = this.create(node, rebuild(this.getNodeChildren(node), depth + 1));
      return next;
    };
    return this.copy(rebuild(this.nodes, 0));
  }

  replace(indexPath: readonly number[], node: T): TreeCollection<T> {
    if (indexPath.length === 0) return this;
    const index = indexPath[indexPath.length - 1];
    return this.editChildren(indexPath.slice(0, -1), (children) =>
      children.map((child, i) => (i === index ? node : child)),
    );
  }

  remove(indexPaths: readonly (readonly number[])[]): TreeCollection<T> {
    const removed = new Set(indexPaths.map((indexPath) => indexPath.join()));
    const prune = (children: readonly T[], parentPath: number[]): readonly T[] => {
      let changed = false;
      const next: T[] = [];
      children.forEach((child, index) => {
        const indexPath = [...parentPath, index];
        if (removed.has(indexPath.join())) {
          changed = true;
          return;
        }
        const own = this.getNodeChildren(child);
        const pruned = own.length > 0 ? prune(own, indexPath) : own;
        if (pruned === own) {
          next.push(child);
        } else {
          changed = true;
          next.push({ ...child, children: pruned });
        }
      });
      return changed ? next : children;
    };
    return this.copy(prune(this.nodes, []));
  }

  /** Inserts `nodes` at `indexPath`, before the node there; undefined when its parent is missing. */
  insertBefore(indexPath: readonly number[], nodes: readonly T[]): TreeCollection<T> | undefined {
    if (indexPath.length === 0) return undefined;
    const parentPath = indexPath.slice(0, -1);
    if (parentPath.length > 0 && this.at(parentPath) === undefined) return undefined;
    const index = indexPath[indexPath.length - 1];
    return this.editChildren(parentPath, (children) => [
      ...children.slice(0, index),
      ...nodes,
      ...children.slice(index),
    ]);
  }

  /** Inserts `nodes` after the node at `indexPath`; undefined when its parent is missing. */
  insertAfter(indexPath: readonly number[], nodes: readonly T[]): TreeCollection<T> | undefined {
    if (indexPath.length === 0) return undefined;
    return this.insertBefore(
      [...indexPath.slice(0, -1), indexPath[indexPath.length - 1] + 1],
      nodes,
    );
  }

  /** The nodes `predicate` keeps, with their ancestors; read kept children through its `getChildren`. */
  filter(predicate: (node: T) => boolean): TreeCollection<T> {
    const keptChildren = new Map<T, readonly T[]>();
    const keep = (children: readonly T[]): T[] =>
      children.filter((child) => {
        const kept = keep(this.getNodeChildren(child));
        if (kept.length === 0 && !predicate(child)) return false;
        keptChildren.set(child, kept);
        return true;
      });
    return new TreeCollection(keep(this.nodes), {
      ...this.accessors,
      getChildren: (node) => keptChildren.get(node) ?? this.getNodeChildren(node),
    });
  }
}

export function getToggledLeafValues<T>(collection: TreeCollection<T>, value: string): string[] {
  return collection
    .getDescendantLeaves(value)
    .filter((leaf) => !collection.getNodeDisabled(leaf))
    .map((leaf) => collection.getNodeValue(leaf));
}

/** A leaf is checked when `checkedValue` holds it; a branch by its enabled leaves, or all if none are. */
export function getCheckedState<T>(
  collection: TreeCollection<T>,
  node: T,
  checkedValue: readonly string[],
): TreeCheckedState {
  const value = collection.getNodeValue(node);
  if (!collection.isBranchNode(node)) return checkedValue.includes(value);
  const leaves = collection.getDescendantLeaves(value);
  const enabled = leaves.filter((leaf) => !collection.getNodeDisabled(leaf));
  const counted = enabled.length > 0 ? enabled : leaves;
  const checked = counted.filter((leaf) => checkedValue.includes(collection.getNodeValue(leaf)));
  if (checked.length === 0) return false;
  return checked.length === counted.length ? true : "indeterminate";
}
