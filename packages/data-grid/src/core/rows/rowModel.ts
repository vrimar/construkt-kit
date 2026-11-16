import type { RowId, RowNode } from "./rowNode";
import type { SourceStore } from "./sourceStore";

export type RowKind = "leaf" | "parent" | "fullWidth";

export interface RowModel<TRow> {
  readonly rowCount: number;
  nodeAt(index: number): RowNode<TRow>;
  indexOf(id: RowId): number;
  kindOf(index: number): RowKind;
  depthOf(index: number): number;
  hasChildren(index: number): boolean;
  isExpanded(index: number): boolean;
  parentOf(index: number): number;
  /** Display index just past the row's shown descendants. */
  subtreeEnd(index: number): number;
  positionInSet(index: number): { position: number; size: number };
  childIdsOf(id: RowId): readonly RowId[];
  parentIdOf(id: RowId): RowId | undefined;
}

export interface RebuildResult {
  firstChanged: number;
  moved: boolean;
}

export interface RowShape<TRow> {
  getParentId?: (row: TRow) => RowId | null | undefined;
  isFullWidthRow?: (row: TRow) => boolean;
  expanded: ReadonlySet<RowId>;
}

const HAS_CHILDREN = 1;
const EXPANDED = 2;
const FULL_WIDTH = 4;
const NO_IDS: readonly RowId[] = [];

export class ClientRowModel<TRow> implements RowModel<TRow> {
  private nodes: RowNode<TRow>[] = [];
  private versions = new Uint32Array(0);
  private depths = new Uint16Array(0);
  private parents = new Int32Array(0);
  private ends = new Int32Array(0);
  private flags = new Uint8Array(0);
  private positions = new Int32Array(0);
  private sizes = new Int32Array(0);
  private childIds = new Map<RowId, RowId[]>();
  private parentIds = new Map<RowId, RowId>();

  constructor(private readonly source: SourceStore<TRow>) {}

  get rowCount(): number {
    return this.nodes.length;
  }

  nodeAt(index: number): RowNode<TRow> {
    const node = this.nodes[index];
    if (!node) throw new RangeError(`DataGrid: no row at index ${index}`);
    return node;
  }

  indexOf(id: RowId): number {
    return this.source.getNode(id)?.index ?? -1;
  }

  kindOf(index: number): RowKind {
    if (this.flags[index] & FULL_WIDTH) return "fullWidth";
    return this.flags[index] & HAS_CHILDREN ? "parent" : "leaf";
  }

  depthOf(index: number): number {
    return this.depths[index] ?? 0;
  }

  hasChildren(index: number): boolean {
    return (this.flags[index] & HAS_CHILDREN) !== 0;
  }

  isExpanded(index: number): boolean {
    return (this.flags[index] & EXPANDED) !== 0;
  }

  parentOf(index: number): number {
    return this.parents[index] ?? -1;
  }

  subtreeEnd(index: number): number {
    return this.ends[index] ?? index + 1;
  }

  positionInSet(index: number): { position: number; size: number } {
    return { position: this.positions[index], size: this.sizes[index] };
  }

  childIdsOf(id: RowId): readonly RowId[] {
    return this.childIds.get(id) ?? NO_IDS;
  }

  parentIdOf(id: RowId): RowId | undefined {
    return this.parentIds.get(id);
  }

  rebuild({ getParentId, isFullWidthRow, expanded }: RowShape<TRow>): RebuildResult {
    const all = this.source.nodes;
    const children = new Map<RowId, RowNode<TRow>[]>();
    const roots: RowNode<TRow>[] = [];
    if (getParentId) {
      for (const node of all) {
        const parentId = getParentId(node.data);
        const siblings = parentId == null ? undefined : children.get(parentId);
        if (parentId != null && this.source.getNode(parentId) && parentId !== node.id) {
          if (siblings) siblings.push(node);
          else children.set(parentId, [node]);
        } else {
          roots.push(node);
        }
      }
    } else {
      roots.push(...all);
    }

    const nodes: RowNode<TRow>[] = [];
    const depths: number[] = [];
    const parents: number[] = [];
    const flags: number[] = [];
    const positions: number[] = [];
    const sizes: number[] = [];
    const ends: number[] = [];
    const visit = (siblings: RowNode<TRow>[], depth: number, parent: number) => {
      siblings.forEach((node, position) => {
        const index = nodes.length;
        const kids = children.get(node.id);
        const open = kids !== undefined && expanded.has(node.id);
        nodes.push(node);
        depths.push(depth);
        parents.push(parent);
        positions.push(position + 1);
        sizes.push(siblings.length);
        flags.push(
          (kids ? HAS_CHILDREN : 0) |
            (open ? EXPANDED : 0) |
            (isFullWidthRow?.(node.data) ? FULL_WIDTH : 0),
        );
        ends.push(index + 1);
        if (open) visit(kids, depth + 1, index);
        ends[index] = nodes.length;
      });
    };
    visit(roots, 0, -1);

    for (const node of this.nodes) node.index = -1;
    const common = Math.min(nodes.length, this.nodes.length);
    let firstChanged = -1;
    let moved = nodes.length < this.nodes.length;
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      node.index = index;
      if (index >= common) continue;
      const shifted =
        this.nodes[index] !== node ||
        (this.flags[index] & ~FULL_WIDTH) !== (flags[index] & ~FULL_WIDTH);
      if (shifted) moved = true;
      if (
        firstChanged === -1 &&
        (shifted || this.versions[index] !== node.version || this.flags[index] !== flags[index])
      ) {
        firstChanged = index;
      }
    }
    if (firstChanged === -1 && nodes.length !== this.nodes.length) firstChanged = common;

    this.childIds = new Map();
    this.parentIds = new Map();
    for (const [parentId, kids] of children) {
      this.childIds.set(
        parentId,
        kids.map((kid) => kid.id),
      );
      for (const kid of kids) this.parentIds.set(kid.id, parentId);
    }

    this.nodes = nodes;
    this.versions = Uint32Array.from(nodes, (node) => node.version);
    this.depths = Uint16Array.from(depths);
    this.parents = Int32Array.from(parents);
    this.ends = Int32Array.from(ends);
    this.flags = Uint8Array.from(flags);
    this.positions = Int32Array.from(positions);
    this.sizes = Int32Array.from(sizes);
    return { firstChanged, moved };
  }
}
