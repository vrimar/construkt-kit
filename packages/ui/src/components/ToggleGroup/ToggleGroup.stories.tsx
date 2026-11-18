import preview from "@construkt-kit/story-kit/preview";

import { toggleGroup } from "#styled-system/recipes";

import { ToggleGroup } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Stack } from "../Layout";

const meta = preview.meta({
  title: "Components/ToggleGroup",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <ToggleGroup.Root
      defaultValue={["bold"]}
      multiple
    >
      <ToggleGroup.Item
        value="bold"
        aria-label="Bold"
      >
        <strong>B</strong>
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="italic"
        aria-label="Italic"
      >
        <em>I</em>
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="underline"
        aria-label="Underline"
      >
        <u>U</u>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  ),
});

export const Single = meta.story({
  render: () => (
    <ToggleGroup.Root
      defaultValue={["left"]}
      multiple={false}
    >
      <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
      <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
    </ToggleGroup.Root>
  ),
});

export const Variants = meta.story({
  render: () => (
    <Stack
      gap="4"
      alignItems="flex-start"
    >
      {toggleGroup.variantMap.variant.map((variant) => (
        <ToggleGroup.Root
          key={variant}
          defaultValue={["bold", "italic"]}
          multiple
          variant={variant}
        >
          <ToggleGroup.Item
            value="bold"
            aria-label="Bold"
          >
            <strong>B</strong>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="italic"
            aria-label="Italic"
          >
            <em>I</em>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="underline"
            aria-label="Underline"
          >
            <u>U</u>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="strikethrough"
            aria-label="Strikethrough"
          >
            <s>S</s>
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      ))}
    </Stack>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={toggleGroup.variantMap.size}
      renderPreview={(size) => (
        <ToggleGroup.Root
          defaultValue={["a"]}
          multiple
          size={size}
        >
          <ToggleGroup.Item value="a">A</ToggleGroup.Item>
          <ToggleGroup.Item value="b">B</ToggleGroup.Item>
          <ToggleGroup.Item value="c">C</ToggleGroup.Item>
        </ToggleGroup.Root>
      )}
    />
  ),
});
