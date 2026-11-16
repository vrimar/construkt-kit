import preview from "@construkt-kit/story-kit/preview";

import { slider } from "#styled-system/recipes";

import { Slider } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta = preview.meta({
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
});

export const Default = meta.story({
  args: {
    label: "Volume",
    defaultValue: [50],
    min: 0,
    max: 100,
    width: "300px",
  },
});

export const Range = meta.story({
  args: {
    label: "Price range",
    defaultValue: [25, 75],
    min: 0,
    max: 100,
    width: "300px",
  },
});

export const LabelledMarks = meta.story({
  args: {
    label: "Decimals",
    defaultValue: [1],
    min: 0,
    max: 2,
    step: 1,
    marks: [
      { value: 0, label: "0" },
      { value: 1, label: "1" },
      { value: 2, label: "2" },
    ],
    width: "300px",
  },
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={slider.variantMap.size}
      renderPreview={(size) => (
        <Slider
          label="Volume"
          defaultValue={[50]}
          size={size}
          width="200px"
        />
      )}
    />
  ),
});
