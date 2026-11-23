import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Slider } from ".";
import { Field } from "../Form";

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

  it("steps a horizontal thumb with the up and down arrows too", async () => {
    render(<Slider defaultValue={[50]} />);

    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}");

    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("51");
  });

  it("reports the value a drag reached when disabling cuts it short", async () => {
    const onValueChangeEnd = vi.fn();
    const { container, rerender } = render(
      <Slider
        defaultValue={[50]}
        onValueChangeEnd={onValueChangeEnd}
      />,
    );

    fireEvent.pointerDown(container.querySelector("[data-slot='control']") as Element, {
      button: 0,
    });
    rerender(
      <Slider
        defaultValue={[50]}
        onValueChangeEnd={onValueChangeEnd}
        disabled
      />,
    );
    await act(async () => {});

    expect(onValueChangeEnd.mock.calls.map(([value]) => value)).toEqual([[0]]);
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

  it("focuses its thumb when its Field's label is pressed", async () => {
    render(
      <Field label="Volume">
        <Slider defaultValue={[40]} />
      </Field>,
    );

    await userEvent.click(screen.getByText("Volume"));

    expect(document.activeElement).toBe(screen.getByRole("slider", { name: "Volume" }));
  });
});
