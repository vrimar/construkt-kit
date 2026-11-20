import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field } from "../Form";
import { FormFileUpload } from "./FormFileUpload";

describe("FormFileUpload", () => {
  it("names the trigger after the chosen file, and a second pick replaces it", async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn();
    const { container } = render(
      <FormFileUpload
        name="report"
        onFileChange={onFileChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Select file..." })).toBeDefined();
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file = new File(["data"], "report.xlsx");
    await user.upload(input, file);

    expect(await screen.findByRole("button", { name: "report.xlsx" })).toBeDefined();
    expect(onFileChange).toHaveBeenLastCalledWith(file);

    const next = new File(["more data"], "summary.xlsx");
    await user.upload(input, next);

    expect(await screen.findByRole("button", { name: "summary.xlsx" })).toBeDefined();
    expect(onFileChange).toHaveBeenLastCalledWith(next);
  });

  it("takes its input's id and its disabled state from an enclosing Field", () => {
    const { container } = render(
      <Field
        label="Report"
        disabled
      >
        <FormFileUpload onFileChange={vi.fn()} />
      </Field>,
    );

    const label = screen.getByText("Report").closest("label");
    expect(label?.htmlFor).toBe(container.querySelector("input[type='file']")?.id);
    expect(screen.getByRole("button", { name: "Select file..." })).toHaveProperty("disabled", true);
  });

  it("leaves the cursor to the trigger's disabled state, even when a Field disables it", () => {
    render(
      <Field
        label="Report"
        disabled
      >
        <FormFileUpload onFileChange={vi.fn()} />
      </Field>,
    );

    const trigger = screen.getByRole("button", { name: "Select file..." });
    const cursorClasses = (element: Element | null) =>
      element?.className.split(" ").filter((name) => name.startsWith("cursor_"));
    expect([cursorClasses(trigger), cursorClasses(trigger.parentElement)]).toEqual([[], []]);
  });
});
