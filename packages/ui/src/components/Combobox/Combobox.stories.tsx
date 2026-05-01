import type { Meta, StoryObj } from "@storybook/react-vite";

import { Combobox, type ComboboxRootProps, useListCollection } from ".";
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

interface FrameworkComboboxProps {
  label?: string;
  placeholder?: string;
  size?: ComboboxRootProps["size"];
}

function FrameworkCombobox({
  label = "Framework",
  placeholder = "Select a framework",
  size,
}: FrameworkComboboxProps) {
  const { collection, filter } = useListCollection({
    initialItems: items,
    filter: (itemText, query) => itemText.toLowerCase().includes(query.trim().toLowerCase()),
  });

  return (
    <Combobox.Root
      collection={collection}
      size={size}
      onInputValueChange={({ inputValue, reason }) => {
        filter(reason === "input-change" ? inputValue : "");
      }}
    >
      <Combobox.Label>{label}</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder={placeholder} />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.Empty>No frameworks found.</Combobox.Empty>
          <Combobox.List>
            {collection.items.map((item) => (
              <Combobox.Item
                key={item.value}
                item={item}
              >
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
}

export const Default: Story = {
  render: () => <FrameworkCombobox />,
};

export const Sizes: Story = {
  render: () => (
    <VStack
      gap="4"
      p="4"
      maxW="320px"
    >
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <FrameworkCombobox
          key={size}
          label={size}
          placeholder="Select a framework..."
          size={size}
        />
      ))}
    </VStack>
  ),
};
