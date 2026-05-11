import { scrollArea } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";

import { ScrollArea } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box, Flex } from "../Layout";
import { Text } from "../Text";

const meta: Meta<typeof ScrollArea> = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

type FadeEdgesPosition = "initial" | "middle" | "bottom";

const fadeEdgesLines = Array.from({ length: 24 }, (_, i) => `Scrollable content line ${i + 1}`);

function FadeEdgesPreview({ position }: { position: FadeEdgesPosition }) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const animationFrame = requestAnimationFrame(() => {
      const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      viewport.scrollTop =
        position === "middle" ? maxScrollTop / 2 : position === "bottom" ? maxScrollTop : 0;
      viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [position]);

  return (
    <Box>
      <Text
        mb="2"
        fontWeight="medium"
        textTransform="capitalize"
      >
        {position}
      </Text>
      <ScrollArea
        ref={viewportRef}
        fadeEdges
        height="180px"
        width="320px"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
      >
        <Box p="2">
          {fadeEdgesLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Box>
      </ScrollArea>
    </Box>
  );
}

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
    <SizePreviewTable
      sizes={scrollArea.variantMap.size}
      renderPreview={(size) => (
        <ScrollArea
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
      )}
    />
  ),
};

export const FadeEdges: Story = {
  render: () => (
    <Flex
      gap="6"
      p="0"
      align="flex-start"
      flexWrap="wrap"
    >
      {(["initial", "middle", "bottom"] as const).map((position) => (
        <FadeEdgesPreview
          key={position}
          position={position}
        />
      ))}
    </Flex>
  ),
};
