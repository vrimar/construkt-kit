import { switchRecipe } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoonIcon, SunIcon } from "lucide-react";

import { Switch } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

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
    <SizePreviewTable
      sizes={switchRecipe.variantMap.size}
      renderPreview={(size) => <Switch size={size}>{size}</Switch>}
    />
  ),
};

export const WithTrackLabel: Story = {
  args: {
    children: "Theme",
    trackLabel: { on: <MoonIcon />, off: <SunIcon /> },
  },
};
