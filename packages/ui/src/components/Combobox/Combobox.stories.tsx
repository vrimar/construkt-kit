import preview from "@construkt-kit/story-kit/preview";

import { combobox } from "#styled-system/recipes";

import { Combobox, type ComboboxRootProps } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { useListCollection } from "../Listbox";

const meta = preview.meta({
  title: "Components/Combobox",
  tags: ["autodocs"],
});

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
  defaultOpen?: boolean;
}

function FrameworkCombobox({
  label = "Framework",
  placeholder = "Select a framework",
  size,
  defaultOpen,
}: FrameworkComboboxProps) {
  const { collection, filter } = useListCollection({
    initialItems: items,
    filter: (itemText, query) => itemText.toLowerCase().includes(query.trim().toLowerCase()),
  });

  return (
    <Combobox.Root
      collection={collection}
      size={size}
      defaultOpen={defaultOpen}
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
    </Combobox.Root>
  );
}

export const Default = meta.story({
  render: () => <FrameworkCombobox />,
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={combobox.variantMap.size}
      renderPreview={(size) => (
        <FrameworkCombobox
          placeholder="Select a framework..."
          size={size}
        />
      )}
    />
  ),
});

export const Phone = meta.story({
  ...Default.input,
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

export const Open = meta.story({
  tags: ["open-state"],
  // The phone sheet traps focus, so the trigger behind its aria-hidden page is unreachable.
  parameters: { a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } } },
  render: () => <FrameworkCombobox defaultOpen />,
});
