import type { TreeCollection } from "@ark-ui/react/tree-view";
import { createTreeCollection } from "@ark-ui/react/tree-view";
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { describe, expect, it } from "vitest";

import {
  applyTreeDrop,
  getItemMode,
  isDescendantValue,
  isLastChildOfParent,
  moveNodeByKeyboard,
} from "./treeDropLogic";

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const makeCollection = () =>
  createTreeCollection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: {
      id: "root",
      name: "",
      children: [
        {
          id: "a",
          name: "a",
          children: [
            { id: "a1", name: "a1" },
            { id: "a2", name: "a2" },
            { id: "a3", name: "a3" },
          ],
        },
        {
          id: "b",
          name: "b",
          children: [
            { id: "b1", name: "b1" },
            { id: "b2", name: "b2" },
          ],
        },
        { id: "c", name: "c" },
      ],
    },
  });

const childIds = (collection: TreeCollection<Node> | null, parentValue: string) => {
  if (!collection) throw new Error("expected a reordered collection");
  const parent = parentValue === "root" ? collection.rootNode : collection.findNode(parentValue);
  return collection.getNodeChildren(parent as Node).map((node) => collection.getNodeValue(node));
};

const indexPathOf = (collection: TreeCollection<Node>, value: string) => {
  const path = collection.getIndexPath(value);
  if (!path) throw new Error(`no index path for ${value}`);
  return path;
};

const instruction = (partial: Partial<Instruction> & { type: Instruction["type"] }): Instruction =>
  ({ currentLevel: 1, indentPerLevel: 20, ...partial }) as Instruction;

describe("applyTreeDrop", () => {
  it("reorders a node below a sibling in the same parent", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a1"],
      targetValue: "a2",
      instruction: instruction({ type: "reorder-below" }),
    });
    expect(next).not.toBeNull();
    expect(childIds(next, "a")).toEqual(["a2", "a1", "a3"]);
  });

  it("reorders a node above a sibling in the same parent", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a3"],
      targetValue: "a1",
      instruction: instruction({ type: "reorder-above" }),
    });
    expect(childIds(next, "a")).toEqual(["a3", "a1", "a2"]);
  });

  it("moves a node into a branch as its first child (make-child)", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["c"],
      targetValue: "b",
      instruction: instruction({ type: "make-child" }),
    });
    expect(childIds(next, "root")).toEqual(["a", "b"]);
    expect(childIds(next, "b")).toEqual(["c", "b1", "b2"]);
  });

  it("reparents a node to a shallower ancestor level", () => {
    // drag a1, hover last-in-group b2, reparent to root (desiredLevel 0)
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a1"],
      targetValue: "b2",
      instruction: instruction({ type: "reparent", desiredLevel: 0 }),
    });
    expect(childIds(next, "root")).toEqual(["a", "b", "a1", "c"]);
    expect(childIds(next, "a")).toEqual(["a2", "a3"]);
  });

  it("moves multiple nodes together (multi-drag)", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a1", "a3"],
      targetValue: "b1",
      instruction: instruction({ type: "reorder-above" }),
    });
    expect(childIds(next, "a")).toEqual(["a2"]);
    expect(childIds(next, "b")).toEqual(["a1", "a3", "b1", "b2"]);
  });

  it("rejects a multi-drag when the target is inside one dragged subtree", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["b", "a"],
      targetValue: "a2", // descendant of dragged `a`
      instruction: instruction({ type: "reorder-below" }),
    });
    expect(next).toBeNull();
  });

  it("allows outdenting a node relative to its own ancestor row (ancestor is not a descendant)", () => {
    // drag a1 (child of a), drop below its parent branch `a` -> a1 becomes a's next sibling
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a1"],
      targetValue: "a",
      instruction: instruction({ type: "reorder-below", currentLevel: 0 }),
    });
    expect(childIds(next, "root")).toEqual(["a", "a1", "b", "c"]);
    expect(childIds(next, "a")).toEqual(["a2", "a3"]);
  });

  it("rejects make-child onto a leaf (never turns a leaf into a branch)", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["c"],
      targetValue: "a1", // a1 is a leaf
      instruction: instruction({ type: "make-child" }),
    });
    expect(next).toBeNull();
  });

  it("still rejects a reorder that would land inside the dragged node's own subtree", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a"],
      targetValue: "a2", // a2 is a descendant of a
      instruction: instruction({ type: "reorder-below" }),
    });
    expect(next).toBeNull();
  });

  it("returns null when dropping a node onto itself", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a1"],
      targetValue: "a1",
      instruction: instruction({ type: "reorder-below" }),
    });
    expect(next).toBeNull();
  });

  it("returns null when dropping a branch into its own subtree", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a"],
      targetValue: "a2",
      instruction: instruction({ type: "make-child" }),
    });
    expect(next).toBeNull();
  });

  it("returns null for a blocked instruction", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a1"],
      targetValue: "b1",
      instruction: {
        type: "instruction-blocked",
        desired: instruction({ type: "reparent", desiredLevel: 0 }),
      } as Instruction,
    });
    expect(next).toBeNull();
  });
});

