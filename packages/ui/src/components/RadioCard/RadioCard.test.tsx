import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RadioCard } from ".";

describe("RadioCard", () => {
  it("describes each radio by its card's description", () => {
    render(
      <RadioCard.Root defaultValue="starter">
        <RadioCard.Item
          value="starter"
          label="Starter"
          description="Best for small projects"
        />
      </RadioCard.Root>,
    );

    expect(
      screen.getByRole("radio", { name: "Starter", description: "Best for small projects" }),
    ).not.toBeNull();
  });

  it("draws a custom indicator inside the radio control", () => {
    render(
      <RadioCard.Root defaultValue="starter">
        <RadioCard.Item
          value="starter"
          label="Starter"
          indicator={<svg data-testid="indicator" />}
        />
      </RadioCard.Root>,
    );

    expect(screen.getByTestId("indicator").closest('[data-slot="itemControl"]')).not.toBeNull();
  });
});
