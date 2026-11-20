import preview from "@construkt-kit/story-kit/preview";
import { useRef, useState } from "react";
import { fn } from "storybook/test";

import { styled } from "#styled-system/jsx";
import { dialog } from "#styled-system/recipes";

import { Dialog } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { DatePicker } from "../DatePicker";
import { Field } from "../Form";
import { Input } from "../Input";
import { Stack } from "../Layout";
import { Menu } from "../Menu";
import { Select } from "../Select";
import { Text } from "../Text";
import { Toaster, toaster } from "../Toast";

const meta = preview.meta({
  title: "Components/Dialog",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Dialog.Root title="Confirm action">
      <Dialog.Trigger render={<Button />}>Open dialog</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Body>Are you sure you want to continue? This cannot be undone.</Dialog.Body>
        <Dialog.Footer>
          <Dialog.ActionTrigger render={<Button variant="outline" />}>Cancel</Dialog.ActionTrigger>
          <Button colorPalette="red">Confirm</Button>
        </Dialog.Footer>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={dialog.variantMap.size}
      renderPreview={(size) => (
        <Dialog.Root
          size={size}
          title={`Dialog ${size}`}
        >
          <Dialog.Trigger render={<Button variant="outline" />}>Open {size}</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Body>This dialog uses the {size} size variant.</Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger render={<Button variant="outline" />}>
                Cancel
              </Dialog.ActionTrigger>
              <Button>Confirm</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Root>
      )}
    />
  ),
});

export const NoBackdrop = meta.story({
  render: () => (
    <Dialog.Root title="Dialog without backdrop">
      <Dialog.Trigger render={<Button variant="outline" />}>Open (no backdrop)</Dialog.Trigger>
      <Dialog.Content backdrop={false}>
        <Dialog.Body>Content here.</Dialog.Body>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  ),
});

const fruits = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

export const WithPickers = meta.story({
  render: function WithPickersStory() {
    const [fruit, setFruit] = useState<number | null>(null);
    const [repeat, setRepeat] = useState("Never");
    return (
      <>
        <Toaster />
        <Dialog.Root title="Schedule delivery">
          <Dialog.Trigger render={<Button variant="outline" />}>Schedule delivery</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Body>
              <Stack gap="4">
                <Field label="Fruit">
                  <Select
                    items={fruits}
                    getItemValue={(item) => item.id}
                    getItemLabel={(item) => item.name}
                    value={fruit}
                    onValueChange={setFruit}
                    placeholder="Select fruit"
                  />
                </Field>
                <Field label="Delivery date">
                  <DatePicker onValueChange={fn()} />
                </Field>
                <Menu.Root onSelect={setRepeat}>
                  <Menu.Trigger render={<Button variant="outline" />}>
                    Repeat: {repeat}
                  </Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item value="Never">Never</Menu.Item>
                    <Menu.Item value="Weekly">Weekly</Menu.Item>
                    <Menu.Item value="Monthly">Monthly</Menu.Item>
                  </Menu.Content>
                </Menu.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="plain"
                me="auto"
                onClick={() =>
                  toaster.create({ title: "We'll remind you the day before", closable: true })
                }
              >
                Remind me
              </Button>
              <Dialog.ActionTrigger render={<Button variant="outline" />}>
                Cancel
              </Dialog.ActionTrigger>
              <Button>Schedule</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Root>
      </>
    );
  },
});

export const Phone = meta.story({
  ...Default.input,
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <Dialog.Root
      defaultOpen
      title="Archive Q3 planning?"
      description="Archived projects are read-only."
    >
      <Dialog.Trigger render={<Button />}>Archive project</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Body>
          The project and its 12 tasks move to the archive. Members keep read access, and you can
          restore it from Settings at any time.
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.ActionTrigger render={<Button variant="outline" />}>Cancel</Dialog.ActionTrigger>
          <Button>Archive</Button>
        </Dialog.Footer>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  ),
});

