import type { TreeCollection } from "@ark-ui/react/tree-view";
import { describe, expect, it } from "vitest";

import { createTestTree, type TestNode } from "../tree.fixtures";
import {
  applyTreeDrop,
  getItemMode,
  isDescendantValue,
  isLastChildOfParent,
  moveNodeByKeyboard,
  type TreeDropInstruction,
} from "./treeDropLogic";

const makeCollection = () =>
  createTestTree([
    {
      id: "a",
      label: "a",
      children: [
        { id: "a1", label: "a1" },
        { id: "a2", label: "a2" },
        { id: "a3", label: "a3" },
      ],
    },
    {
      id: "b",
      label: "b",
      children: [
        { id: "b1", label: "b1" },
        { id: "b2", label: "b2" },
      ],
    },
    { id: "c", label: "c" },
  ]);

const childIds = (collection: TreeCollection<TestNode> | null, parentValue: string) => {
  if (!collection) throw new Error("expected a reordered collection");
  const parent = parentValue === "root" ? collection.rootNode : collection.findNode(parentValue);
  return collection
    .getNodeChildren(parent as TestNode)
    .map((node) => collection.getNodeValue(node));
};

const indexPathOf = (collection: TreeCollection<TestNode>, value: string) => {
  const path = collection.getIndexPath(value);
  if (!path) throw new Error(`no index path for ${value}`);
  return path;
};

const instruction = (partial: {
  type: TreeDropInstruction["type"];
  currentLevel?: number;
  desiredLevel?: number;
}): TreeDropInstruction => ({ currentLevel: 1, ...partial }) as TreeDropInstruction;

const allValues = (collection: TreeCollection<TestNode> | null) => {
  if (!collection) throw new Error("expected a reordered collection");
  return collection.getDescendantValues([]);
};

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

  it("moves a dragged descendant once, inside its dragged ancestor", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a", "a1"],
      targetValue: "c",
      instruction: instruction({ type: "reorder-below", currentLevel: 0 }),
    });
    expect(childIds(next, "root")).toEqual(["b", "c", "a"]);
    expect(childIds(next, "a")).toEqual(["a1", "a2", "a3"]);
    expect(allValues(next).filter((value) => value === "a1")).toHaveLength(1);
  });

  it("skips drag values missing from the collection", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a1", "missing"],
      targetValue: "b1",
      instruction: instruction({ type: "reorder-above" }),
    });
    expect(childIds(next, "a")).toEqual(["a2", "a3"]);
    expect(childIds(next, "b")).toEqual(["a1", "b1", "b2"]);
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

  const makeFlatCollection = () =>
    createTestTree(["A", "B", "C", "D", "E"].map((id) => ({ id, label: id })));

  it("multi-drags non-adjacent siblings above a later sibling", () => {
    const next = applyTreeDrop(makeFlatCollection(), {
      sourceValues: ["A", "C"],
      targetValue: "D",
      instruction: instruction({ type: "reorder-above", currentLevel: 0 }),
    });
    expect(childIds(next, "root")).toEqual(["B", "A", "C", "D", "E"]);
  });

  it("multi-drags non-adjacent siblings below a later sibling", () => {
    const next = applyTreeDrop(makeFlatCollection(), {
      sourceValues: ["A", "C"],
      targetValue: "D",
      instruction: instruction({ type: "reorder-below", currentLevel: 0 }),
    });
    expect(childIds(next, "root")).toEqual(["B", "D", "A", "C", "E"]);
  });

  it("returns null for a multi-drag that leaves the order unchanged", () => {
    const next = applyTreeDrop(makeFlatCollection(), {
      sourceValues: ["B", "C"],
      targetValue: "D",
      instruction: instruction({ type: "reorder-above", currentLevel: 0 }),
    });
    expect(next).toBeNull();
  });

  it("moves nodes in document order, whatever order they were dragged in", () => {
    const next = applyTreeDrop(makeFlatCollection(), {
      sourceValues: ["E", "B", "B"],
      targetValue: "A",
      instruction: instruction({ type: "reorder-above", currentLevel: 0 }),
    });
    expect(childIds(next, "root")).toEqual(["B", "E", "A", "C", "D"]);
  });

  it("multi-drags across parents into a sibling list that holds one of them", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["b2", "a1", "a3"],
      targetValue: "b1",
      instruction: instruction({ type: "reorder-below" }),
    });
    expect(childIds(next, "a")).toEqual(["a2"]);
    expect(childIds(next, "b")).toEqual(["b1", "a1", "a3", "b2"]);
  });

  it("reparents a multi-drag after an ancestor whose earlier siblings move too", () => {
    const next = applyTreeDrop(makeCollection(), {
      sourceValues: ["a", "b1"],
      targetValue: "b2",
      instruction: instruction({ type: "reparent", desiredLevel: 0 }),
    });
    expect(childIds(next, "root")).toEqual(["b", "a", "b1", "c"]);
    expect(childIds(next, "b")).toEqual(["b2"]);
  });

  describe("make-child into a lazy branch", () => {
    const makeLazyCollection = () =>
      createTestTree([
        { id: "unloaded", label: "unloaded", childrenCount: 2 },
        { id: "empty", label: "empty", childrenCount: 0 },
        { id: "c", label: "c" },
      ]);
    const nest = (targetValue: string, isBranchLoaded?: (value: string) => boolean) =>
      applyTreeDrop(makeLazyCollection(), {
        sourceValues: ["c"],
        targetValue,
        instruction: instruction({ type: "make-child", currentLevel: 0 }),
        isBranchLoaded,
      });

    it("rejects a branch whose children are not loaded", () => {
      expect(nest("unloaded")).toBeNull();
    });

    it("accepts it once the branch is known to be loaded", () => {
      expect(
        childIds(
          nest("unloaded", (value) => value === "unloaded"),
          "unloaded",
        ),
      ).toEqual(["c"]);
    });

    it("accepts a branch whose childrenCount says it is empty", () => {
      expect(childIds(nest("empty"), "empty")).toEqual(["c"]);
    });
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

  it("indents a node to the first child of the previous sibling branch, as a pointer drop does", () => {
    const result = moveNodeByKeyboard(makeCollection(), "b", "indent");
    expect(childIds(result?.next ?? null, "root")).toEqual(["a", "c"]);
    expect(childIds(result?.next ?? null, "a")).toEqual(["b", "a1", "a2", "a3"]);
    expect(result?.targetValue).toBe("a");
    expect(result?.instruction).toEqual({ type: "make-child", currentLevel: 0 });
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
