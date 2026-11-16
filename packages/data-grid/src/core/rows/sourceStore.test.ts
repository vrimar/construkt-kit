import { expect, test } from "vitest";

import type { RowId } from "./rowNode";
import { SourceStore } from "./sourceStore";

interface Row {
  id: number;
  name: string;
}

test("new rows with one replaced and one inserted object bump only those two nodes", () => {
  const store = new SourceStore<Row>();
  const rows = Array.from({ length: 6 }, (_, id) => ({ id, name: `row ${id}` }));
  store.setRows(rows, (row) => row.id);
  const before = new Map(store.nodes.map((node) => [node.id, node.version]));

  const next = [...rows];
  next[1] = { id: 1, name: "renamed" };
  next.splice(3, 0, { id: 99, name: "inserted" });
  store.setRows(next, (row) => row.id);

  const bumped: RowId[] = store.nodes
    .filter((node) => before.get(node.id) !== node.version)
    .map((node) => node.id);
  expect(bumped).toEqual([1, 99]);
});
