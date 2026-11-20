import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Slider } from ".";

const root = (container: HTMLElement) => container.querySelector("[data-slot='root']");

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
    expect(container.querySelector("[data-slot='markerGroup']")).toBeNull();
  });

  it("places marks inside the control so a label above doesn't offset them", () => {
    const { container } = render(
      <Slider
        label="Decimals"
        marks={[0, 1, 2]}
        defaultValue={[1]}
        max={2}
      />,
    );

    const control = container.querySelector("[data-slot='control']");
    expect(control?.querySelector("[data-slot='markerGroup']")).not.toBeNull();
  });

  it("calls onValueChangeEnd only after a key press or drag that changed the value", async () => {
    const onValueChangeEnd = vi.fn();
    const { container } = render(
      <Slider
        defaultValue={[100]}
        onValueChangeEnd={onValueChangeEnd}
      />,
    );
    const thumb = screen.getByRole("slider");

    await userEvent.tab();
    await userEvent.keyboard("{End}{ArrowRight}");
    fireEvent.pointerDown(thumb, { button: 0 });
    await act(async () => fireEvent.pointerUp(document));
    expect(onValueChangeEnd).not.toHaveBeenCalled();

    await userEvent.keyboard("{ArrowLeft}");
    fireEvent.pointerDown(container.querySelector("[data-slot='control']") as Element, {
      button: 0,
    });
    await act(async () => fireEvent.pointerUp(document));
    expect(onValueChangeEnd.mock.calls.map(([value]) => value)).toEqual([[99], [0]]);
  });

  it("shows the value without a label", () => {
    const { container } = render(
      <Slider
        showValue
        defaultValue={[40]}
      />,
    );

    expect(container.querySelector("[data-slot='valueText']")?.textContent).toBe("40");
  });
});
