import type { Meta, StoryObj } from "@storybook/react-vite";

import { VirtualScrollArea } from ".";
import { Box } from "../Layout";
import { Text } from "../Text";

const meta: Meta<typeof VirtualScrollArea> = {
  title: "Components/VirtualScrollArea",
  component: VirtualScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof VirtualScrollArea>;

const ITEMS = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);

export const Default: Story = {
  render: () => (
    <VirtualScrollArea
      items={ITEMS}
      itemHeight={40}
      height="320px"
      width="320px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      {(item) => (
        <Box
          px="3"
          height="40px"
          display="flex"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="border"
        >
          <Text>{item}</Text>
        </Box>
      )}
    </VirtualScrollArea>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <VirtualScrollArea
      items={ITEMS}
      itemHeight={40}
      height="320px"
      width="320px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      header={
        <Box
          px="3"
          py="2"
          bg="bg.subtle"
          borderBottom="1px solid"
          borderColor="border"
          position="sticky"
          top="0"
        >
          <Text fontWeight="semibold">1 000 items</Text>
        </Box>
      }
    >
      {(item) => (
        <Box
          px="3"
          height="40px"
          display="flex"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="border"
        >
          <Text>{item}</Text>
        </Box>
      )}
    </VirtualScrollArea>
  ),
};

const VARIABLE_ITEMS = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  label: `Item ${i + 1}`,
  description: i % 3 === 0 ? "This item has extra detail text that makes it taller." : undefined,
}));

export const VariableHeight: Story = {
  render: () => (
    <VirtualScrollArea
      items={VARIABLE_ITEMS}
      itemHeight={(index) => (index % 3 === 0 ? 64 : 40)}
      measure
      height="320px"
      width="320px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
      fadeEdges
    >
      {(item) => (
        <Box
          px="3"
          py="2"
          borderBottom="1px solid"
          borderColor="border"
          display="flex"
          flexDirection="column"
          gap="1"
        >
          <Text fontWeight="medium">{item.label}</Text>
          {item.description && (
            <Text
              fontSize="sm"
              color="fg.muted"
            >
              {item.description}
            </Text>
          )}
        </Box>
      )}
    </VirtualScrollArea>
  ),
};
