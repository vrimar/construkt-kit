import type { Meta, StoryObj } from "@storybook/react-vite";
import { StarIcon } from "lucide-react";
import { Icon } from ".";

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Icon fontSize="xl">⭐</Icon>
      <Icon fontSize="2xl">🔥</Icon>
      <Icon fontSize="3xl">🎉</Icon>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "16px" }}>
      {(["2xs", "xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Icon
          key={size}
          size={size}
        >
          <StarIcon />
        </Icon>
      ))}
    </div>
  ),
};
