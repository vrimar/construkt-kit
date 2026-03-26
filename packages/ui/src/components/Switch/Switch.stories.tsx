import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoonIcon, SunIcon } from "lucide-react";
import { Switch } from ".";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    children: "Enable notifications",
  },
};

export const Checked: Story = {
  args: {
    children: "Active",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Unavailable",
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Switch size="sm">Small</Switch>
      <Switch size="md">Medium</Switch>
      <Switch size="lg">Large</Switch>
    </div>
  ),
};

export const WithTrackLabel: Story = {
  args: {
    children: "Theme",
    trackLabel: { on: <MoonIcon />, off: <SunIcon /> },
  },
};
