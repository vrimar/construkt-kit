import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import {
  AspectRatio,
  Box,
  Center,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  Separator,
  SimpleGrid,
  ScaleToFit,
  Spacer,
  Stack,
  VStack,
} from ".";

const meta = preview.meta({
  title: "Components/Layout",
  tags: ["autodocs"],
});

const boxStyle = {
  bg: "bg.subtle",
  p: "4",
  borderRadius: "md",
  border: "1px solid",
  borderColor: "border",
};

export const StackStory = meta.story({
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
});

export const HStackStory = meta.story({
  name: "HStack",
  render: () => (
    <HStack gap="4">
      <Box {...boxStyle}>Item 1</Box>
      <Box {...boxStyle}>Item 2</Box>
      <Box {...boxStyle}>Item 3</Box>
    </HStack>
  ),
});

export const VStackStory = meta.story({
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
});

export const FlexStory = meta.story({
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
});

export const CenterStory = meta.story({
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
});

export const GridStory = meta.story({
  name: "Grid",
  render: () => (
    <Grid
      columns={{ base: 1, sm: 2, md: 3 }}
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
});

const SimpleGridDemo = () => {
  const [columns, setColumns] = useState(3);
  return (
    <Stack gap="8">
      <Stack gap="2">
        <Box textStyle="sm">{"Static — columns={3}"}</Box>
        <SimpleGrid
          columns={3}
          gap="4"
        >
          <Box {...boxStyle}>1</Box>
          <Box {...boxStyle}>2</Box>
          <Box {...boxStyle}>3</Box>
        </SimpleGrid>
      </Stack>

      <Stack gap="2">
        <Box textStyle="sm">{"Responsive — columns={{ base: 2, md: 3 }}"}</Box>
        <SimpleGrid
          columns={{ base: 2, md: 3 }}
          gap="4"
        >
          <Box {...boxStyle}>1</Box>
          <Box {...boxStyle}>2</Box>
          <Box {...boxStyle}>3</Box>
          <Box {...boxStyle}>4</Box>
          <Box {...boxStyle}>5</Box>
          <Box {...boxStyle}>6</Box>
        </SimpleGrid>
      </Stack>

      <Stack gap="2">
        <HStack gap="2">
          <Box textStyle="sm">{"Runtime — columns={n}"}</Box>
          <button
            type="button"
            onClick={() => setColumns((c) => (c % 4) + 1)}
          >
            columns: {columns} (click)
          </button>
        </HStack>
        <SimpleGrid
          columns={columns}
          gap="4"
        >
          <Box {...boxStyle}>1</Box>
          <Box {...boxStyle}>2</Box>
          <Box {...boxStyle}>3</Box>
          <Box {...boxStyle}>4</Box>
        </SimpleGrid>
      </Stack>

      <Stack gap="2">
        <Box textStyle="sm">{'Auto-fit — minChildWidth="12rem"'}</Box>
        <SimpleGrid
          minChildWidth="12rem"
          gap="4"
        >
          <Box {...boxStyle}>1</Box>
          <Box {...boxStyle}>2</Box>
          <Box {...boxStyle}>3</Box>
          <Box {...boxStyle}>4</Box>
        </SimpleGrid>
      </Stack>
    </Stack>
  );
};

export const SimpleGridStory = meta.story({
  name: "SimpleGrid",
  render: () => <SimpleGridDemo />,
});

export const ContainerStory = meta.story({
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
});

export const SeparatorStory = meta.story({
  name: "Separator",
  render: () => (
    <Stack
      gap="4"
      maxW="400px"
    >
      <Box>Above separator</Box>
      <Separator />
      <Box>Below separator</Box>
    </Stack>
  ),
});

export const SpacerStory = meta.story({
  name: "Spacer",
  render: () => (
    <Flex>
      <Box {...boxStyle}>Left</Box>
      <Spacer />
      <Box {...boxStyle}>Right</Box>
    </Flex>
  ),
});

export const AspectRatioStory = meta.story({
  name: "AspectRatio",
  render: () => (
    <Box maxW="400px">
      <AspectRatio
        ratio={16 / 9}
        bg="bg.muted"
        borderRadius="md"
      >
        <Box>16 / 9</Box>
      </AspectRatio>
    </Box>
  ),
});

const Canvas = () => (
  <Stack
    w="full"
    h="full"
    gap="4"
    px="16"
    py="12"
    bg="bg"
  >
    <Box
      textStyle="lg"
      color="fg.muted"
    >
      Q3 · Product update
    </Box>
    <Box
      textStyle="4xl"
      fontWeight="semibold"
    >
      Sign-ups grew every month
    </Box>
    <Box
      flex="1"
      bg="bg.muted"
      borderRadius="md"
    />
  </Stack>
);

export const ScaleToFitStory = meta.story({
  name: "ScaleToFit",
  render: () => (
    <Stack gap="4">
      <Box
        textStyle="sm"
        color="fg.muted"
      >
        A 960 × 540 canvas scaled to each box; the last box sets its own height and letterboxes.
      </Box>
      <HStack
        gap="4"
        alignItems="flex-start"
      >
        <Box
          w="160px"
          borderWidth="1px"
          borderColor="border"
        >
          <ScaleToFit
            designWidth={960}
            designHeight={540}
          >
            <Canvas />
          </ScaleToFit>
        </Box>
        <Box
          w="320px"
          borderWidth="1px"
          borderColor="border"
        >
          <ScaleToFit
            designWidth={960}
            designHeight={540}
          >
            <Canvas />
          </ScaleToFit>
        </Box>
        <ScaleToFit
          designWidth={960}
          designHeight={540}
          w="240px"
          h="240px"
          bg="bg.muted"
        >
          <Canvas />
        </ScaleToFit>
      </HStack>
    </Stack>
  ),
});
