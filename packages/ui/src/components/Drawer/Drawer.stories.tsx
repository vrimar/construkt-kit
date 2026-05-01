import type { Meta, StoryObj } from "@storybook/react-vite";

import { Drawer } from ".";
import { Button } from "../Buttons";
import { VStack } from "../Layout";

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

export const Sizes: Story = {
  render: () => (
    <VStack
      alignItems="flex-start"
      gap="3"
    >
      {(["xs", "sm", "md", "lg", "xl", "full"] as const).map((size) => (
        <Drawer.Root
          key={size}
          size={size}
        >
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
      ))}
    </VStack>
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
