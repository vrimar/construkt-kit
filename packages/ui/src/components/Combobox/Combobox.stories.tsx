import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDownIcon, XIcon } from "lucide-react";

import { Combobox, createListCollection } from ".";
import { VStack } from "../Layout";

const meta: Meta = {
  title: "Components/Combobox",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const items = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Solid", value: "solid" },
];

const collection = createListCollection({ items });

export const Default: Story = {
  render: () => (
    <Combobox.Root collection={collection}>
      <Combobox.Label>Framework</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="Select a framework" />
        <Combobox.Trigger>
          <ChevronDownIcon />
        </Combobox.Trigger>
        <Combobox.ClearTrigger>
          <XIcon />
        </Combobox.ClearTrigger>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.List>
            {collection.items.map((item) => (
              <Combobox.Item
                key={item.value}
                item={item}
              >
                {item.label}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack
      gap="4"
      p="4"
      maxW="320px"
    >
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Combobox.Root
          key={size}
          collection={collection}
          size={size}
        >
          <Combobox.Label>{size}</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input placeholder="Select a framework..." />
            <Combobox.Trigger>
              <ChevronDownIcon />
            </Combobox.Trigger>
          </Combobox.Control>
        </Combobox.Root>
      ))}
    </VStack>
  ),
};
