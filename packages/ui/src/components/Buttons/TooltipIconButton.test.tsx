import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TooltipIconButton } from "./TooltipIconButton";

describe("TooltipIconButton", () => {
  it("names the button after its label", () => {
    render(
      <TooltipIconButton label="Delete">
        <span />
      </TooltipIconButton>,
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
  });

  it("keeps an explicit aria-label", () => {
    render(
      <TooltipIconButton
        label="Delete"
        aria-label="Delete row 3"
      >
        <span />
      </TooltipIconButton>,
    );

    expect(screen.getByRole("button", { name: "Delete row 3" })).toBeDefined();
  });
});
