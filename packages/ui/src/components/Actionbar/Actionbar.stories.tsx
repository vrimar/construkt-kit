import type { Meta, StoryObj } from "@storybook/react-vite";
import { XIcon } from "lucide-react";
import { ActionBar } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Actionbar",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ActionBar.Root open>
      <ActionBar.Positioner>
        <ActionBar.Content>
          <ActionBar.SelectionTrigger>2 selected</ActionBar.SelectionTrigger>
          <ActionBar.Separator />
          <Button
            variant="outline"
            size="sm"
          >
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            Move
          </Button>
          <ActionBar.CloseTrigger>
            <XIcon />
          </ActionBar.CloseTrigger>
        </ActionBar.Content>
      </ActionBar.Positioner>
    </ActionBar.Root>
  ),
};
