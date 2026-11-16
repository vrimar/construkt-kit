import preview from "@construkt-kit/story-kit/preview";

import { code } from "#styled-system/recipes";

import { Code } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Wrap } from "../Layout";

const meta = preview.meta({
  title: "Components/Code",
  component: Code,
  tags: ["autodocs"],
  args: {
    children: "console.log('hello')",
  },
});

export const Default = meta.story();

export const Variants = meta.story({
  render: () => (
    <Wrap gap="2">
      <Code variant="solid">solid</Code>
      <Code variant="surface">surface</Code>
      <Code variant="subtle">subtle</Code>
      <Code variant="outline">outline</Code>
      <Code variant="plain">plain</Code>
    </Wrap>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={code.variantMap.size}
      renderPreview={(size) => <Code size={size}>{size}</Code>}
    />
  ),
});
