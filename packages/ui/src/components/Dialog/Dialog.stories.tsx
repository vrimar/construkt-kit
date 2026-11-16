import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";
import { fn } from "storybook/test";

import { dialog } from "#styled-system/recipes";

import { Dialog } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { DatePicker } from "../DatePicker";
import { Field } from "../Form";
import { Stack } from "../Layout";
import { Select } from "../Select";

const meta = preview.meta({
  title: "Components/Dialog",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Open dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Confirm action</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>Are you sure you want to continue? This cannot be undone.</Dialog.Body>
        <Dialog.Footer>
          <Dialog.ActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.ActionTrigger>
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
        <Dialog.Root size={size}>
          <Dialog.Trigger asChild>
            <Button variant="outline">Open {size}</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog {size}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>This dialog uses the {size} size variant.</Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
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
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">Open (no backdrop)</Button>
      </Dialog.Trigger>
      <Dialog.Content backdrop={false}>
        <Dialog.Header>
          <Dialog.Title>Dialog without backdrop</Dialog.Title>
        </Dialog.Header>
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
    return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button variant="outline">Schedule delivery</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Schedule delivery</Dialog.Title>
          </Dialog.Header>
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
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.ActionTrigger>
            <Button>Schedule</Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Root>
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
    <Dialog.Root defaultOpen>
      <Dialog.Trigger asChild>
        <Button>Archive project</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Archive Q3 planning?</Dialog.Title>
          <Dialog.Description>Archived projects are read-only.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          The project and its 12 tasks move to the archive. Members keep read access, and you can
          restore it from Settings at any time.
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.ActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.ActionTrigger>
          <Button>Archive</Button>
        </Dialog.Footer>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  ),
});
