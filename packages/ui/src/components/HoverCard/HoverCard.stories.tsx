import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard } from ".";
import { Button } from "../Buttons";

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
      <HoverCard.Positioner>
        <HoverCard.Content>
          <HoverCard.Arrow>
            <HoverCard.ArrowTip />
          </HoverCard.Arrow>
          <div style={{ padding: "16px" }}>
            <strong>Hover Card Content</strong>
            <p>This card appears on hover.</p>
          </div>
        </HoverCard.Content>
      </HoverCard.Positioner>
    </HoverCard.Root>
  ),
};
