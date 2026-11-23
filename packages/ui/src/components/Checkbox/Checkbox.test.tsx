import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from ".";
import { resetForm } from "../../_shared/resetForm";
import { Field } from "../Form";

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

  it("disables a group's checkboxes when the Field around the group is disabled", () => {
    render(
      <Field disabled>
        <Checkbox.Group>
          <Checkbox value="email">Email</Checkbox>
        </Checkbox.Group>
      </Field>,
    );

    expect(screen.getByRole<HTMLInputElement>("checkbox", { name: "Email" }).disabled).toBe(true);
  });

  it("names a group after its Field's label and each of its checkboxes after its own", async () => {
    render(
      <Field
        label="Channels"
        helperText="Pick any."
      >
        <Checkbox.Group>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
        </Checkbox.Group>
      </Field>,
    );
    const group = screen.getByRole("group", { name: "Channels" });
    const sms = screen.getByRole<HTMLInputElement>("checkbox", { name: "SMS" });

    await userEvent.click(screen.getByText("SMS"));

    expect(sms.checked).toBe(true);
    expect(screen.getByRole<HTMLInputElement>("checkbox", { name: "Email" }).checked).toBe(false);
    expect(document.getElementById(group.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
      "Pick any.",
    );
  });

  it("focuses a group's first checkbox, unchecked, when its Field's label is pressed", async () => {
    render(
      <Field label="Channels">
        <Checkbox.Group>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
        </Checkbox.Group>
      </Field>,
    );
    const email = screen.getByRole<HTMLInputElement>("checkbox", { name: "Email" });

    await userEvent.click(screen.getByText("Channels"));

    expect(document.activeElement).toBe(email);
    expect(email.checked).toBe(false);
  });

  it("requires a check in a group inside a required Field only while none is checked", async () => {
    render(
      <Field
        label="Channels"
        required
      >
        <Checkbox.Group>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
        </Checkbox.Group>
      </Field>,
    );
    const checkboxes = screen.getAllByRole<HTMLInputElement>("checkbox");
    expect(checkboxes.map((checkbox) => checkbox.required)).toEqual([true, true]);

    await userEvent.click(screen.getByText("SMS"));

    expect(checkboxes.map((checkbox) => checkbox.required)).toEqual([false, false]);
  });
});
