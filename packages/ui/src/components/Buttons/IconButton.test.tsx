import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders its icon inside the button", () => {
    render(
      <IconButton
        aria-label="Close"
        icon={<span data-testid="icon" />}
      />,
    );

    const button = screen.getByRole("button", { name: "Close" });
    expect(button.firstElementChild).toBe(screen.getByTestId("icon"));
  });

  it("renders its icon inside its render element", () => {
    render(
      <IconButton
        render={<a href="/close" />}
        aria-label="Close"
        icon={<span data-testid="icon" />}
      />,
    );

    const link = screen.getByRole("link", { name: "Close" });
    expect(link.className).toMatch(/\bbutton\b/);
    expect(link.firstElementChild).toBe(screen.getByTestId("icon"));
  });
});
