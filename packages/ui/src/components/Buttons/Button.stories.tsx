import preview from "@construkt-kit/story-kit/preview";
import { Trash2 } from "lucide-react";

import { button } from "#styled-system/recipes";

import { Button, TooltipIconButton } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { HStack, Stack, Wrap } from "../Layout";
import { Tooltip } from "../Tooltip";

const meta = preview.meta({
  title: "Components/Buttons/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
});

export const Default = meta.story();

export const Loading = meta.story({
  args: { loading: true },
});

export const LoadingWithText = meta.story({
  args: { loading: true, loadingText: "Saving…" },
});

export const Disabled = meta.story({
  args: { disabled: true },
});

export const DisabledWithReason = meta.story({
  render: () => (
    <HStack gap="2">
      <Tooltip label="Only owners can publish">
        <Button
          disabled
          focusableWhenDisabled
        >
          Publish
        </Button>
      </Tooltip>
      <TooltipIconButton
        variant="outline"
        label="Delete (needs edit access)"
        disabled
        focusableWhenDisabled
      >
        <Trash2 />
      </TooltipIconButton>
    </HStack>
  ),
});

export const Variants = meta.story({
  render: () => (
    <Wrap gap="2">
      <Button variant="solid">Solid</Button>
      <Button variant="surface">Surface</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="plain">Plain</Button>
    </Wrap>
  ),
});

export const Colors = meta.story({
  render: () => (
    <Wrap gap="2">
      <Button>Neutral</Button>
      <Button colorPalette="brand">Brand</Button>
      <Button colorPalette="success">Success</Button>
      <Button colorPalette="danger">Danger</Button>
    </Wrap>
  ),
});

const COLORS = ["neutral", "brand", "success", "danger"] as const;
const VARIANTS = ["solid", "surface", "subtle", "outline", "plain"] as const;

export const ColorVariants = meta.story({
  render: () => (
    <Stack gap="2">
      {COLORS.map((colorPalette) => (
        <Wrap
          key={colorPalette}
          gap="2"
        >
          {VARIANTS.map((variant) => (
            <Button
              key={variant}
              colorPalette={colorPalette}
              variant={variant}
            >
              {colorPalette}
            </Button>
          ))}
        </Wrap>
      ))}
    </Stack>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={button.variantMap.size}
      renderPreview={(size) => (
        <HStack>
          <Button size={size}>Label</Button>
          <Button
            size={size}
            leftIcon={<Trash2 />}
          >
            Label
          </Button>
        </HStack>
      )}
    />
  ),
});
