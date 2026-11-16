import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { TagSelect } from ".";
import { Box } from "../Layout";

const colors = [
  { id: 1, name: "Red" },
  { id: 2, name: "Green" },
  { id: 3, name: "Blue" },
  { id: 4, name: "Yellow" },
];

const meta = preview.meta({
  title: "Components/TagSelect",
  component: TagSelect,
  decorators: [
    (Story) => (
      <Box
        w="full"
        maxW="320px"
      >
        <Story />
      </Box>
    ),
  ],
});

export const Default = meta.story({
  render: function DefaultStory() {
    const [value, setValue] = useState<number[]>([1]);
    return (
      <TagSelect
        items={colors}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        placeholder="Pick colors"
      />
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
    const [value, setValue] = useState<number[]>([1, 3]);
    return (
      <TagSelect
        defaultOpen
        items={colors}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        placeholder="Pick colors"
      />
    );
  },
});
