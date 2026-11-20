import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { Radio, RadioGroup } from ".";

const resetForm = async (form: HTMLFormElement | null) => {
  act(() => form?.reset());
  await act(() => new Promise(requestAnimationFrame));
};

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
