import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollArea } from "./ScrollArea";

const contentOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-scope="scroll-area"][data-part="content"]');

describe("ScrollArea", () => {
  it("leaves content sizing to classes so contentCss can override it", () => {
    const { container } = render(
      <ScrollArea
        scrollbars="vertical"
        contentCss={{ minW: "0" }}
      >
        <div>content</div>
      </ScrollArea>,
    );

    const content = contentOf(container);
    expect(content?.style.minWidth).toBe("");
    expect(content?.className.split(" ")).toContain("min-w_0");
  });

  it("sizes vertical-only content to the viewport through the recipe", () => {
    const { container } = render(
      <ScrollArea scrollbars="vertical">
        <div>content</div>
      </ScrollArea>,
    );

    const root = container.querySelector('[data-scope="scroll-area"][data-part="root"]');
    expect(root?.className).toContain("scroll-area__root--scrollbars_vertical");
    expect(contentOf(container)?.style.minWidth).toBe("");
  });
});
