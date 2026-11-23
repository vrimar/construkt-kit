import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-popover-inheritedtext--inside-small-unselectable-text"],
  "the popup sets its text like the page, not like the row it opens from",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Details" }));
    const body = page.getByText("Paid on March 9 by bank transfer.");
    await expect(body).toBeVisible();

    const text = await body.evaluate((element) => {
      const read = (node: Element) => {
        const style = getComputedStyle(node);
        return {
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          fontVariantNumeric: style.fontVariantNumeric,
          userSelect: style.userSelect,
        };
      };
      const layer = element.closest("[popover], dialog");
      return { layer: layer && read(layer), page: read(element.ownerDocument.body) };
    });

    expect(text.layer).toEqual({ ...text.page, userSelect: "text" });
  },
);
