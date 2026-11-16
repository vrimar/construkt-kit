import preview from "@construkt-kit/story-kit/preview";

import { checkboxCard } from "#styled-system/recipes";

import { CheckboxCard } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { VStack } from "../Layout";

const meta = preview.meta({
  title: "Components/CheckboxCard",
  component: CheckboxCard,
  tags: ["autodocs"],
});

export const Default = meta.story({
  args: {
    label: "Option A",
    description: "This is a description for option A.",
  },
});

export const Checked = meta.story({
  args: {
    label: "Selected Option",
    description: "This option is pre-selected.",
    defaultChecked: true,
  },
});

export const WithAddon = meta.story({
  args: {
    label: "Premium Plan",
    description: "Includes all features.",
    addon: "Recommended",
  },
});

export const Group = meta.story({
  render: () => (
    <VStack
      gap="3"
      maxW="400px"
    >
      <CheckboxCard
        label="Option 1"
        description="First option"
      />
      <CheckboxCard
        label="Option 2"
        description="Second option"
        defaultChecked
      />
      <CheckboxCard
        label="Option 3"
        description="Third option"
      />
    </VStack>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={checkboxCard.variantMap.size}
      renderPreview={(size) => (
        <CheckboxCard
          label={`Option (${size})`}
          description="Description text for this option."
          size={size}
        />
      )}
    />
  ),
});
