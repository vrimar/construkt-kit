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

  it("renders its icon inside the asChild child", () => {
    render(
      <IconButton
        asChild
        aria-label="Close"
        icon={<span data-testid="icon" />}
      >
        <a href="/close" />
      </IconButton>,
    );

    const link = screen.getByRole("link", { name: "Close" });
    expect(link.className).toMatch(/\bbutton\b/);
    expect(link.firstElementChild).toBe(screen.getByTestId("icon"));
  });
});
