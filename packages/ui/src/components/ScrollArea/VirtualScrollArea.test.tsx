import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VirtualScrollArea } from "./VirtualScrollArea";

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
});
