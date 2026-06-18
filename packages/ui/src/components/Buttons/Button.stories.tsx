import { button } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";

import { Button } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { HStack, Stack, Wrap } from "../Layout";

const meta: Meta<typeof Button> = {
  title: "Components/Buttons/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const LoadingWithText: Story = {
  args: { loading: true, loadingText: "Saving…" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Variants: Story = {
  render: () => (
    <Wrap gap="2">
      <Button variant="solid">Solid</Button>
      <Button variant="surface">Surface</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="plain">Plain</Button>
    </Wrap>
  ),
};

export const Colors: Story = {
  render: () => (
    <Wrap gap="2">
      <Button>Neutral</Button>
      <Button colorPalette="brand">Brand</Button>
      <Button colorPalette="success">Success</Button>
      <Button colorPalette="danger">Danger</Button>
    </Wrap>
  ),
};

const COLORS = ["neutral", "brand", "success", "danger"] as const;
const VARIANTS = ["solid", "surface", "subtle", "outline", "plain"] as const;

export const ColorVariants: Story = {
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
};

export const Sizes: Story = {
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
};
