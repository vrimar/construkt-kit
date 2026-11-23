import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Sortable } from "./Sortable";

describe("Sortable", () => {
  const view = document.defaultView as Window & typeof globalThis;
  view.DragEvent ??= class DragEvent extends view.MouseEvent {} as typeof view.DragEvent;

  it("scrolls its scroll element along its axis while a drag nears the far edge", async () => {
    const scroller = document.createElement("div");
    document.body.append(scroller);
    vi.spyOn(scroller, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 200 }),
    );
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy;
    render(
      <Sortable.Root
        values={["a", "b"]}
        onReorder={() => {}}
        scrollElement={scroller}
      >
        <Sortable.Item
          value="a"
          label="A"
        >
          A
        </Sortable.Item>
        <Sortable.Item
          value="b"
          label="B"
        >
          B
        </Sortable.Item>
      </Sortable.Root>,
    );
    const dataTransfer = {
      types: [] as string[],
      dropEffect: "none",
      effectAllowed: "all",
      setData: () => {},
      getData: () => "",
      clearData: () => {},
      setDragImage: () => {},
    };
    const nearBottom = { dataTransfer, clientX: 100, clientY: 195 };

    fireEvent.dragStart(screen.getByText("A"), nearBottom);
    fireEvent.dragOver(screen.getByText("B"), nearBottom);

    await waitFor(() => expect(scrollBy).toHaveBeenCalled());
    expect(scrollBy.mock.calls[0][0]).toMatchObject({ left: 0, top: expect.any(Number) });
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
    fireEvent.drop(screen.getByText("B"), nearBottom);
    scroller.remove();
  });
});
