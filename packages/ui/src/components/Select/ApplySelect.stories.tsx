import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { ApplySelect } from ".";
import { fieldWidthDecorator } from "../../_shared/fieldWidthDecorator";

const frameworks = [
  { id: 1, name: "React" },
  { id: 2, name: "Vue" },
  { id: 3, name: "Angular" },
  { id: 4, name: "Svelte" },
];

const meta = preview.meta({
  title: "Components/ApplySelect",
  component: ApplySelect,
  decorators: [fieldWidthDecorator],
});

export const Default = meta.story({
  render: function DefaultStory() {
    const [value, setValue] = useState<number[]>([]);
    return (
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        placeholder="Select frameworks"
        actions={{ toggleAll: true }}
      />
    );
  },
});

export const CustomRendering = meta.story({
  render: function CustomRenderingStory() {
    const [value, setValue] = useState<number[]>([1]);
    return (
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        renderItem={(item, state) => (
          <span>
            {item.name} {state.selected ? "✓" : ""}
          </span>
        )}
        search={{ placeholder: "Find framework" }}
      />
    );
  },
});

export const Compound = meta.story({
  render: function CompoundStory() {
    const [value, setValue] = useState<number[]>([]);
    return (
      <ApplySelect.Root
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        search
      >
        <ApplySelect.Trigger />
        <ApplySelect.Content>
          <ApplySelect.Search />
          <ApplySelect.List />
          <ApplySelect.Actions toggleAll />
        </ApplySelect.Content>
      </ApplySelect.Root>
    );
  },
});

export const Phone = meta.story({
  ...Default.input,
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

export const Open = meta.story({
  tags: ["open-state"],
  render: function OpenStory() {
    const [value, setValue] = useState<number[]>([1, 4]);
    return (
      <ApplySelect
        defaultOpen
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        placeholder="Select frameworks"
        actions={{ toggleAll: true }}
      />
    );
  },
});
