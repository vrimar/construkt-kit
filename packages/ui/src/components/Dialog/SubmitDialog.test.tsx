import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "../Input";
import { Popover } from "../Popover";
import { SubmitDialog } from "./SubmitDialog";

const OpenedFromPopover = () => {
  const [popoverOpen, setPopoverOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Popover.Root
        open={popoverOpen}
        onOpenChange={({ open }) => setPopoverOpen(open)}
      >
        <Popover.Trigger>Settings</Popover.Trigger>
        <Popover.Content>
          <button
            type="button"
            onClick={() => {
              setDialogOpen(true);
              setPopoverOpen(false);
            }}
          >
            Open dialog
          </button>
        </Popover.Content>
      </Popover.Root>
      {dialogOpen && (
        <SubmitDialog
          title="Opened from popover"
          onClose={() => setDialogOpen(false)}
        >
          Body
        </SubmitDialog>
      )}
    </>
  );
};

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

  it("submits on Enter in a single-line textarea", async () => {
    const onSubmit = vi.fn();
    render(
      <SubmitDialog
        title="Edit"
        onSubmit={onSubmit}
      >
        <Textarea
          aria-label="Name"
          preventNewline
        />
      </SubmitDialog>,
    );
    await userEvent.type(screen.getByLabelText("Name"), "x{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByLabelText<HTMLTextAreaElement>("Name").value).toBe("x");
  });

  it("does not submit from a single-line textarea while submit is disabled", async () => {
    const onSubmit = vi.fn();
    render(
      <SubmitDialog
        title="Edit"
        onSubmit={onSubmit}
        isSubmitDisabled
      >
        <Textarea
          aria-label="Name"
          preventNewline
        />
      </SubmitDialog>,
    );
    await userEvent.type(screen.getByLabelText("Name"), "x{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
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

  it("stays open when the popover that opened it closes", async () => {
    render(<OpenedFromPopover />);
    await userEvent.click(await screen.findByRole("button", { name: "Open dialog" }));
    await waitFor(() => expect(screen.queryByText("Open dialog")).toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("dialog", { name: "Opened from popover" })).not.toBeNull();
  });
});
