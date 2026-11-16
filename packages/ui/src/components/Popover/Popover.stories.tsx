import preview from "@construkt-kit/story-kit/preview";

import { Popover } from ".";
import { Button } from "../Buttons";

const meta = preview.meta({
  title: "Components/Popover",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline">Open Popover</Button>
      </Popover.Trigger>
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
        asChild
      >
        <Button variant="outline">Open Popover</Button>
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
      <Popover.Trigger asChild>
        <Button>With Arrow</Button>
      </Popover.Trigger>
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
      <Popover.Trigger asChild>
        <Button variant="outline">Share</Button>
      </Popover.Trigger>
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
