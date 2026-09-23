import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SubmitDialog } from "./SubmitDialog";

describe("SubmitDialog", () => {
  it("submits on Enter in a field", async () => {
    const onSubmit = vi.fn();
    render(
      <SubmitDialog
        title="Edit"
        onSubmit={onSubmit}
      >
        <input aria-label="Name" />
      </SubmitDialog>,
    );
    await userEvent.type(screen.getByLabelText("Name"), "x{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does not submit a form that renders it", async () => {
    const onOuterSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const onSubmit = vi.fn();
    render(
      <form onSubmit={onOuterSubmit}>
        <SubmitDialog
          title="Edit"
          onSubmit={onSubmit}
        >
          Body
        </SubmitDialog>
      </form>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onOuterSubmit).not.toHaveBeenCalled();
  });
});
