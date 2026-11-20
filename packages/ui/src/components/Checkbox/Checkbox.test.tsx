import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from ".";

const resetForm = async (form: HTMLFormElement | null) => {
  act(() => form?.reset());
  await act(() => new Promise(requestAnimationFrame));
};

describe("Checkbox", () => {
  it("ignores presses while read-only", async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        readOnly
        onCheckedChange={onCheckedChange}
      >
        Notify me
      </Checkbox>,
    );

    await userEvent.click(screen.getByText("Notify me"));

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByText("Notify me").hasAttribute("data-checked")).toBe(false);
  });

  it("stays indeterminate when its owner keeps it so after a press", async () => {
    render(
      <Checkbox
        checked="indeterminate"
        onCheckedChange={vi.fn()}
      >
        Select all
      </Checkbox>,
    );

    await userEvent.click(screen.getByText("Select all"));

    const input = screen.getByRole<HTMLInputElement>("checkbox", { name: "Select all" });
    expect(input.indeterminate).toBe(true);
    expect(input.checked).toBe(false);
  });

  it("goes back to its initial state when its form resets, reporting only a change", async () => {
    const onCheckedChange = vi.fn();
    render(
      <form>
        <Checkbox onCheckedChange={onCheckedChange}>Remember me</Checkbox>
      </form>,
    );
    const input = screen.getByRole<HTMLInputElement>("checkbox", { name: "Remember me" });

    await resetForm(input.form);
    expect(onCheckedChange).not.toHaveBeenCalled();

    await userEvent.click(input);
    expect(input.checked).toBe(true);

    await resetForm(input.form);

    expect(onCheckedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "form-reset" }),
    );
    expect(input.checked).toBe(false);
    expect(screen.getByText("Remember me").hasAttribute("data-checked")).toBe(false);
  });

  it("keeps its state when a form's onReset handler cancels the reset", async () => {
    render(
      <form onReset={(event) => event.preventDefault()}>
        <Checkbox>Remember me</Checkbox>
      </form>,
    );
    const input = screen.getByRole<HTMLInputElement>("checkbox", { name: "Remember me" });
    await userEvent.click(input);

    await resetForm(input.form);

    expect(input.checked).toBe(true);
    expect(screen.getByText("Remember me").hasAttribute("data-checked")).toBe(true);
  });

  it("puts a group back to its initial value, once, when its form resets", async () => {
    const onValueChange = vi.fn();
    render(
      <form>
        <Checkbox.Group
          defaultValue={["email"]}
          onValueChange={onValueChange}
        >
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
          <Checkbox value="push">Push</Checkbox>
        </Checkbox.Group>
      </form>,
    );
    const email = screen.getByRole<HTMLInputElement>("checkbox", { name: "Email" });
    const sms = screen.getByRole<HTMLInputElement>("checkbox", { name: "SMS" });

    await resetForm(email.form);
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.click(sms);
    onValueChange.mockClear();
    await resetForm(email.form);

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(
      ["email"],
      expect.objectContaining({ reason: "form-reset" }),
    );
    expect(email.checked).toBe(true);
    expect(sms.checked).toBe(false);
    expect(screen.getByRole<HTMLInputElement>("checkbox", { name: "Push" }).checked).toBe(false);
  });

  it("reports a group's checked values as its checkboxes toggle", async () => {
    const onValueChange = vi.fn();
    render(
      <Checkbox.Group
        defaultValue={["email"]}
        onValueChange={onValueChange}
      >
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
      </Checkbox.Group>,
    );

    await userEvent.click(screen.getByText("SMS"));

    expect(onValueChange).toHaveBeenLastCalledWith(
      ["email", "sms"],
      expect.objectContaining({ reason: "input-change" }),
    );
    expect(screen.getByRole<HTMLInputElement>("checkbox", { name: "SMS" }).checked).toBe(true);
  });
});
