import preview from "@construkt-kit/story-kit/preview";

import { segmentGroup } from "#styled-system/recipes";

import { SegmentGroup } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Stack } from "../Layout";

const meta = preview.meta({
  title: "Components/SegmentGroup",
  tags: ["autodocs"],
});

export const Default = meta.story({
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
});

export const Variants = meta.story({
  render: () => (
    <Stack
      gap="4"
      alignItems="flex-start"
    >
      {segmentGroup.variantMap.variant.map((variant) => (
        <SegmentGroup.Root
          key={variant}
          defaultValue="vue"
          variant={variant}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items
            items={[
              { value: "react", label: "React" },
              { value: "vue", label: "Vue" },
              { value: "angular", label: "Angular" },
              { value: "svelte", label: "Svelte" },
            ]}
          />
        </SegmentGroup.Root>
      ))}
    </Stack>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={segmentGroup.variantMap.size}
      renderPreview={(size) => (
        <SegmentGroup.Root
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
      )}
    />
  ),
});
