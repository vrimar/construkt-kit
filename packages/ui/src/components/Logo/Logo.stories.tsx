import type { Meta, StoryObj } from "@storybook/react-vite";

import { Logo } from ".";

const meta: Meta<typeof Logo> = {
  title: "Components/Logo",
  component: Logo,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {};

export const CustomSize: Story = {
  args: {
    width: 100,
  },
};

export const CustomColor: Story = {
  args: {
    color: "blue",
  },
};
