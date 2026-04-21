import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton, SkeletonCircle, SkeletonText } from ".";
import { Box, Flex, HStack, VStack } from "../Layout";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <VStack
      gap="2"
      maxW="400px"
    >
      <Skeleton height="20px" />
      <Skeleton height="20px" />
      <Skeleton
        height="20px"
        width="80%"
      />
    </VStack>
  ),
};

export const Circle: Story = {
  render: () => (
    <HStack gap="4">
      <SkeletonCircle
        width="10"
        height="10"
      />
      <SkeletonCircle
        width="14"
        height="14"
      />
      <SkeletonCircle
        width="20"
        height="20"
      />
    </HStack>
  ),
};

export const Text: Story = {
  render: () => (
    <Box maxW="400px">
      <SkeletonText noOfLines={4} />
    </Box>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <Flex
      gap="4"
      align="flex-start"
      maxW="400px"
    >
      <SkeletonCircle
        width="10"
        height="10"
      />
      <Box flex="1">
        <SkeletonText noOfLines={3} />
      </Box>
    </Flex>
  ),
};
