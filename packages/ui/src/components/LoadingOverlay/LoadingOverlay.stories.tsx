import type { Meta, StoryObj } from "@storybook/react-vite";

import { spinner } from "#styled-system/recipes";

import { LoadingOverlay } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const meta: Meta<typeof LoadingOverlay> = {
  title: "Components/LoadingOverlay",
  component: LoadingOverlay,
  tags: ["autodocs"],
  decorators: [
    (Story: any) => (
      <Box
        w="full"
        maxW="400px"
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
    <SizePreviewTable
      sizes={spinner.variantMap.size}
      renderPreview={(size) => (
        <Box
          w="120px"
          h="80px"
          position="relative"
          borderWidth="1px"
          borderColor="border"
          borderRadius="md"
          overflow="hidden"
        >
          <LoadingOverlay
            isActive
            relative
            minHeight="80px"
            size={size}
            tip="Loading..."
          />
        </Box>
      )}
    />
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
