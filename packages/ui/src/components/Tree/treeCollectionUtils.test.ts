import { createTreeCollection } from "@ark-ui/react/tree-view";
import { describe, expect, it } from "vitest";

import { getExpandableBranchValues, replaceNodeChildren } from "./treeCollectionUtils";

interface LazyNode {
  id: string;
  label: string;
  childrenCount?: number;
  children?: LazyNode[];
}

const createCollection = () =>
  createTreeCollection<LazyNode>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.label,
    rootNode: {
      id: "ROOT",
      label: "",
      children: [
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
      ],
    },
  });

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
    expect(next?.getNodeChildren(next.findNode("remote") as LazyNode).map((n) => n.id)).toEqual([
      "remote/a",
    ]);
    expect(next?.findNode("remote")?.childrenCount).toBe(1);
    expect(collection.getNodeChildren(collection.findNode("remote") as LazyNode)).toEqual([]);
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
