import type { Meta, StoryObj } from "@storybook/react-vite";
import { XIcon } from "lucide-react";
import { useState } from "react";

import { ActionBar } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Actionbar",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function ControlledActionBarStory() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen((prev) => !prev)}>
        {open ? "Deselect items" : "Select items"}
      </Button>
      <ActionBar.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
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
          <ActionBar.CloseTrigger onClick={() => setOpen(false)}>
            <XIcon />
          </ActionBar.CloseTrigger>
        </ActionBar.Content>
      </ActionBar.Root>
    </>
  );
}

export const Default: Story = {
  render: () => <ControlledActionBarStory />,
};
