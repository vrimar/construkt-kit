import { input } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SearchInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const meta: Meta<typeof SearchInput> = {
  title: "Components/Input/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  args: {
    placeholder: "Search...",
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: () => (
    <Box maxW="400px">
      <SearchInput placeholder="Search..." />
    </Box>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={input.variantMap.size}
      renderPreview={(size) => (
        <SearchInput
          size={size}
          value={`Query ${size}`}
          onChange={() => {}}
          onClear={() => {}}
          placeholder={`Search (${size})`}
        />
      )}
    />
  ),
};
