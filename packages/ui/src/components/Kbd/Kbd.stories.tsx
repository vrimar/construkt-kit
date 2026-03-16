import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from ".";

const meta: Meta<typeof Kbd> = {
  title: "Components/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  args: {
    children: "⌘",
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {};

export const Combinations: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Kbd>⌘</Kbd>+<Kbd>C</Kbd>
      <span style={{ marginLeft: 16 }}>
        <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+<Kbd>P</Kbd>
      </span>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Kbd size="sm">sm</Kbd>
      <Kbd size="md">md</Kbd>
      <Kbd size="lg">lg</Kbd>
    </div>
  ),
};
