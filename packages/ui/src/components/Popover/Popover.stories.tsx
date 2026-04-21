import type { Meta, StoryObj } from "@storybook/react-vite";

import { Popover } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Popover",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
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
};

export const WithArrow: Story = {
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
};
