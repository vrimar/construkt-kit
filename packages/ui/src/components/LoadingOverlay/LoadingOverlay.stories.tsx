import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoadingOverlay } from ".";
import { Box } from "../Layout";

const meta: Meta<typeof LoadingOverlay> = {
  title: "Components/LoadingOverlay",
  component: LoadingOverlay,
  tags: ["autodocs"],
  decorators: [
    (Story: any) => (
      <Box
        w="400px"
        h="200px"
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

export const Active: Story = {
  args: {
    isActive: true,
    relative: true,
  },
};

export const WithCustomTip: Story = {
  args: {
    isActive: true,
    relative: true,
    tip: "Fetching data...",
  },
};

export const Inactive: Story = {
  args: {
    isActive: false,
    relative: true,
  },
};
