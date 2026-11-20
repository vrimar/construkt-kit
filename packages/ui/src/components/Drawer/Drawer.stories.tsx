import preview from "@construkt-kit/story-kit/preview";
import { fn } from "storybook/test";

import { Flex } from "#styled-system/jsx";
import { drawer } from "#styled-system/recipes";

import { Drawer } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Badge } from "../Badge";
import { Button } from "../Buttons";
import { Field } from "../Form";
import { Input, Textarea } from "../Input";
import { Stack } from "../Layout";
import { LocaleProvider } from "../LocaleProvider";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/Drawer",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Drawer.Root title="Drawer Title">
      <Drawer.Trigger render={<Button />}>Open Drawer</Drawer.Trigger>
      <Drawer.Content>
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
        <Drawer.Root
          size={size}
          title={`Drawer ${size}`}
        >
          <Drawer.Trigger render={<Button variant="outline" />}>Open {size}</Drawer.Trigger>
          <Drawer.Content>
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
    <Drawer.Root
      placement="start"
      title="Left Drawer"
    >
      <Drawer.Trigger render={<Button variant="outline" />}>Open Left</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Body>Slides in from the left.</Drawer.Body>
        <Drawer.CloseTrigger />
      </Drawer.Content>
    </Drawer.Root>
  ),
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <Drawer.Root
      defaultOpen
      title="Edit task"
    >
      <Drawer.Trigger render={<Button />}>Edit task</Drawer.Trigger>
      <Drawer.Content>
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
          <Drawer.ActionTrigger render={<Button variant="outline" />}>Cancel</Drawer.ActionTrigger>
          <Button>Save</Button>
        </Drawer.Footer>
        <Drawer.CloseTrigger />
      </Drawer.Content>
    </Drawer.Root>
  ),
});

const statuses = [
  "Open",
  "In review",
  "Blocked",
  "Done",
  "Archived",
  "Mine",
  "Unassigned",
  "Urgent",
];

export const RightToLeftWithScroller = meta.story({
  tags: ["open-state"],
  args: { onOpenChange: fn() },
  render: ({ onOpenChange }) => (
    <LocaleProvider locale="ar">
      <div dir="rtl">
        <Drawer.Root
          title="Filters"
          defaultOpen
          onOpenChange={onOpenChange}
        >
          <Drawer.Content>
            <Drawer.Body>
              <Stack
                gap="2"
                w="full"
              >
                <Text>Status</Text>
                <Flex
                  role="group"
                  aria-label="Status"
                  tabIndex={0}
                  w="full"
                  gap="2"
                  overflowX="auto"
                  pb="2"
                >
                  {statuses.map((status) => (
                    <Badge
                      key={status}
                      flexShrink="0"
                    >
                      {status}
                    </Badge>
                  ))}
                </Flex>
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>
      </div>
    </LocaleProvider>
  ),
});
