import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2Icon } from "lucide-react";
import { fn } from "storybook/test";

import { ConfirmPopover } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Popover/ConfirmPopover",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Destructive: Story = {
  render: () => (
    <ConfirmPopover
      title="Delete Q3 planning?"
      description="2 tasks go back to the backlog. You can undo this."
      confirmLabel="Delete project"
      destructive
      onConfirm={fn()}
    >
      <Button
        variant="outline"
        leftIcon={<Trash2Icon />}
      >
        Delete project
      </Button>
    </ConfirmPopover>
  ),
};

export const NonDestructive: Story = {
  render: () => (
    <ConfirmPopover
      title="Switch the project to v3?"
      description="Charts refresh with the new data."
      confirmLabel="Switch"
      onConfirm={fn()}
    >
      <Button variant="outline">Switch to v3</Button>
    </ConfirmPopover>
  ),
};

export const Async: Story = {
  render: () => (
    <ConfirmPopover
      title="Delete Weekly sync?"
      confirmLabel="Delete meeting"
      destructive
      onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
    >
      <Button variant="outline">Delete meeting</Button>
    </ConfirmPopover>
  ),
};

export const Phone: Story = {
  ...Destructive,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
