import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoadingOverlay } from ".";
import { Box, Wrap } from "../Layout";

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

export const Sizes: Story = {
  render: () => (
    <Wrap gap="3">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Box
          key={size}
          w="120px"
          h="80px"
          position="relative"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="md"
          overflow="hidden"
        >
          <LoadingOverlay
            isActive
            relative
            minHeight="80px"
            size={size}
            tip={size.toUpperCase()}
          />
        </Box>
      ))}
    </Wrap>
  ),
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
