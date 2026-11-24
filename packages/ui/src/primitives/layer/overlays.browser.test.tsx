import { render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { expect, it, onTestFinished, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { Dialog } from "../../components/Dialog";
import { Drawer } from "../../components/Drawer";
import { Menu } from "../../components/Menu";
import { Popover } from "../../components/Popover";
import { Tooltip } from "../../components/Tooltip";
import { hasOpenOverlay } from "./layerStack";

const ActionsMenu = ({
  onSelect,
  onExitComplete,
}: {
  onSelect?: () => void;
  onExitComplete?: () => void;
}) => (
  <Menu.Root
    onSelect={onSelect}
    onExitComplete={onExitComplete}
  >
    <Menu.Trigger>Actions</Menu.Trigger>
    <Menu.Content>
      <Menu.Item value="rename">Rename</Menu.Item>
    </Menu.Content>
  </Menu.Root>
);

const pickRename = async () => {
  await userEvent.click(screen.getByRole("button", { name: "Actions" }));
  await userEvent.click(await screen.findByRole("menuitem", { name: "Rename" }));
};

it("calls a menu's onExitComplete once it is gone and focus is back on its trigger", async () => {
  const exited = vi.fn();
  render(<ActionsMenu onExitComplete={() => exited(document.activeElement)} />);

  await pickRename();

  const trigger = screen.getByRole("button", { name: "Actions" });
  await expect.poll(() => exited.mock.calls).toEqual([[trigger]]);
});

it("calls a popover's onExitComplete once focus is back on its trigger", async () => {
  const exited = vi.fn();
  render(
    <Popover.Root onExitComplete={() => exited(document.activeElement)}>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Content>
        <button type="button">Save</button>
      </Popover.Content>
    </Popover.Root>,
  );

  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  await screen.findByRole("button", { name: "Save" });
  await userEvent.keyboard("{Escape}");

  const trigger = screen.getByRole("button", { name: "Open" });
  await expect.poll(() => exited.mock.calls).toEqual([[trigger]]);
});

it("keeps focus in a popover a menu item opens, over the closing menu's trigger", async () => {
  const Row = () => {
    const [confirming, setConfirming] = useState(false);
    return (
      <>
        <Menu.Root onSelect={() => setConfirming(true)}>
          <Menu.Trigger>More</Menu.Trigger>
          <Menu.Content>
            <Menu.Item value="delete">Delete…</Menu.Item>
          </Menu.Content>
        </Menu.Root>
        <Popover.Root
          open={confirming}
          onOpenChange={setConfirming}
        >
          <Popover.Anchor>Row</Popover.Anchor>
          <Popover.Content>
            <button type="button">Delete</button>
          </Popover.Content>
        </Popover.Root>
      </>
    );
  };
  render(<Row />);

  await userEvent.click(screen.getByRole("button", { name: "More" }));
  await userEvent.click(await screen.findByRole("menuitem", { name: "Delete…" }));
  await expect.poll(() => screen.queryByRole("menu")).toBeNull();

  await expect.poll(() => document.activeElement?.textContent).toBe("Delete");
});

it("counts an open popover but not a tooltip, leaving out one inside or holding except", async () => {
  render(
    <div data-testid="pane">
      <Tooltip label="Hint">
        <button type="button">Help</button>
      </Tooltip>
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>
          <span>Body</span>
        </Popover.Content>
      </Popover.Root>
    </div>,
  );

  await userEvent.hover(screen.getByRole("button", { name: "Help" }));
  await screen.findByText("Hint");
  expect(hasOpenOverlay()).toBe(false);

  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  await screen.findByText("Body");
  expect(hasOpenOverlay()).toBe(true);
  expect(hasOpenOverlay(screen.getByTestId("pane"))).toBe(false);
  expect(hasOpenOverlay(screen.getByText("Body"))).toBe(false);
});

function NestedPopovers({ onCloseInner }: { onCloseInner: (close: () => void) => void }) {
  const [innerOpen, setInnerOpen] = useState(true);
  useEffect(() => {
    onCloseInner(() => flushSync(() => setInnerOpen(false)));
  }, [onCloseInner]);
  return (
    <Popover.Root defaultOpen>
      <Popover.Trigger>Filters</Popover.Trigger>
      <Popover.Content>
        <span>Outer body</span>
        <Popover.Root
          open={innerOpen}
          onOpenChange={setInnerOpen}
        >
          <Popover.Trigger>More options</Popover.Trigger>
          <Popover.Content>
            <span>Inner body</span>
          </Popover.Content>
        </Popover.Root>
      </Popover.Content>
    </Popover.Root>
  );
}

it("lets a press outside close a popover whose nested popover closed for another reason mid-press", async () => {
  let closeInner = () => {};
  render(
    <NestedPopovers
      onCloseInner={(close) => {
        closeInner = close;
      }}
    />,
  );
  await screen.findByText("Inner body");
  const press = (type: "pointerdown" | "pointerup") =>
    document.body.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0 }));

  press("pointerdown");
  closeInner();
  press("pointerup");

  await expect.poll(() => screen.queryByText("Outer body")).toBeNull();
});

