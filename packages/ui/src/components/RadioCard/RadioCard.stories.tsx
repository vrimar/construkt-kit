import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadioCard } from ".";
import { HStack } from "../Layout";

const meta: Meta = {
  title: "Components/RadioCard",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <RadioCard.Root
      defaultValue="option-1"
      maxW="400px"
    >
      <RadioCard.Label>Select a plan</RadioCard.Label>
      {[
        { value: "option-1", title: "Starter", description: "Best for small projects" },
        { value: "option-2", title: "Pro", description: "Best for growing teams" },
        { value: "option-3", title: "Enterprise", description: "Best for large organizations" },
      ].map((item) => (
        <RadioCard.Item
          key={item.value}
          value={item.value}
        >
          <RadioCard.ItemHiddenInput />
          <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
          <RadioCard.ItemControl />
        </RadioCard.Item>
      ))}
    </RadioCard.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack
      gap="6"
      alignItems="flex-start"
    >
      {(["md"] as const).map((size) => (
        <RadioCard.Root
          key={size}
          defaultValue="starter"
          maxW="280px"
          size={size}
        >
          <RadioCard.Label>{size.toUpperCase()} plan selection</RadioCard.Label>
          {[
            { value: "starter", title: "Starter" },
            { value: "pro", title: "Pro" },
          ].map((item) => (
            <RadioCard.Item
              key={item.value}
              value={item.value}
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
              <RadioCard.ItemControl />
            </RadioCard.Item>
          ))}
        </RadioCard.Root>
      ))}
    </HStack>
  ),
};
