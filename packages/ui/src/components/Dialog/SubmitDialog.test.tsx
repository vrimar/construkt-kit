import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../Buttons";
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
        submitDisabled
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

  it("caps its width at contentWidth", () => {
    render(
      <SubmitDialog
        title="Edit"
        contentWidth={540}
      >
        Body
      </SubmitDialog>,
    );
    expect(screen.getByRole("dialog").style.maxWidth).toBe("540px");
  });

  it("lays out extra footer buttons that don't submit", async () => {
    const onSubmit = vi.fn();
    const onToggle = vi.fn();
    render(
      <SubmitDialog
        title="Export"
        onSubmit={onSubmit}
        footer={({ cancelButton, submitButton }) => (
          <>
            <Button onClick={onToggle}>Toggle All</Button>
            {cancelButton}
            {submitButton}
          </>
        )}
      >
        Body
      </SubmitDialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Toggle All" }));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("lets the footer replace the submit button", async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <SubmitDialog
        title="Settings"
        onSubmit={onSubmit}
        onClose={onClose}
        footer={({ cancelButton }) => (
          <>
            {cancelButton}
            <Button type="submit">Apply</Button>
          </>
        )}
      >
        <input aria-label="Name" />
      </SubmitDialog>,
    );
    expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
    await userEvent.type(screen.getByLabelText("Name"), "x{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders a footer without onSubmit", () => {
    render(
      <SubmitDialog
        title="Info"
        footer={({ cancelButton }) => cancelButton}
      >
        Body
      </SubmitDialog>,
    );
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
  });

  it("shows loading on the submit button", () => {
    render(
      <SubmitDialog
        title="Edit"
        onSubmit={vi.fn()}
        loading
      >
        Body
      </SubmitDialog>,
    );
    const submit = screen.getByRole<HTMLButtonElement>("button", { name: "Submit" });
    expect(submit.hasAttribute("data-loading")).toBe(true);
    expect(submit.disabled).toBe(true);
  });

  it("stays open while loading", async () => {
    const onClose = vi.fn();
    render(
      <SubmitDialog
        title="Delete"
        onSubmit={vi.fn()}
        onClose={onClose}
        loading
      >
        Body
      </SubmitDialog>,
    );
    const cancel = screen.getByRole<HTMLButtonElement>("button", { name: "Cancel" });
    const closeButton = screen.getByRole<HTMLButtonElement>("button", { name: "Close" });
    expect(cancel.disabled).toBe(true);
    expect(closeButton.disabled).toBe(true);

    await userEvent.click(cancel);
    await userEvent.click(closeButton);
    await userEvent.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("closes on Escape once loading ends", async () => {
    const onClose = vi.fn();
    const dialog = (loading: boolean) => (
      <SubmitDialog
        title="Delete"
        onSubmit={vi.fn()}
        onClose={onClose}
        loading={loading}
      >
        Body
      </SubmitDialog>
    );
    const { rerender } = render(dialog(true));
    rerender(dialog(false));

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders nothing when closed", () => {
    render(
      <SubmitDialog
        title="Edit"
        open={false}
      >
        Body
      </SubmitDialog>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("stays open when the popover that opened it closes", async () => {
    render(<OpenedFromPopover />);
    await userEvent.click(await screen.findByRole("button", { name: "Open dialog" }));
    await waitFor(() => expect(screen.queryByText("Open dialog")).toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("dialog", { name: "Opened from popover" })).not.toBeNull();
  });
});
