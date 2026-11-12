import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon } from "lucide-react";
import { fn } from "storybook/test";

import { PromptPopover } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Popover/PromptPopover",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <PromptPopover
      title="New folder"
      defaultValue="Untitled folder"
      submitLabel="Create"
      onSubmit={fn()}
    >
      <Button
        variant="outline"
        leftIcon={<PlusIcon />}
      >
        New folder
      </Button>
    </PromptPopover>
  ),
};
