import { type Locator, expect } from "@playwright/test";

/**
 * Scrolls the `VirtualTree` in `tree`, its `tree` role element, from the top to the end, half a
 * view at a time, and calls `visit` once the rows at each position render, until `visit` returns
 * `true`. A virtual tree renders only the rows near its scroll position, so a locator finds a row
 * only while it is near. Resolves whether `visit` returned `true`.
 */
export async function scrollTree(
  tree: Locator,
  visit: () => Promise<boolean | void>,
): Promise<boolean> {
  const viewport = tree.locator('[data-slot="viewport"]').first();
  await tree.getByRole("treeitem").first().waitFor();
  for (let top = 0; ;) {
    const step = await viewport.evaluate((scroller, to) => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (to > 0 && scroller.scrollTop >= max) return null;
      scroller.scrollTop = Math.min(to, max);
      return scroller.clientHeight / 2;
    }, top);
    if (step === null) return false;
    await expect
      .poll(() =>
        viewport.evaluate((scroller) => {
          if (scroller.scrollHeight <= scroller.clientHeight) return true;
          const view = scroller.getBoundingClientRect();
          const middle = (view.top + view.bottom) / 2;
          return [...scroller.querySelectorAll('[role="treeitem"]')].some((row) => {
            const box = row.getBoundingClientRect();
            return box.top <= middle && box.bottom >= middle;
          });
        }),
      )
      .toBe(true);
    if (await visit()) return true;
    top += step;
  }
}

/**
 * `item`, a row of the `VirtualTree` in `tree`, once it renders: scrolls the tree from the top
 * until it does, unless it already has. A row that never renders is left for the next action on
 * `item` to report.
 */
export async function revealTreeItem(tree: Locator, item: Locator): Promise<Locator> {
  if (!(await item.count())) await scrollTree(tree, async () => (await item.count()) > 0);
  return item;
}