export const WithPageDialog = meta.story({
  tags: ["open-state"],
  args: { onOpenChange: fn() },
  render: function WithPageDialogStory({ onOpenChange }) {
    const help = useRef<HTMLDialogElement>(null);
    return (
      <Dialog.Root
        title="Keyboard shortcuts"
        defaultOpen
        onOpenChange={onOpenChange}
      >
        <Dialog.Content>
          <Dialog.Body>
            <Stack
              gap="4"
              alignItems="start"
            >
              <Text>Press ? anywhere to list every shortcut.</Text>
              <Button
                variant="outline"
                onClick={() => help.current?.showModal()}
              >
                Show help
              </Button>
            </Stack>
            <styled.dialog
              ref={help}
              aria-label="Help"
              layerStyle="modal.surface"
              m="auto"
              p="5"
            >
              <form method="dialog">
                <Stack
                  gap="3"
                  alignItems="start"
                >
                  <Text>Shortcuts work everywhere except in text fields.</Text>
                  <Button type="submit">Got it</Button>
                </Stack>
              </form>
            </styled.dialog>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    );
  },
});

export const HeldOpen = meta.story({
  tags: ["open-state"],
  args: { onOpenChange: fn() },
  render: ({ onOpenChange }) => (
    <Dialog.Root
      title="Uploading files"
      open
      onOpenChange={onOpenChange}
    >
      <Dialog.Content>
        <styled.form
          method="dialog"
          display="contents"
        >
          <Dialog.Body>3 of 5 files uploaded. This closes once every file is done.</Dialog.Body>
          <Dialog.Footer>
            <Button type="submit">Run in background</Button>
          </Dialog.Footer>
        </styled.form>
      </Dialog.Content>
    </Dialog.Root>
  ),
});

export const EscapeDisabled = meta.story({
  tags: ["open-state"],
  args: { onOpenChange: fn() },
  render: ({ onOpenChange }) => (
    <Dialog.Root
      title="Rename board"
      defaultOpen
      closeOnEscape={false}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content>
        <styled.form
          method="dialog"
          display="contents"
        >
          <Dialog.Body>
            <Field label="Name">
              <Input defaultValue="Q3 planning" />
            </Field>
          </Dialog.Body>
          <Dialog.Footer>
            <Button type="submit">Save</Button>
          </Dialog.Footer>
        </styled.form>
      </Dialog.Content>
    </Dialog.Root>
  ),
});

export const SiblingDialogs = meta.story({
  tags: ["open-state"],
  render: function SiblingDialogsStory() {
    const [payment, setPayment] = useState(false);
    return (
      <>
        <Dialog.Root
          title="Invoice INV-204"
          defaultOpen
        >
          <Dialog.Content>
            <Dialog.Body>
              <Stack
                gap="4"
                alignItems="start"
              >
                <Text>Due 30 September · 1,240.00 EUR</Text>
                <Button
                  variant="outline"
                  onClick={() => setPayment(true)}
                >
                  View payment
                </Button>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Root>
        <Dialog.Root
          title="Payment"
          open={payment}
          onOpenChange={setPayment}
        >
          <Dialog.Content>
            <Dialog.Body>Paid by card ending 4242 on 3 September.</Dialog.Body>
          </Dialog.Content>
        </Dialog.Root>
      </>
    );
  },
});

export const OpenedFromMenu = meta.story({
  render: function OpenedFromMenuStory() {
    const [renaming, setRenaming] = useState(false);
    return (
      <>
        <Menu.Root>
          <Menu.Trigger render={<Button variant="outline" />}>Board actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item
              value="rename"
              onSelect={() => setRenaming(true)}
            >
              Rename board
            </Menu.Item>
            <Menu.Item value="archive">Archive board</Menu.Item>
          </Menu.Content>
        </Menu.Root>
        <Dialog.Root
          title="Rename board"
          open={renaming}
          onOpenChange={setRenaming}
        >
          <Dialog.Content>
            <Dialog.Body>
              <Field label="Name">
                <Input defaultValue="Q3 planning" />
              </Field>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger render={<Button variant="outline" />}>
                Cancel
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </>
    );
  },
});
