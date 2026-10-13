import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { VirtualScrollArea, type VirtualScrollAreaProps } from "./VirtualScrollArea";

const rows = Array.from({ length: 100 }, (_, index) => `Row ${index}`);

const mockLayout = () => {
  const offsetHeight = vi
    .spyOn(HTMLElement.prototype, "offsetHeight", "get")
    .mockImplementation(function (this: HTMLElement) {
      return this.hasAttribute("data-index") ? 20 : 200;
    });
  onTestFinished(() => offsetHeight.mockRestore());
};

const renderRows = (props: Partial<VirtualScrollAreaProps<string>> = {}) => {
  const view = (next: Partial<VirtualScrollAreaProps<string>>) => (
    <VirtualScrollArea
      items={rows}
      itemHeight={20}
      {...next}
    >
      {(row) => <div>{row}</div>}
    </VirtualScrollArea>
  );
  const result = render(view(props));
  return {
    ...result,
    rerender: (next: Partial<VirtualScrollAreaProps<string>>) => result.rerender(view(next)),
  };
};

const rowBox = (label: string) => screen.getByText(label).parentElement as HTMLElement;

const header = <div data-header>Header</div>;

const mockHeaderHeight = (initial: number) => {
  let height = initial;
  const rect = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      const top = this.previousElementSibling?.hasAttribute("data-header") ? height : 0;
      return { x: 0, y: top, top, bottom: top, left: 0, right: 0, width: 0, height: 0 } as DOMRect;
    });
  onTestFinished(() => rect.mockRestore());
  return (next: number) => {
    height = next;
  };
};

const captureResizeObservers = () => {
  const callbacks = new Map<Element, () => void>();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }
      observe(target: Element) {
        callbacks.set(target, () => this.callback([], this));
      }
      unobserve() {}
      disconnect() {}
    },
  );
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
  return (target: Element) => act(() => callbacks.get(target)?.());
};

const listBelowHeader = () => screen.getByText("Header").nextElementSibling as HTMLElement;

describe("VirtualScrollArea", () => {
  it("applies runtime height values as inline styles", () => {
    const { container } = render(
      <VirtualScrollArea
        items={["one", "two"]}
        itemHeight={24}
        height="480px"
        maxHeight="480px"
        style={{ minHeight: "0px" }}
      >
        {(item) => <div>{item}</div>}
      </VirtualScrollArea>,
    );

    const scrollAreaRoot = container.querySelector(
      '[data-scope="scroll-area"][data-part="root"]',
    ) as HTMLElement | null;

    expect(scrollAreaRoot).not.toBeNull();
    expect(scrollAreaRoot?.style.height).toBe("480px");
    expect(scrollAreaRoot?.style.maxHeight).toBe("480px");
    expect(scrollAreaRoot?.style.minHeight).toBe("0px");
  });

  it("keeps keepMountedIndex rendered at its offset past the rendered window", () => {
    mockLayout();
    renderRows({ measure: true, keepMountedIndex: 80 });

    expect(screen.getByText("Row 19")).toBeTruthy();
    expect(screen.queryByText("Row 50")).toBeNull();
    expect(rowBox("Row 19").style.marginTop).toBe("");
    expect(rowBox("Row 80").style.marginTop).toBe("1200px");
  });

  it("positions a kept item absolutely when rows are not measured", () => {
    mockLayout();
    renderRows({ keepMountedIndex: 80 });

    expect(screen.queryByText("Row 50")).toBeNull();
    expect(rowBox("Row 80").style.transform).toBe("translateY(1600px)");
  });

  it("hands out a scrollToIndex function until unmount", () => {
    mockLayout();
    const scrollHeight = vi.spyOn(Element.prototype, "scrollHeight", "get").mockReturnValue(2000);
    const clientHeight = vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(200);
    const scrollTo = vi.spyOn(Element.prototype, "scrollTo");
    onTestFinished(() => {
      scrollHeight.mockRestore();
      clientHeight.mockRestore();
      scrollTo.mockRestore();
    });
    const scrollToIndexRef = { current: undefined as ((index: number) => void) | undefined };
    const { unmount } = renderRows({ scrollToIndexRef });

    act(() => scrollToIndexRef.current?.(60));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1020 }));

    unmount();
    expect(scrollToIndexRef.current).toBeUndefined();
  });

  it("offsets the rendered window by the header above the list as it resizes", () => {
    mockLayout();
    const setHeaderHeight = mockHeaderHeight(40);
    const resize = captureResizeObservers();
    renderRows({ header });

    expect(screen.getByText("Row 17")).toBeTruthy();
    expect(screen.queryByText("Row 18")).toBeNull();
    expect(rowBox("Row 5").style.transform).toBe("translateY(100px)");

    setHeaderHeight(120);
    resize(listBelowHeader().parentElement as HTMLElement);

    expect(screen.getByText("Row 13")).toBeTruthy();
    expect(screen.queryByText("Row 14")).toBeNull();
    expect(rowBox("Row 5").style.transform).toBe("translateY(100px)");
  });

  it("pads measured rows relative to the list below a header", () => {
    mockLayout();
    mockHeaderHeight(120);
    renderRows({ header, measure: true, keepMountedIndex: 80 });

    expect(screen.queryByText("Row 14")).toBeNull();
    expect(listBelowHeader().style.paddingTop).toBe("0px");
    expect(rowBox("Row 80").style.marginTop).toBe("1320px");
    expect(listBelowHeader().style.paddingBottom).toBe("380px");
  });

  it("scrolls to an index past the header above the list", () => {
    mockLayout();
    mockHeaderHeight(120);
    const scrollHeight = vi.spyOn(Element.prototype, "scrollHeight", "get").mockReturnValue(2120);
    const clientHeight = vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(200);
    const scrollTo = vi.spyOn(Element.prototype, "scrollTo");
    onTestFinished(() => {
      scrollHeight.mockRestore();
      clientHeight.mockRestore();
      scrollTo.mockRestore();
    });
    const scrollToIndexRef = { current: undefined as ((index: number) => void) | undefined };
    renderRows({ header, scrollToIndexRef });

    act(() => scrollToIndexRef.current?.(60));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1140 }));
  });

  it("scrolls up to an index without hiding it under a sticky header", () => {
    mockLayout();
    mockHeaderHeight(120);
    const scrollHeight = vi.spyOn(Element.prototype, "scrollHeight", "get").mockReturnValue(2120);
    const clientHeight = vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(200);
    const scrollTo = vi.spyOn(Element.prototype, "scrollTo");
    onTestFinished(() => {
      scrollHeight.mockRestore();
      clientHeight.mockRestore();
      scrollTo.mockRestore();
    });
    const viewportRef = createRef<HTMLDivElement>();
    const scrollToIndexRef = { current: undefined as ((index: number) => void) | undefined };
    renderRows({ header, scrollToIndexRef, viewportRef });

    const scrollTop = vi.spyOn(Element.prototype, "scrollTop", "get").mockReturnValue(1900);
    onTestFinished(() => scrollTop.mockRestore());
    fireEvent.scroll(viewportRef.current as HTMLDivElement);

    act(() => scrollToIndexRef.current?.(60));
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ top: 1200 }));
  });

  it("re-lays out rows when a fixed itemHeight changes", () => {
    mockLayout();
    const { rerender } = renderRows();
    expect(rowBox("Row 5").style.transform).toBe("translateY(100px)");

    rerender({ itemHeight: 40 });

    expect(rowBox("Row 5").style.transform).toBe("translateY(200px)");
  });
});
