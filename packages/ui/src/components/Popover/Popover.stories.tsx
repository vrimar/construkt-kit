import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { Popover } from ".";
import { Button } from "../Buttons";
import { Input } from "../Input";
import { HStack } from "../Layout";

const meta = preview.meta({
  title: "Components/Popover",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="outline" />}>Open Popover</Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>Popover Title</Popover.Title>
        </Popover.Header>
        <Popover.Body>This is the popover body content.</Popover.Body>
        <Popover.Footer>
          <Button size="sm">Action</Button>
        </Popover.Footer>
        <Popover.CloseTrigger />
      </Popover.Content>
    </Popover.Root>
  ),
});

export const TriggerWithTooltip = meta.story({
  render: () => (
    <Popover.Root>
      <Popover.Trigger
        tooltip="Show details"
        render={<Button variant="outline" />}
      >
        Open Popover
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>Popover Title</Popover.Title>
        </Popover.Header>
        <Popover.Body>This trigger also shows a tooltip on hover.</Popover.Body>
        <Popover.CloseTrigger />
      </Popover.Content>
    </Popover.Root>
  ),
});

export const WithArrow = meta.story({
  render: () => (
    <Popover.Root>
      <Popover.Trigger render={<Button />}>With Arrow</Popover.Trigger>
      <Popover.Content>
        <Popover.Arrow />
        <Popover.Body>Content with arrow</Popover.Body>
        <Popover.CloseTrigger />
      </Popover.Content>
    </Popover.Root>
  ),
});

export const Phone = meta.story({
  ...Default.input,
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <Popover.Root defaultOpen>
      <Popover.Trigger render={<Button variant="outline" />}>Share</Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>Share Q3 planning</Popover.Title>
          <Popover.Description>Anyone in the workspace with the link can view.</Popover.Description>
        </Popover.Header>
        <Popover.Footer>
          <Button
            size="sm"
            variant="outline"
          >
            Copy link
          </Button>
          <Button size="sm">Invite people</Button>
        </Popover.Footer>
        <Popover.CloseTrigger />
      </Popover.Content>
    </Popover.Root>
  ),
});

export const Nested = meta.story({
  render: () => (
    <HStack gap="3">
      <Popover.Root>
        <Popover.Trigger render={<Button variant="outline" />}>Filters</Popover.Trigger>
        <Popover.Content>
          <Popover.Body gap="3">
            Filter the list by owner and status.
            <Popover.Root placement="right-start">
              <Popover.Trigger render={<Button size="sm" />}>More options</Popover.Trigger>
              <Popover.Content>
                <Popover.Body>Archived items stay hidden.</Popover.Body>
              </Popover.Content>
            </Popover.Root>
          </Popover.Body>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger render={<Button variant="outline" />}>Sort</Popover.Trigger>
        <Popover.Content>
          <Popover.Body>Newest first.</Popover.Body>
        </Popover.Content>
      </Popover.Root>
    </HStack>
  ),
});

export const ExitAnimation = meta.story({
  render: () => (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="outline" />}>Filters</Popover.Trigger>
      <Popover.Content
        css={{ "&[data-ending-style]": { animation: "fade-out 600ms linear forwards" } }}
      >
        <Popover.Body>Filter the list by owner and status.</Popover.Body>
      </Popover.Content>
    </Popover.Root>
  ),
});

function KeptOpenOnFocusOutStory() {
  const [open, setOpen] = useState(false);
  return (
    <HStack gap="3">
      <Popover.Root
        open={open}
        onOpenChange={(next, details) => {
          if (details.reason !== "focus-out") setOpen(next);
        }}
      >
        <Popover.Trigger render={<Button variant="outline" />}>Filters</Popover.Trigger>
        <Popover.Content>
          <Popover.Body gap="3">
            <Input
              size="sm"
              aria-label="Owner"
            />
            <Button
              size="sm"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </Popover.Body>
        </Popover.Content>
      </Popover.Root>
      <Button variant="plain">Elsewhere</Button>
    </HStack>
  );
}

export const KeptOpenOnFocusOut = meta.story({ render: () => <KeptOpenOnFocusOutStory /> });
