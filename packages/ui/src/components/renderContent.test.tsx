import { expect, it } from "vitest";

import { asRender } from "./renderContent";

it("renders a fragment as children, since a fragment can't take the part's props", () => {
  const fragment = (
    <>
      <span>a</span>
      <span>b</span>
    </>
  );

  expect(asRender(fragment)).toEqual({ children: fragment });
});
