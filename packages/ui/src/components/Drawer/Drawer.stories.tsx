import preview from "@construkt-kit/story-kit/preview";

import { drawer } from "#styled-system/recipes";

import { Drawer } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { Field } from "../Form";
import { Input, Textarea } from "../Input";
import { Stack } from "../Layout";

const meta = preview.meta({
  title: "Components/Drawer",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Button>Open Drawer</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Drawer Title</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>This is the drawer body content. Place any content here.</Drawer.Body>
        <Drawer.Footer>
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </Drawer.Footer>
        <Drawer.CloseTrigger />
      </Drawer.Content>
    </Drawer.Root>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={drawer.variantMap.size}
      renderPreview={(size) => (
        <Drawer.Root size={size}>
          <Drawer.Trigger asChild>
            <Button variant="outline">Open {size}</Button>
          </Drawer.Trigger>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Drawer {size}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>This drawer uses the {size} size variant.</Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger />
          </Drawer.Content>
        </Drawer.Root>
      )}
    />
  ),
});

export const LeftPlacement = meta.story({
  render: () => (
    <Drawer.Root placement="start">
      <Drawer.Trigger asChild>
        <Button variant="outline">Open Left</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Left Drawer</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>Slides in from the left.</Drawer.Body>
        <Drawer.CloseTrigger />
      </Drawer.Content>
    </Drawer.Root>
  ),
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <Drawer.Root defaultOpen>
      <Drawer.Trigger asChild>
        <Button>Edit task</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit task</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <Stack gap="4">
            <Field label="Title">
              <Input defaultValue="Draft the Q3 roadmap" />
            </Field>
            <Field label="Assignee">
              <Input defaultValue="Grace Hopper" />
            </Field>
            <Field
              label="Notes"
              helperText="Visible to everyone on the project."
            >
              <Textarea defaultValue="Collect input from design and sales before Friday." />
            </Field>
          </Stack>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.ActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </Drawer.ActionTrigger>
          <Button>Save</Button>
        </Drawer.Footer>
        <Drawer.CloseTrigger />
      </Drawer.Content>
    </Drawer.Root>
  ),
});
