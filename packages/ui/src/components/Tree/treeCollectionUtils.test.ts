import { describe, expect, it } from "vitest";

import { childIdsOf, findTestNode, testTree } from "./tree.fixtures";
import { TreeCollection } from "./treeCollection";
import { getExpandableBranchValues, replaceNodeChildren } from "./treeCollectionUtils";

const createCollection = () =>
  TreeCollection.from(
    testTree([
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
    ]),
  );

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
    expect(childIdsOf(next?.nodes, "remote")).toEqual(["remote/a"]);
    expect(next?.findNode("remote")?.childrenCount).toBe(1);
    expect(findTestNode(collection.nodes, "remote")?.children).toBeUndefined();
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
