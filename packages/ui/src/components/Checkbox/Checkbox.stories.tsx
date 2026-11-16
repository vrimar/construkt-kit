import preview from "@construkt-kit/story-kit/preview";

import { checkbox } from "#styled-system/recipes";

import { Checkbox } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Wrap } from "../Layout";

const meta = preview.meta({
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
});

export const Default = meta.story({
  args: {
    children: "Accept terms",
  },
});

export const Checked = meta.story({
  args: {
    children: "I agree",
    defaultChecked: true,
  },
});

export const Disabled = meta.story({
  args: {
    children: "Disabled option",
    disabled: true,
  },
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={checkbox.variantMap.size}
      renderPreview={(size) => <Checkbox size={size}>{size}</Checkbox>}
    />
  ),
});

export const Variants = meta.story({
  render: () => (
    <Wrap gap="4">
      <Checkbox
        variant="solid"
        defaultChecked
      >
        Solid
      </Checkbox>
      <Checkbox
        variant="surface"
        defaultChecked
      >
        Surface
      </Checkbox>
      <Checkbox
        variant="subtle"
        defaultChecked
      >
        Subtle
      </Checkbox>
      <Checkbox
        variant="outline"
        defaultChecked
      >
        Outline
      </Checkbox>
      <Checkbox
        variant="plain"
        defaultChecked
      >
        Plain
      </Checkbox>
    </Wrap>
  ),
});

export const Indeterminate = meta.story({
  args: {
    children: "Indeterminate",
    checked: "indeterminate",
  },
});
