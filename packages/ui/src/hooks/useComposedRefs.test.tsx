import { render } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { useComposedRefs } from "./useComposedRefs";

it("attaches the node to every ref and clears each when it detaches", () => {
  const first = createRef<HTMLDivElement>();
  const second = vi.fn();
  const third = createRef<HTMLDivElement>();
  function Box() {
    return <div ref={useComposedRefs(first, second, third)} />;
  }

  const { container, unmount } = render(<Box />);
  const node = container.firstElementChild;
  expect([first.current, second.mock.lastCall?.[0], third.current]).toEqual([node, node, node]);

  unmount();
  expect([first.current, second.mock.lastCall?.[0], third.current]).toEqual([null, null, null]);
});
