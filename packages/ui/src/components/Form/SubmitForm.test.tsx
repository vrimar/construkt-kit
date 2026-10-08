import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SubmitDialog } from "../Dialog";
import { SubmitForm } from "./SubmitForm";

describe("SubmitForm", () => {
  it("labels its buttons with submitLabel and cancelLabel", async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(
      <SubmitForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitLabel="Create"
        cancelLabel="Back"
      >
        Body
      </SubmitForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("leaves validation to the caller", async () => {
    const onSubmit = vi.fn();
    render(
      <SubmitForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      >
        <input
          aria-label="Name"
          required
        />
      </SubmitForm>,
    );
    await userEvent.type(screen.getByLabelText("Name"), "{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("renders the same action buttons as SubmitDialog", () => {
    const { container } = render(
      <SubmitForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Save"
        cancelLabel="Back"
        submitDisabled
      >
        Body
      </SubmitForm>,
    );
    render(
      <SubmitDialog
        title="Edit"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        submitLabel="Save"
        cancelLabel="Back"
        submitDisabled
      >
        Body
      </SubmitDialog>,
    );
    const form = within(container);
    const dialog = within(screen.getByRole("dialog"));

    for (const name of ["Back", "Save"]) {
      expect(dialog.getByRole("button", { name }).outerHTML).toBe(
        form.getByRole("button", { name }).outerHTML,
      );
    }
    expect(container.querySelector("form")?.noValidate).toBe(true);
    expect(screen.getByRole("dialog").querySelector("form")?.noValidate).toBe(true);
  });
});
