import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from ".";
import { Button } from "../Buttons";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: "This is a tooltip",
    children: <Button>Hover me</Button>,
  },
};

export const WithArrow: Story = {
  args: {
    content: "Tooltip with arrow",
    showArrow: true,
    children: <Button variant="outline">With Arrow</Button>,
  },
};

export const Placements: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", padding: "60px" }}>
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Tooltip
          key={placement}
          content={`${placement} tooltip`}
          placement={placement}
        >
          <Button variant="outline">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};
