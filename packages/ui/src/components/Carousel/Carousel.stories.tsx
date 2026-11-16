import preview from "@construkt-kit/story-kit/preview";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { carousel } from "#styled-system/recipes";

import { Carousel } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Center } from "../Layout";

const meta = preview.meta({
  title: "Components/Carousel",
  tags: ["autodocs"],
});

export const Default = meta.story({
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
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={carousel.variantMap.size}
      renderPreview={(size) => (
        <Carousel.Root
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
      )}
    />
  ),
});
