import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from ".";

const renderBar = (value: number) =>
  render(
    <Progress.Root value={value}>
      <Progress.Track>
        <Progress.Range data-testid="range" />
      </Progress.Track>
    </Progress.Root>,
  );

describe("Progress", () => {
  it("holds a value outside min–max to the nearest end", () => {
    const { unmount } = renderBar(-20);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
    expect(screen.getByTestId("range").style.width).toBe("0%");
    unmount();

    renderBar(150);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    expect(screen.getByTestId("range").style.width).toBe("100%");
    expect(screen.getByTestId("range").hasAttribute("data-complete")).toBe(true);
  });

  it("shows the value in the unit formatOptions asks for", () => {
    render(
      <Progress.Root
        value={50}
        max={200}
        formatOptions={{ style: "unit", unit: "megabyte" }}
      >
        <Progress.ValueText data-testid="text" />
      </Progress.Root>,
    );

    expect(screen.getByTestId("text").textContent).toBe(
      new Intl.NumberFormat("en-US", { style: "unit", unit: "megabyte" }).format(50),
    );
  });
});