function SiblingDialogs() {
  const [second, setSecond] = useState(false);
  return (
    <>
      <Dialog.Root
        aria-label="First"
        defaultOpen
      >
        <Dialog.Content>
          <Dialog.Body>
            <button
              type="button"
              onClick={() => setSecond(true)}
            >
              Open second
            </button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root
        aria-label="Second"
        open={second}
        onOpenChange={setSecond}
      >
        <Dialog.Content>
          <Dialog.Body>
            <button type="button">Inside second</button>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

it("leaves a modal open under a sibling modal pressed inside, and closes only the sibling on a press outside both", async () => {
  render(<SiblingDialogs />);
  await userEvent.click(await screen.findByRole("button", { name: "Open second" }));
  const first = screen.getByRole("dialog", { name: "First" });
  const second = await screen.findByRole("dialog", { name: "Second" });

  await userEvent.click(screen.getByRole("button", { name: "Inside second" }));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(first).toHaveProperty("open", true);
  expect(second).toHaveProperty("open", true);

  await userEvent.click(second, { position: { x: 4, y: 4 } });
  await expect.poll(() => screen.queryByRole("dialog", { name: "Second" })).toBeNull();
  expect(first).toHaveProperty("open", true);
});

it("keeps focus where a menu item moved it, over the closing menu's trigger", async () => {
  const Renaming = () => {
    const [editing, setEditing] = useState(false);
    return (
      <>
        {editing && (
          <input
            aria-label="Name"
            ref={(node) => node?.focus()}
          />
        )}
        <ActionsMenu onSelect={() => setEditing(true)} />
      </>
    );
  };
  render(<Renaming />);

  await pickRename();
  await expect.poll(() => screen.queryByRole("menu")).toBeNull();

  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Name" }));
});

it("frees the page as a dialog starts closing, and shows a popover it opens above it", async () => {
  const showPopover = vi.spyOn(HTMLElement.prototype, "showPopover");
  onTestFinished(() => showPopover.mockRestore());
  const Palette = () => {
    const [open, setOpen] = useState(true);
    const [asking, setAsking] = useState(false);
    return (
      <>
        <Popover.Root
          open={asking}
          onOpenChange={setAsking}
        >
          <Popover.Anchor>Row</Popover.Anchor>
          <Popover.Content>
            <button type="button">Confirm delete</button>
          </Popover.Content>
        </Popover.Root>
        <Dialog.Root
          aria-label="Palette"
          open={open}
          onOpenChange={setOpen}
        >
          <Dialog.Content>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setAsking(true);
              }}
            >
              Delete
            </button>
          </Dialog.Content>
        </Dialog.Root>
      </>
    );
  };
  render(<Palette />);
  const remove = await screen.findByRole("button", { name: "Delete" });
  showPopover.mockClear();

  await userEvent.click(remove);

  await expect
    .poll(() => document.activeElement)
    .toBe(screen.getByRole("button", { name: "Confirm delete" }));
  expect(showPopover.mock.contexts.map((element) => (element as Element).tagName)).toEqual([
    "DIALOG",
    "DIV",
  ]);
});

