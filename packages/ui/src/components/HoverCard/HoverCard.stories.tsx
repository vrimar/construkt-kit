import type { Meta, StoryObj } from "@storybook/react-vite";

import { HoverCard } from ".";
import { Button } from "../Buttons";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/HoverCard",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <Button variant="outline">Hover me</Button>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <HoverCard.Arrow>
          <HoverCard.ArrowTip />
        </HoverCard.Arrow>
        <Box p="4">
          <strong>Hover Card Content</strong>
          <p>This card appears on hover.</p>
        </Box>
      </HoverCard.Content>
    </HoverCard.Root>
  ),
};
