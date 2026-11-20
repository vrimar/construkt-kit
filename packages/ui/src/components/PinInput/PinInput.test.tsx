import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PinInput } from ".";

const nextFrame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

function renderPinInput(onHiddenChange?: (value: string) => void) {
  return render(
    <form aria-label="Verify">
      <PinInput.Root name="code">
        <PinInput.Label>Code</PinInput.Label>
        <PinInput.Control>
          {[0, 1, 2, 3].map((index) => (
            <PinInput.Input
              key={index}
              index={index}
            />
          ))}
        </PinInput.Control>
        <PinInput.HiddenInput onChange={(event) => onHiddenChange?.(event.currentTarget.value)} />
      </PinInput.Root>
    </form>,
  );
}

const slot = (n: number) =>
  screen.getByRole<HTMLInputElement>("textbox", { name: `pin code ${n} of 4` });

describe("PinInput", () => {
  it("fills the slots from the focused one with pasted text", async () => {
    const user = userEvent.setup();
    renderPinInput();

    await user.click(slot(1));
    await user.keyboard("7");
    await user.paste("123");
    await nextFrame();

    expect([1, 2, 3, 4].map((n) => slot(n).value).join("")).toBe("7123");
  });

  it("tells a form library on the hidden input about each change", async () => {
    const user = userEvent.setup();
    const onHiddenChange = vi.fn();
    renderPinInput(onHiddenChange);

    await user.click(slot(1));
    await user.keyboard("42");

    expect(onHiddenChange).toHaveBeenLastCalledWith("42");
  });

  it("empties its slots and form value when the form resets", async () => {
    const user = userEvent.setup();
    renderPinInput();
    const form = screen.getByRole<HTMLFormElement>("form", { name: "Verify" });

    await user.click(slot(1));
    await user.keyboard("1234");
    expect(new FormData(form).get("code")).toBe("1234");

    act(() => form.reset());

    expect(new FormData(form).get("code")).toBe("");
    expect([1, 2, 3, 4].map((n) => slot(n).value).join("")).toBe("");
  });

  it("keeps a read-only value through Backspace, Delete and paste", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PinInput.Root
        readOnly
        defaultValue={["1", "2", "3", "4"]}
        onValueChange={onValueChange}
      >
        <PinInput.Control>
          {[0, 1, 2, 3].map((index) => (
            <PinInput.Input
              key={index}
              index={index}
            />
          ))}
        </PinInput.Control>
      </PinInput.Root>,
    );

    await user.click(slot(4));
    await user.keyboard("{Backspace}{Delete}");
    await user.paste("9999");
    await nextFrame();

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
