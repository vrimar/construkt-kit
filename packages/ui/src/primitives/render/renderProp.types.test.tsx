import { describe, expectTypeOf, it } from "vitest";

import type { RenderProp } from "./useRender";

const asDiv: RenderProp = (props) => <div {...props} />;

describe("RenderProp", () => {
  it("spreads its props onto an element of any type", () => {
    expectTypeOf(asDiv).toBeFunction();
  });
});
