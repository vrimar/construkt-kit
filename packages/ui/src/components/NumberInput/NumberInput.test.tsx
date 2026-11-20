import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NumberInput } from ".";
import { Field } from "../Form";

const mouse = { pointerId: 1, pointerType: "mouse" };

describe("NumberInput", () => {
  it("takes its name and description from an enclosing Field", () => {
    render(
      <Field
        label="Quantity"
        helperText="Up to ten."
      >
        <NumberInput.Root defaultValue="1">
          <NumberInput.Input />
          <NumberInput.Control />
        </NumberInput.Root>
      </Field>,
    );

    expect(
      screen.getByRole("spinbutton", { name: "Quantity", description: "Up to ten." }),
    ).not.toBeNull();
  });

  it("leaves an empty value valid, and steppable both ways, when min is above zero", () => {
    render(
      <NumberInput.Root min={1}>
        <NumberInput.Label>Seats</NumberInput.Label>
        <NumberInput.Input />
        <NumberInput.Control />
      </NumberInput.Root>,
    );

    expect(
      screen.getByRole("spinbutton", { name: "Seats" }).getAttribute("aria-invalid"),
    ).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "decrease value" }).disabled).toBe(
      false,
    );
  });

  it("reports no focus for a mouse press on a trigger that leaves focus where it was", () => {
    const onFocusChange = vi.fn();
    render(
      <NumberInput.Root
        data-testid="root"
        defaultValue="1"
        focusInputOnChange={false}
        onFocusChange={onFocusChange}
      >
        <NumberInput.Input />
        <NumberInput.Control />
      </NumberInput.Root>,
    );
    const increment = screen.getByRole("button", { name: "increment value" });

    fireEvent.pointerDown(increment, { ...mouse, button: 0 });
    fireEvent.pointerUp(increment, mouse);

    expect(screen.getByRole("spinbutton").getAttribute("aria-valuenow")).toBe("2");
    expect(onFocusChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("root").hasAttribute("data-focus")).toBe(false);
  });

  it("commits on release a trigger press or scrub that leaves focus outside", () => {
    const onValueCommit = vi.fn();
    render(
      <NumberInput.Root
        defaultValue="1"
        focusInputOnChange={false}
        onValueCommit={onValueCommit}
      >
        <NumberInput.Scrubber data-testid="scrubber" />
        <NumberInput.Input />
        <NumberInput.Control />
      </NumberInput.Root>,
    );
    const increment = screen.getByRole("button", { name: "increment value" });

    fireEvent.pointerDown(increment, { ...mouse, button: 0 });
    expect(onValueCommit).not.toHaveBeenCalled();
    fireEvent.pointerUp(increment, mouse);
    expect(onValueCommit).toHaveBeenCalledExactlyOnceWith("2", { valueAsNumber: 2 });

    fireEvent.pointerDown(screen.getByTestId("scrubber"), { ...mouse, button: 0 });
    act(() => {
      document.dispatchEvent(new PointerEvent("pointerup", { ...mouse, bubbles: true }));
    });
    expect(onValueCommit).toHaveBeenCalledTimes(2);
  });

  it("scrubs from a mouse press only, never from a touch or the mouse events a tap emulates", () => {
    render(
      <NumberInput.Root defaultValue="1">
        <NumberInput.Scrubber data-testid="scrubber" />
        <NumberInput.Input />
      </NumberInput.Root>,
    );
    const scrubber = screen.getByTestId("scrubber");

    fireEvent.pointerDown(scrubber, { pointerId: 2, pointerType: "touch", button: 0 });
    fireEvent.mouseDown(scrubber, { button: 0 });
    expect(scrubber.hasAttribute("data-scrubbing")).toBe(false);

    fireEvent.pointerDown(scrubber, { ...mouse, button: 0 });
    expect(scrubber.hasAttribute("data-scrubbing")).toBe(true);
    act(() => {
      document.dispatchEvent(new PointerEvent("pointerup", { ...mouse, bubbles: true }));
    });
    expect(scrubber.hasAttribute("data-scrubbing")).toBe(false);
  });

  it("reads and writes the locale's decimal separator", async () => {
    const user = userEvent.setup();
    const onValueCommit = vi.fn();
    render(
      <NumberInput.Root
        locale="de-DE"
        defaultValue="2,5"
        onValueCommit={onValueCommit}
      >
        <NumberInput.Label>Weight</NumberInput.Label>
        <NumberInput.Input />
      </NumberInput.Root>,
    );

    await user.click(screen.getByRole("spinbutton", { name: "Weight" }));
    await user.keyboard("{ArrowUp}");
    await user.tab();

    expect(onValueCommit).toHaveBeenCalledWith("3,5", { valueAsNumber: 3.5 });
  });

  it("accepts typed grouping and commits the number without it", async () => {
    const user = userEvent.setup();
    const onValueCommit = vi.fn();
    render(
      <NumberInput.Root onValueCommit={onValueCommit}>
        <NumberInput.Label>Amount</NumberInput.Label>
        <NumberInput.Input />
      </NumberInput.Root>,
    );
    const input = screen.getByRole("spinbutton", { name: "Amount" });

    await user.type(input, "1,500");
    expect(input).toHaveProperty("value", "1,500");
    await user.tab();

    expect(onValueCommit).toHaveBeenCalledWith("1500", { valueAsNumber: 1500 });
  });
});
