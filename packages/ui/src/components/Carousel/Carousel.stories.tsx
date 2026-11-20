import preview from "@construkt-kit/story-kit/preview";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import { fn } from "storybook/test";

import { carousel } from "#styled-system/recipes";

import { Carousel } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Center } from "../Layout";

const meta = preview.meta({
  title: "Components/Carousel",
  tags: ["autodocs"],
});

const slides = (labels: string[]) =>
  labels.map((label, index) => (
    <Carousel.Item
      key={label}
      index={index}
    >
      <Center
        h="200px"
        bg="bg.subtle"
        borderRadius="lg"
        fontSize="2xl"
        fontWeight="bold"
      >
        {label}
      </Center>
    </Carousel.Item>
  ));

const fiveSlides = [1, 2, 3, 4, 5].map((i) => `Slide ${i}`);

export const Default = meta.story({
  args: { onValueChange: fn() },
  render: ({ onValueChange }) => (
    <Carousel.Root
      slideCount={5}
      onValueChange={onValueChange}
    >
      <Carousel.Control>
        <Carousel.PrevTrigger>
          <ChevronLeftIcon />
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <ChevronRightIcon />
        </Carousel.NextTrigger>
      </Carousel.Control>
      <Carousel.ItemGroup>{slides(fiveSlides)}</Carousel.ItemGroup>
      <Carousel.IndicatorGroup />
    </Carousel.Root>
  ),
});

export const Vertical = meta.story({
  render: () => (
    <Carousel.Root
      slideCount={5}
      orientation="vertical"
      loop
    >
      <Carousel.Control>
        <Carousel.PrevTrigger>
          <ChevronUpIcon />
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <ChevronDownIcon />
        </Carousel.NextTrigger>
      </Carousel.Control>
      <Carousel.ItemGroup h="200px">{slides(fiveSlides)}</Carousel.ItemGroup>
      <Carousel.IndicatorGroup />
    </Carousel.Root>
  ),
});

export const Autoplay = meta.story({
  render: () => (
    <Carousel.Root
      slideCount={5}
      loop
      allowMouseDrag
    >
      <Carousel.Control>
        <Carousel.PrevTrigger>
          <ChevronLeftIcon />
        </Carousel.PrevTrigger>
        <Carousel.AutoplayTrigger
          render={(props, { playing }) => (
            <button {...props}>{playing ? <PauseIcon /> : <PlayIcon />}</button>
          )}
        />
        <Carousel.NextTrigger>
          <ChevronRightIcon />
        </Carousel.NextTrigger>
      </Carousel.Control>
      <Carousel.ItemGroup>{slides(fiveSlides)}</Carousel.ItemGroup>
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
            {slides([1, 2, 3].map((i) => `${size.toUpperCase()} ${i}`))}
          </Carousel.ItemGroup>
          <Carousel.IndicatorGroup />
        </Carousel.Root>
      )}
    />
  ),
});
