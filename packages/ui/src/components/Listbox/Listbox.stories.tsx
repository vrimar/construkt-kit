import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";

import { Listbox, createListCollection } from ".";
import { IconButton } from "../Buttons";
import { Flex } from "../Layout";

const meta: Meta = {
  title: "Components/Listbox",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function ControlledListboxStory() {
  const [value, setValue] = useState<string[]>(["uk"]);

  return (
    <Listbox
      collection={countries}
      label="Select Country"
      value={value}
      onValueChange={(e) => setValue(e.value)}
      maxW="64"
    />
  );
}

const countries = createListCollection({
  items: [
    { label: "United States", value: "us" },
    { label: "United Kingdom", value: "uk" },
    { label: "Canada", value: "ca" },
    { label: "Australia", value: "au" },
    { label: "Germany", value: "de" },
    { label: "France", value: "fr" },
    { label: "Japan", value: "jp" },
  ],
});

// --- Simple API ---

export const Default: Story = {
  render: () => (
    <Listbox
      collection={countries}
      label="Select Country"
      maxW="64"
    />
  ),
};

const days = createListCollection({
  items: [
    { label: "Monday", value: "mon" },
    { label: "Tuesday", value: "tue" },
    { label: "Wednesday", value: "wed" },
    { label: "Thursday", value: "thu" },
    { label: "Friday", value: "fri" },
    { label: "Saturday", value: "sat" },
    { label: "Sunday", value: "sun" },
  ],
});

export const Multiple: Story = {
  render: () => (
    <Listbox
      collection={days}
      label="Select Days"
      selectionMode="multiple"
      maxW="64"
    />
  ),
};

const cities = createListCollection({
  items: [
    { label: "New York", value: "nyc", region: "North America" },
    { label: "Los Angeles", value: "lax", region: "North America" },
    { label: "Toronto", value: "yyz", region: "North America" },
    { label: "London", value: "lhr", region: "Europe" },
    { label: "Paris", value: "cdg", region: "Europe" },
    { label: "Berlin", value: "ber", region: "Europe" },
    { label: "Tokyo", value: "nrt", region: "Asia Pacific" },
    { label: "Singapore", value: "sin", region: "Asia Pacific" },
    { label: "Sydney", value: "syd", region: "Asia Pacific" },
  ],
  groupBy: (item) => item.region,
});

export const Grouped: Story = {
  render: () => (
    <Listbox
      collection={cities}
      label="Select City"
      maxW="64"
    />
  ),
};

export const Controlled: Story = {
  render: () => <ControlledListboxStory />,
};

export const WithActions: Story = {
  render: () => (
    <Listbox
      collection={countries}
      label="Select Country"
      maxW="64"
      renderActions={(item) => (
        <IconButton
          aria-label={`Open actions for ${item.label}`}
          size="2xs"
          variant="plain"
        >
          <MoreHorizontalIcon />
        </IconButton>
      )}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <Flex
      gap="10"
      align="flex-start"
      p="4"
    >
      {(["sm", "md", "lg"] as const).map((size) => (
        <Listbox
          key={size}
          collection={countries}
          label={size}
          size={size}
          maxW="64"
        />
      ))}
    </Flex>
  ),
};

// --- Primitive API (custom composition) ---

export const CustomItem: Story = {
  name: "Primitive API",
  render: () => (
    <Listbox.Root
      collection={countries}
      maxW="64"
    >
      <Listbox.Label>Select Country</Listbox.Label>
      <Listbox.Content>
        {countries.items.map((item) => (
          <Listbox.Item
            key={item.value}
            item={item}
          >
            <Listbox.ItemText>{item.label}</Listbox.ItemText>
            <Listbox.ItemIndicator />
          </Listbox.Item>
        ))}
      </Listbox.Content>
    </Listbox.Root>
  ),
};
