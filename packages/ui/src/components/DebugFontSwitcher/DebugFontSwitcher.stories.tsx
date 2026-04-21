import type { Meta, StoryObj } from "@storybook/react-vite";

import { DebugFontSwitcher } from ".";

const meta: Meta<typeof DebugFontSwitcher> = {
  title: "Components/DebugFontSwitcher",
  component: DebugFontSwitcher,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DebugFontSwitcher>;

export const Default: Story = {};
