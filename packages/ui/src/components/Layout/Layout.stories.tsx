import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Box,
  Center,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  Spacer,
  Stack,
  VStack,
} from ".";

const meta: Meta = {
  title: "Components/Layout",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const boxStyle = {
  bg: "bg.subtle",
  p: "4",
  borderRadius: "md",
  border: "1px solid",
  borderColor: "border",
};

export const StackStory: Story = {
  name: "Stack",
  render: () => (
    <Stack
      gap="4"
      maxW="400px"
    >
      <Box {...boxStyle}>Item 1</Box>
      <Box {...boxStyle}>Item 2</Box>
      <Box {...boxStyle}>Item 3</Box>
    </Stack>
  ),
};

export const HStackStory: Story = {
  name: "HStack",
  render: () => (
    <HStack gap="4">
      <Box {...boxStyle}>Item 1</Box>
      <Box {...boxStyle}>Item 2</Box>
      <Box {...boxStyle}>Item 3</Box>
    </HStack>
  ),
};

export const VStackStory: Story = {
  name: "VStack",
  render: () => (
    <VStack
      gap="4"
      maxW="400px"
    >
      <Box {...boxStyle}>Item 1</Box>
      <Box {...boxStyle}>Item 2</Box>
      <Box {...boxStyle}>Item 3</Box>
    </VStack>
  ),
};

export const FlexStory: Story = {
  name: "Flex",
  render: () => (
    <Flex
      gap="4"
      wrap="wrap"
    >
      <Box
        {...boxStyle}
        flex="1"
        minW="100px"
      >
        Flex 1
      </Box>
      <Box
        {...boxStyle}
        flex="2"
        minW="100px"
      >
        Flex 2
      </Box>
      <Box
        {...boxStyle}
        flex="1"
        minW="100px"
      >
        Flex 3
      </Box>
    </Flex>
  ),
};

export const CenterStory: Story = {
  name: "Center",
  render: () => (
    <Center
      h="200px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      Centered content
    </Center>
  ),
};

export const GridStory: Story = {
  name: "Grid",
  render: () => (
    <Grid
      columns={3}
      gap="4"
    >
      <GridItem {...boxStyle}>Cell 1</GridItem>
      <GridItem {...boxStyle}>Cell 2</GridItem>
      <GridItem {...boxStyle}>Cell 3</GridItem>
      <GridItem
        {...boxStyle}
        colSpan={2}
      >
        Span 2
      </GridItem>
      <GridItem {...boxStyle}>Cell 5</GridItem>
    </Grid>
  ),
};

export const ContainerStory: Story = {
  name: "Container",
  render: () => (
    <Container
      maxW="600px"
      border="1px dashed"
      borderColor="border"
      p="4"
    >
      Container with max width
    </Container>
  ),
};

export const DividerStory: Story = {
  name: "Divider",
  render: () => (
    <Stack
      gap="4"
      maxW="400px"
    >
      <Box>Above divider</Box>
      <Divider />
      <Box>Below divider</Box>
    </Stack>
  ),
};

export const SpacerStory: Story = {
  name: "Spacer",
  render: () => (
    <Flex>
      <Box {...boxStyle}>Left</Box>
      <Spacer />
      <Box {...boxStyle}>Right</Box>
    </Flex>
  ),
};
