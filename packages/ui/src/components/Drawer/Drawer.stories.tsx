import type { Meta, StoryObj } from "@storybook/react-vite";

import { Drawer } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Drawer",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
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
};

export const LeftPlacement: Story = {
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
};
