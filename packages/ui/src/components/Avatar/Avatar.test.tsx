import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from ".";

const renderFallback = (name: string) =>
  render(
    <Avatar.Root>
      <Avatar.Fallback
        data-testid="fallback"
        name={name}
      />
    </Avatar.Root>,
  );

describe("Avatar", () => {
  it("shows the generic icon for a blank name", () => {
    const { getByTestId } = renderFallback("   ");

    expect(getByTestId("fallback").querySelector("svg")).not.toBeNull();
  });

  it("takes whole characters for initials", () => {
    const { getByTestId } = renderFallback("😀 Smith");

    expect(getByTestId("fallback").textContent).toBe("😀S");
  });
});
