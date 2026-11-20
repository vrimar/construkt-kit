import { render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { Dialog } from "../../components/Dialog";
import { Menu } from "../../components/Menu";
import { Popover } from "../../components/Popover";
import { Tooltip } from "../../components/Tooltip";
import { hasOpenOverlay, whenOverlaysSettle } from "./layerStack";

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

it("runs whenOverlaysSettle after the menu picked from has gone and handed focus back", async () => {
  const settled = vi.fn();
  render(
    <ActionsMenu
      onSelect={() =>
        whenOverlaysSettle(() => settled(document.activeElement, screen.queryByRole("menu")))
      }
    />,
  );

  await pickRename();

  const trigger = screen.getByRole("button", { name: "Actions" });
  await expect.poll(() => settled.mock.calls).toEqual([[trigger, null]]);
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
