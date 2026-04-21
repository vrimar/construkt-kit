import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea } from ".";
import { Box, Flex } from "../Layout";
import { Text } from "../Text";

const meta: Meta<typeof ScrollArea> = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea
      height="200px"
      width="300px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      <Box p="4">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>Scrollable content line {i + 1}</p>
        ))}
      </Box>
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea
      height="100px"
      width="300px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      <Box
        p="4"
        whiteSpace="nowrap"
        w="800px"
      >
        This is a very long line of text that will cause horizontal scrolling to demonstrate the
        horizontal scroll area functionality.
      </Box>
    </ScrollArea>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Flex
      gap="6"
      p="4"
      align="flex-start"
    >
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <ScrollArea
          key={size}
          height="150px"
          width="200px"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
          size={size}
        >
          <Box p="2">
            <Text
              mb="1"
              fontWeight="bold"
            >
              {size}
            </Text>
            {Array.from({ length: 10 }, (_, i) => (
              <p key={i}>Line {i + 1}</p>
            ))}
          </Box>
        </ScrollArea>
      ))}
    </Flex>
  ),
};
