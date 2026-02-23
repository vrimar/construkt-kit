import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Buttons/Button";
import { Dialog } from "./Dialog";

const {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Body: DialogBody,
  Footer: DialogFooter,
  ActionTrigger: DialogActionTrigger,
  CloseTrigger: DialogCloseTrigger,
} = Dialog;

const meta: Meta = {
  title: "Components/Dialog",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
        </DialogHeader>
        <DialogBody>Are you sure you want to continue? This cannot be undone.</DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button colorPalette="red">Confirm</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  ),
};

export const NoBackdrop: Story = {
  render: () => (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button variant="outline">Open (no backdrop)</Button>
      </DialogTrigger>
      <DialogContent backdrop={false}>
        <DialogHeader>
          <DialogTitle>Dialog without backdrop</DialogTitle>
        </DialogHeader>
        <DialogBody>Content here.</DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  ),
};
