import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Slider } from ".";

const root = (container: HTMLElement) => container.querySelector("[data-part='root']");

describe("Slider", () => {
  it("renders a focusable thumb with a form value when no value is given", async () => {
    const { container } = render(
      <Slider
        label="Volume"
        name="volume"
      />,
    );

    const thumb = screen.getByRole("slider");
    expect(container.querySelector<HTMLInputElement>("input[name='volume']")?.value).toBe("0");

    await userEvent.tab();
    expect(document.activeElement).toBe(thumb);
    await userEvent.keyboard("{ArrowRight}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("1");
  });

  it("follows the thumbs the machine holds", () => {
    render(<Slider defaultValue={[20, 80]} />);

    expect(screen.getAllByRole("slider")).toHaveLength(2);
  });

  it("passes orientation to the machine", () => {
    const { container } = render(
      <Slider
        orientation="vertical"
        defaultValue={[50]}
      />,
    );

    expect(root(container)?.getAttribute("data-orientation")).toBe("vertical");
    expect(screen.getByRole("slider").getAttribute("aria-orientation")).toBe("vertical");
  });

  it("renders nothing for an empty marks list", () => {
    const { container } = render(
      <Slider
        marks={[]}
        defaultValue={[50]}
      />,
    );

    expect(root(container)?.textContent).toBe("");
    expect(container.querySelector("[data-part='marker-group']")).toBeNull();
  });

  it("shows the value without a label", () => {
    const { container } = render(
      <Slider
        showValue
        defaultValue={[40]}
      />,
    );

    expect(container.querySelector("[data-part='value-text']")?.textContent).toBe("40");
  });
});