describe("getItemMode", () => {
  it("prefers expanded for an open branch", () => {
    expect(getItemMode({ isBranch: true, isExpanded: true, isLastChild: true })).toBe("expanded");
  });

  it("is last-in-group for the final non-expanded child", () => {
    expect(getItemMode({ isBranch: false, isExpanded: false, isLastChild: true })).toBe(
      "last-in-group",
    );
  });

  it("is standard otherwise", () => {
    expect(getItemMode({ isBranch: false, isExpanded: false, isLastChild: false })).toBe(
      "standard",
    );
  });
});

describe("isLastChildOfParent", () => {
  it("detects the last sibling", () => {
    const collection = makeCollection();
    expect(isLastChildOfParent(collection, indexPathOf(collection, "a3"))).toBe(true);
    expect(isLastChildOfParent(collection, indexPathOf(collection, "a1"))).toBe(false);
  });
});

describe("isDescendantValue", () => {
  it("is true only for nodes strictly inside the ancestor's subtree", () => {
    const c = makeCollection();
    expect(isDescendantValue(c, "a", "a2")).toBe(true); // child
    expect(isDescendantValue(c, "a2", "a")).toBe(false); // ancestor, not descendant
    expect(isDescendantValue(c, "a", "b")).toBe(false); // unrelated
    expect(isDescendantValue(c, "a", "a")).toBe(false); // self
  });
});

describe("moveNodeByKeyboard", () => {
  it("moves a node up among its siblings", () => {
    const result = moveNodeByKeyboard(makeCollection(), "a2", "up");
    expect(childIds(result?.next ?? null, "a")).toEqual(["a2", "a1", "a3"]);
    expect(result?.targetValue).toBe("a1");
    expect(result?.instruction.type).toBe("reorder-above");
  });

  it("moves a node down among its siblings", () => {
    const result = moveNodeByKeyboard(makeCollection(), "a2", "down");
    expect(childIds(result?.next ?? null, "a")).toEqual(["a1", "a3", "a2"]);
    expect(result?.targetValue).toBe("a3");
  });

  it("does not move the first child up or the last child down", () => {
    expect(moveNodeByKeyboard(makeCollection(), "a1", "up")).toBeNull();
    expect(moveNodeByKeyboard(makeCollection(), "a3", "down")).toBeNull();
  });

  it("indents a node into the previous sibling branch", () => {
    const result = moveNodeByKeyboard(makeCollection(), "b", "indent");
    expect(childIds(result?.next ?? null, "root")).toEqual(["a", "c"]);
    expect(childIds(result?.next ?? null, "a")).toEqual(["a1", "a2", "a3", "b"]);
    expect(result?.instruction.type).toBe("make-child");
  });

  it("does not indent into a leaf previous sibling", () => {
    expect(moveNodeByKeyboard(makeCollection(), "a2", "indent")).toBeNull();
  });

  it("outdents a node to become its parent's next sibling", () => {
    const result = moveNodeByKeyboard(makeCollection(), "a1", "outdent");
    expect(childIds(result?.next ?? null, "root")).toEqual(["a", "a1", "b", "c"]);
    expect(childIds(result?.next ?? null, "a")).toEqual(["a2", "a3"]);
    expect(result?.targetValue).toBe("a");
    expect(result?.instruction.type).toBe("reparent");
  });

  it("does not outdent a root-level node", () => {
    expect(moveNodeByKeyboard(makeCollection(), "a", "outdent")).toBeNull();
  });
});
