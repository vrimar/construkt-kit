import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { statusIcons } from "../statusIcons";
import { Alert } from "./Alert";

it("shows the root status's icon in a bare Alert.Indicator", () => {
  const { container } = render(
    <Alert.Root status="error">
      <Alert.Indicator />
    </Alert.Root>,
  );
  const { container: errorIcon } = render(<statusIcons.error />);

  expect(container.querySelector("[data-slot=indicator]")?.innerHTML).toBe(errorIcon.innerHTML);
});