it("keeps focus out of a dialog that unmounts open", async () => {
  const Row = () => {
    const [editing, setEditing] = useState(false);
    return (
      <Popover.Root defaultOpen>
        <Popover.Trigger>Row</Popover.Trigger>
        <Popover.Content>
          <button
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          {editing && (
            <Dialog.Root
              aria-label="Edit row"
              open
              onOpenChange={setEditing}
            >
              <Dialog.Content>
                <input aria-label="Name" />
                <button type="button">Done</button>
              </Dialog.Content>
            </Dialog.Root>
          )}
        </Popover.Content>
      </Popover.Root>
    );
  };
  render(<Row />);
  await userEvent.click(await screen.findByRole("button", { name: "Edit" }));
  const dialog = await screen.findByRole("dialog", { name: "Edit row" });
  screen.getByRole("button", { name: "Done" }).focus();
  const focused: Node[] = [];
  const record = (event: FocusEvent) => focused.push(event.target as Node);
  document.addEventListener("focusin", record);
  onTestFinished(() => document.removeEventListener("focusin", record));

  await userEvent.keyboard("{Escape}");
  await expect.poll(() => dialog.isConnected).toBe(false);

  expect(focused.filter((target) => dialog.contains(target))).toEqual([]);
});

it("keeps a nested dialog above its parent as both close at once", async () => {
  const showPopover = vi.spyOn(HTMLElement.prototype, "showPopover");
  onTestFinished(() => showPopover.mockRestore());
  const Editor = () => {
    const [editing, setEditing] = useState(true);
    const [confirming, setConfirming] = useState(true);
    return (
      <Dialog.Root
        aria-label="Editor"
        open={editing}
        onOpenChange={setEditing}
      >
        <Dialog.Content>
          <Dialog.Root
            aria-label="Discard changes?"
            open={confirming}
            onOpenChange={setConfirming}
          >
            <Dialog.Content>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setEditing(false);
                }}
              >
                Discard
              </button>
            </Dialog.Content>
          </Dialog.Root>
        </Dialog.Content>
      </Dialog.Root>
    );
  };
  render(<Editor />);
  const discard = await screen.findByRole("button", { name: "Discard" });
  const editor = screen.getByRole("dialog", { name: "Editor" });
  const confirm = screen.getByRole("dialog", { name: "Discard changes?" });
  showPopover.mockClear();

  await userEvent.click(discard);
  await expect.poll(() => editor.matches(":popover-open")).toBe(true);

  const dialogs = showPopover.mock.contexts.filter(
    (element) => element instanceof HTMLDialogElement,
  );
  expect(dialogs.at(-1)).toBe(confirm);
});

const layoutOf = (dialog: Element) => {
  const style = getComputedStyle(dialog);
  const content = dialog.querySelector<HTMLElement>("[data-slot=content]");
  const { x, y, width, height } = dialog.getBoundingClientRect();
  return {
    positioner: [x, y, width, height, style.display, style.padding, style.borderWidth],
    content: [content?.offsetLeft, content?.offsetTop, content?.offsetWidth, content?.offsetHeight],
    backdrop: getComputedStyle(dialog, "::backdrop").backgroundColor,
  };
};

type ModalProps = { open: boolean; close: () => void };

it.each([
  [
    "dialog",
    ({ open, close }: ModalProps) => (
      <Dialog.Root
        aria-label="Settings"
        open={open}
      >
        <Dialog.Content>
          <button
            type="button"
            onClick={close}
          >
            Close it
          </button>
        </Dialog.Content>
      </Dialog.Root>
    ),
  ],
  [
    "drawer",
    ({ open, close }: ModalProps) => (
      <Drawer.Root
        title="Settings"
        open={open}
      >
        <Drawer.Content>
          <Drawer.Body>
            <button
              type="button"
              onClick={close}
            >
              Close it
            </button>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    ),
  ],
])("keeps a closing %s laid out as it was while it animates out", async (_kind, Modal) => {
  let paused: Promise<void> | undefined;
  const Closing = () => {
    const [open, setOpen] = useState(true);
    return (
      <Modal
        open={open}
        close={() => {
          setOpen(false);
          paused = new Promise((resolve) => {
            requestAnimationFrame(() => {
              for (const animation of document.getAnimations()) animation.pause();
              resolve();
            });
          });
        }}
      />
    );
  };
  render(<Closing />);
  const button = await screen.findByRole("button", { name: "Close it" });
  const dialog = screen.getByRole("dialog", { name: "Settings" });
  await expect.poll(() => document.getAnimations().length).toBe(0);
  const open = layoutOf(dialog);

  await userEvent.click(button);
  await paused;
  await expect.poll(() => dialog.hasAttribute("data-closed")).toBe(true);

  expect(layoutOf(dialog)).toEqual(open);
});
