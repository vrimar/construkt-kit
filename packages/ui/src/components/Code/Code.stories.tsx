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
      {code.variantMap.variant.map((variant) => (
        <Code
          key={variant}
          variant={variant}
        >
          {variant}
        </Code>
      ))}
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
