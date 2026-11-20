import { fireEvent, render } from "@testing-library/react";
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

  it("shows the fallback again while a new src loads", () => {
    const avatar = (src: string) => (
      <Avatar.Root>
        <Avatar.Fallback
          data-testid="fallback"
          name="Ada Lovelace"
        />
        <Avatar.Image
          data-testid="image"
          src={src}
          alt="Ada Lovelace"
        />
      </Avatar.Root>
    );
    const { getByTestId, rerender } = render(avatar("/ada.png"));
    fireEvent.load(getByTestId("image"));
    expect(getByTestId("fallback").hidden).toBe(true);

    rerender(avatar("/ada-2.png"));

    expect(getByTestId("fallback").hidden).toBe(false);
    expect(getByTestId("image").style.visibility).toBe("hidden");
  });
});
