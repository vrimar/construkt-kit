import type { Meta, StoryObj } from "@storybook/react-vite";

import { SegmentGroup } from ".";
import { VStack } from "../Layout";

const meta: Meta = {
  title: "Components/SegmentGroup",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <SegmentGroup.Root defaultValue="react">
      <SegmentGroup.Indicator />
      {["React", "Vue", "Angular"].map((item) => (
        <SegmentGroup.Item
          key={item}
          value={item.toLowerCase()}
        >
          <SegmentGroup.ItemText>{item}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SegmentGroup.Root
          key={size}
          defaultValue="a"
          size={size}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="a">
            <SegmentGroup.ItemText>Option A</SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
          <SegmentGroup.Item value="b">
            <SegmentGroup.ItemText>Option B</SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      ))}
    </VStack>
  ),
};
