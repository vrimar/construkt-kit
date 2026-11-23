import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { combobox } from "#styled-system/recipes";

import { Combobox, type ComboboxRootProps } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { Dialog } from "../Dialog";

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
  const [query, setQuery] = useState("");
  const shown = items.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Combobox.Root
      items={shown}
      getItemValue={(item) => item.value}
      getItemLabel={(item) => item.label}
      size={size}
      defaultOpen={defaultOpen}
      onInputValueChange={(inputValue, { reason }) => {
        setQuery(reason === "input-change" ? inputValue : "");
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
          {shown.map((item) => (
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
  render: () => <FrameworkCombobox defaultOpen />,
});

export const InDialog = meta.story({
  tags: ["open-state"],
  render: () => (
    <Dialog.Root
      defaultOpen
      title="Edit project"
    >
      <Dialog.Trigger render={<Button />}>Edit project</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Body>
          <FrameworkCombobox />
        </Dialog.Body>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  ),
});
