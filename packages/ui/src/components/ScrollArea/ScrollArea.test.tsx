import { act, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "../LocaleProvider";
import { ScrollArea } from "./ScrollArea";

const viewportOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".scroll-area__viewport");

const contentOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".scroll-area__content");

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

    const root = container.querySelector(".scroll-area__root");
    expect(root?.className).toContain("scroll-area__root--scrollbars_vertical");
    expect(contentOf(container)?.style.minWidth).toBe("");
  });

  it("lays its content out in LocaleProvider's direction, which its scroll math follows", () => {
    const { container } = render(
      <LocaleProvider locale="ar">
        <ScrollArea>
          <div>content</div>
        </ScrollArea>
      </LocaleProvider>,
    );

    expect(container.querySelector(".scroll-area__root")?.getAttribute("dir")).toBe("rtl");
  });

  it("leaves viewport overflow to the recipe", () => {
    const { container } = render(
      <ScrollArea scrollbars="vertical">
        <div>content</div>
      </ScrollArea>,
    );

    const viewport = viewportOf(container);
    expect(viewport?.style.overflow).toBe("");
    expect(viewport?.className).toContain("scroll-area__viewport--scrollbars_vertical");
  });

  describe("with overflowing content", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("drops the viewport's tab stop once its content gains a focusable element", async () => {
      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
      vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(100);
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
      vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(100);
      let showButton: (show: boolean) => void = () => {};
      function Body() {
        const [show, setShow] = useState(false);
        showButton = setShow;
        return show ? <button type="button">Go</button> : <p>text</p>;
      }

      const { container } = render(
        <ScrollArea scrollbars="vertical">
          <Body />
        </ScrollArea>,
      );
      const viewport = viewportOf(container);
      await waitFor(() => expect(viewport?.getAttribute("tabindex")).toBe("0"));

      act(() => showButton(true));
      await waitFor(() => expect(viewport?.hasAttribute("tabindex")).toBe(false));
    });
  });
});
