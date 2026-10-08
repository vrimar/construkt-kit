import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormFileUpload } from "./FormFileUpload";

describe("FormFileUpload", () => {
  it("names the trigger after the chosen file", async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn();
    const { container } = render(
      <FormFileUpload
        name="report"
        onFileChange={onFileChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Select file..." })).toBeDefined();

    const file = new File(["data"], "report.xlsx");
    await user.upload(container.querySelector("input[type='file']") as HTMLInputElement, file);

    expect(await screen.findByRole("button", { name: "report.xlsx" })).toBeDefined();
    expect(onFileChange).toHaveBeenLastCalledWith(file);
  });

  it("leaves the cursor to the disabled state", () => {
    render(
      <FormFileUpload
        disabled
        onFileChange={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Select file..." });
    const cursorClasses = trigger.className.split(" ").filter((c) => c.startsWith("cursor_"));
    expect(cursorClasses).toEqual([]);
    expect(trigger.parentElement?.className.split(" ")).toContain("cursor_not-allowed");
  });
});
