import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { Radio, RadioGroup } from ".";
import { resetForm } from "../../_shared/resetForm";
import { Field } from "../Form";

it("reports and checks the radio that is pressed", async () => {
  const onValueChange = vi.fn();
  render(
    <RadioGroup
      defaultValue="a"
      onValueChange={onValueChange}
    >
      <Radio value="a">First</Radio>
      <Radio value="b">Second</Radio>
    </RadioGroup>,
  );

  await userEvent.click(screen.getByText("Second"));

  expect(onValueChange).toHaveBeenCalledExactlyOnceWith(
    "b",
    expect.objectContaining({ reason: "input-change" }),
  );
  expect(screen.getByRole<HTMLInputElement>("radio", { name: "Second" }).checked).toBe(true);
  expect(screen.getByRole<HTMLInputElement>("radio", { name: "First" }).checked).toBe(false);
});

it("reports a form reset only when it changes the value", async () => {
  const onValueChange = vi.fn();
  render(
    <form>
      <RadioGroup
        defaultValue="a"
        onValueChange={onValueChange}
      >
        <Radio value="a">First</Radio>
        <Radio value="b">Second</Radio>
      </RadioGroup>
    </form>,
  );
  const first = screen.getByRole<HTMLInputElement>("radio", { name: "First" });

  await resetForm(first.form);
  expect(onValueChange).not.toHaveBeenCalled();

  await userEvent.click(screen.getByText("Second"));
  await resetForm(first.form);

  expect(onValueChange).toHaveBeenLastCalledWith(
    "a",
    expect.objectContaining({ reason: "form-reset" }),
  );
  expect(first.checked).toBe(true);
});

it("keeps its radios on the shown value when a form reset is refused", async () => {
  render(
    <form>
      <RadioGroup
        defaultValue="a"
        onValueChange={(_, details) => {
          if (details.reason === "form-reset") details.cancel();
        }}
      >
        <Radio value="a">First</Radio>
        <Radio value="b">Second</Radio>
      </RadioGroup>
    </form>,
  );
  const second = screen.getByRole<HTMLInputElement>("radio", { name: "Second" });
  await userEvent.click(second);

  await resetForm(second.form);

  expect(second.checked).toBe(true);
  expect(screen.getByRole<HTMLInputElement>("radio", { name: "First" }).checked).toBe(false);
});

it("takes the disabled state of the Field around its group", () => {
  render(
    <Field disabled>
      <RadioGroup>
        <Radio value="a">First</Radio>
      </RadioGroup>
    </Field>,
  );

  expect(screen.getByRole<HTMLInputElement>("radio", { name: "First" }).disabled).toBe(true);
});

it("is named after its Field's label and described by its error", () => {
  render(
    <Field
      label="Plan"
      invalid
      errorText="Pick a plan."
    >
      <RadioGroup>
        <Radio value="a">First</Radio>
      </RadioGroup>
    </Field>,
  );

  const group = screen.getByRole("radiogroup", { name: "Plan" });
  expect(document.getElementById(group.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
    "Pick a plan.",
  );
});

it("submits its value but ignores presses while read-only", async () => {
  const onValueChange = vi.fn();
  render(
    <form aria-label="Plan">
      <RadioGroup
        name="plan"
        defaultValue="a"
        readOnly
        onValueChange={onValueChange}
      >
        <Radio value="a">First</Radio>
        <Radio value="b">Second</Radio>
      </RadioGroup>
    </form>,
  );

  await userEvent.click(screen.getByText("Second"));

  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole<HTMLInputElement>("radio", { name: "First" }).checked).toBe(true);
  expect(new FormData(screen.getByRole<HTMLFormElement>("form")).get("plan")).toBe("a");
});

it("focuses its checked radio when its Field's label is pressed", async () => {
  render(
    <Field label="Plan">
      <RadioGroup defaultValue="b">
        <Radio value="a">First</Radio>
        <Radio value="b">Second</Radio>
      </RadioGroup>
    </Field>,
  );

  await userEvent.click(screen.getByText("Plan"));

  expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Second" }));
});
