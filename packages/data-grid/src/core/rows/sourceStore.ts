import type { RowId, RowNode } from "./rowNode";

export class SourceStore<TRow> {
  nodes: RowNode<TRow>[] = [];
  private byId = new Map<RowId, RowNode<TRow>>();
  private rows: readonly TRow[] | undefined;

  getNode(id: RowId): RowNode<TRow> | undefined {
    return this.byId.get(id);
  }

  setRows(rows: readonly TRow[], getRowId: (row: TRow) => RowId): boolean {
    if (rows === this.rows) return false;
    this.rows = rows;
    const next: RowNode<TRow>[] = new Array(rows.length);
    const byId = new Map<RowId, RowNode<TRow>>();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const id = getRowId(row);
      if (byId.has(id)) throw new Error(`DataGrid: duplicate row id ${JSON.stringify(id)}`);
      let node = this.byId.get(id);
      if (!node) {
        node = { id, data: row, index: -1, version: 1 };
      } else if (node.data !== row) {
        node.data = row;
        node.version++;
      }
      byId.set(id, node);
      next[index] = node;
    }

    for (const node of this.nodes) if (!byId.has(node.id)) node.index = -1;
    this.nodes = next;
    this.byId = byId;
    return true;
  }
}
