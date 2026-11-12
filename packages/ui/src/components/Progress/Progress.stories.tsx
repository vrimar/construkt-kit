import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { progress } from "#styled-system/recipes";

import { Progress } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { HStack, Stack } from "../Layout";
const meta: Meta = {
  title: "Components/Progress",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Linear: Story = {
  render: () => (
    <Progress.Root
      value={65}
      maxW="400px"
    >
      <Progress.Label>Upload progress</Progress.Label>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
      <Progress.ValueText />
    </Progress.Root>
  ),
};

export const Circular: Story = {
  render: () => (
    <Progress.Root
      value={75}
      maxW="200px"
    >
      <Progress.Circle>
        <Progress.CircleTrack />
        <Progress.CircleRange />
      </Progress.Circle>
      <Progress.ValueText />
    </Progress.Root>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <Progress.Root
      value={null}
      maxW="400px"
    >
      <Progress.Label>Loading...</Progress.Label>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={progress.variantMap.size}
      renderPreview={(size) => (
        <Progress.Root
          value={65}
          size={size}
        >
          <Progress.Label>Progress</Progress.Label>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      )}
    />
  ),
};

export const Segmented: Story = {
  render: function SegmentedStory() {
    const total = 8;
    const [step, setStep] = useState(3);

    return (
      <Stack
        gap="3"
        maxW="400px"
      >
        <Progress.Root
          value={step}
          min={0}
          max={total}
          size="xs"
          shape="square"
        >
          <Progress.Label>
            Step {step} / {total}
          </Progress.Label>
          <Progress.Segments />
        </Progress.Root>
        <HStack gap="2">
          <Button
            size="sm"
            variant="outline"
            disabled={step <= 1}
            onClick={() => setStep((n) => n - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            disabled={step >= total}
            onClick={() => setStep((n) => n + 1)}
          >
            Next
          </Button>
        </HStack>
      </Stack>
    );
  },
};

export const SegmentedVariants: Story = {
  render: () => (
    <SizePreviewTable
      sizes={progress.variantMap.variant}
      renderPreview={(variant) => (
        <Progress.Root
          value={3}
          max={5}
          variant={variant}
        >
          <Progress.Segments />
        </Progress.Root>
      )}
    />
  ),
};
