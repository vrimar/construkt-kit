import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CheckboxCard } from ".";

describe("CheckboxCard", () => {
  it("describes the checkbox by its card's description", () => {
    render(
      <CheckboxCard
        label="Backups"
        description="Daily snapshots"
      />,
    );

    expect(screen.getByRole("checkbox", { description: "Daily snapshots" })).not.toBeNull();
  });
});
