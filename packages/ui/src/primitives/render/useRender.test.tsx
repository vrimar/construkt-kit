import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { useRender } from "./useRender";

function Part({ stateAttributes }: { stateAttributes?: false }) {
  return useRender({
    state: { open: true, onOpen: () => {} },
    stateAttributes,
    props: { "data-testid": "part" },
  });
}

it("writes no state attributes with stateAttributes false", () => {
  const { getByTestId, rerender } = render(<Part />);
  expect(getByTestId("part").hasAttribute("data-open")).toBe(true);

  rerender(<Part stateAttributes={false} />);
  expect(getByTestId("part").getAttributeNames()).toEqual(["data-testid"]);
});
