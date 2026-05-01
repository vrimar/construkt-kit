import type { Meta, StoryObj } from "@storybook/react-vite";

import { Dialog } from ".";
import { Button } from "../Buttons";
import { VStack } from "../Layout";

const meta: Meta = {
  title: "Components/Dialog",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
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
};

export const Sizes: Story = {
  render: () => (
    <VStack
      alignItems="flex-start"
      gap="3"
    >
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Dialog.Root
          key={size}
          size={size}
        >
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
      ))}
    </VStack>
  ),
};

export const NoBackdrop: Story = {
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
};
