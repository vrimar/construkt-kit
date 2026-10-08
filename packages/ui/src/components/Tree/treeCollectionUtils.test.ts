import { describe, expect, it } from "vitest";

import { createTestTree, type TestNode } from "./tree.fixtures";
import { getExpandableBranchValues, replaceNodeChildren } from "./treeCollectionUtils";

const createCollection = () =>
  createTestTree([
    {
      id: "fruits",
      label: "Fruits",
      children: [
        { id: "apple", label: "Apple" },
        { id: "berries", label: "Berries", childrenCount: 2 },
      ],
    },
    { id: "remote", label: "Remote", childrenCount: 1 },
    { id: "carrot", label: "Carrot" },
  ]);

describe("getExpandableBranchValues", () => {
  it("returns branches that have children and excludes childrenCount-only nodes", () => {
    expect(getExpandableBranchValues(createCollection())).toEqual(["fruits"]);
  });

  it("includes a lazy branch once its children are present", () => {
    const loaded = replaceNodeChildren(createCollection(), "berries", [
      { id: "strawberry", label: "Strawberry" },
    ]);

    expect(loaded && getExpandableBranchValues(loaded)).toEqual(["fruits", "berries"]);
  });
});

describe("replaceNodeChildren", () => {
  it("replaces an unloaded node's children by value without mutating the source", () => {
    const collection = createCollection();
    const next = replaceNodeChildren(collection, "remote", [{ id: "remote/a", label: "A" }]);

    expect(next).not.toBeNull();
    expect(next?.getNodeChildren(next.findNode("remote") as TestNode).map((n) => n.id)).toEqual([
      "remote/a",
    ]);
    expect(next?.findNode("remote")?.childrenCount).toBe(1);
    expect(collection.getNodeChildren(collection.findNode("remote") as TestNode)).toEqual([]);
    expect(next?.findNode("carrot")).toBeDefined();
  });

  it("returns null when the value is missing", () => {
    expect(replaceNodeChildren(createCollection(), "missing", [])).toBeNull();
  });

  it("returns null when the node already has children", () => {
    expect(
      replaceNodeChildren(createCollection(), "fruits", [{ id: "pear", label: "Pear" }]),
    ).toBeNull();
  });
});
