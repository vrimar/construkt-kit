import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { scrollTree } from "./virtualTree";

storyTest(
  ["components-virtualtree--navigation-tree"],
  "scrollTree visits every row of a virtual tree, top to end",
  async ({ page }) => {
    const tree = page.getByRole("tree", { name: "Chapters" });
    const chapters = new Set<string>();

    await scrollTree(tree, async () => {
      for (const text of await tree.getByRole("treeitem", { level: 2 }).allTextContents())
        chapters.add(text);
    });

    expect(chapters.size).toBe(80);
  },
);
