import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Carousel } from ".";
import { Center, VStack } from "../Layout";

const meta: Meta = {
  title: "Components/Carousel",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Carousel.Root slideCount={5}>
      <Carousel.Control>
        <Carousel.PrevTrigger>
          <ChevronLeftIcon />
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <ChevronRightIcon />
        </Carousel.NextTrigger>
      </Carousel.Control>
      <Carousel.ItemGroup>
        {[1, 2, 3, 4, 5].map((i) => (
          <Carousel.Item
            key={i}
            index={i - 1}
          >
            <Center
              h="200px"
              bg="bg.subtle"
              borderRadius="lg"
              fontSize="2xl"
              fontWeight="bold"
            >
              Slide {i}
            </Center>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
      <Carousel.IndicatorGroup />
    </Carousel.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack
      gap="6"
      p="4"
      maxW="420px"
    >
      {(["md"] as const).map((size) => (
        <Carousel.Root
          key={size}
          slideCount={3}
          size={size}
        >
          <Carousel.Control>
            <Carousel.PrevTrigger>
              <ChevronLeftIcon />
            </Carousel.PrevTrigger>
            <Carousel.NextTrigger>
              <ChevronRightIcon />
            </Carousel.NextTrigger>
          </Carousel.Control>
          <Carousel.ItemGroup>
            {[1, 2, 3].map((i) => (
              <Carousel.Item
                key={i}
                index={i - 1}
              >
                <Center
                  h="200px"
                  bg="bg.subtle"
                  borderRadius="lg"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  {size.toUpperCase()} {i}
                </Center>
              </Carousel.Item>
            ))}
          </Carousel.ItemGroup>
          <Carousel.IndicatorGroup />
        </Carousel.Root>
      ))}
    </VStack>
  ),
};
