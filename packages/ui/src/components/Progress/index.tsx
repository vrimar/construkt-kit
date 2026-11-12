import { Progress as ArkProgress, useProgressContext } from "@ark-ui/react/progress";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { progress } from "#styled-system/recipes";

const { withProvider, withContext } = createSlotRecipeContext(progress);

const Root = withProvider(ArkProgress.Root, "root");
const RootProvider = withProvider(ArkProgress.RootProvider, "root");
const Circle = withContext(ArkProgress.Circle, "circle");
const CircleRange = withContext(ArkProgress.CircleRange, "circleRange");
const CircleTrack = withContext(ArkProgress.CircleTrack, "circleTrack");
const Label = withContext(ArkProgress.Label, "label");
const Range = withContext(ArkProgress.Range, "range");
const Track = withContext(ArkProgress.Track, "track");
const ValueText = withContext(ArkProgress.ValueText, "valueText");
const View = withContext(ArkProgress.View, "view");
const SegmentsTrack = withContext(ArkProgress.Track, "segments");
const Segment = withContext("span", "segment");

export type ProgressRootProps = ComponentProps<typeof Root>;

export type ProgressSegmentsProps = Omit<ComponentProps<typeof SegmentsTrack>, "children">;

/** A track split into one segment per step from `min` to `max`, with the first `value - min` filled. */
function Segments(props: ProgressSegmentsProps) {
  const { value, min, max } = useProgressContext();
  const filled = value == null ? 0 : value - min;

  return (
    <SegmentsTrack {...props}>
      {Array.from({ length: Math.max(0, max - min) }, (_, index) => (
        <Segment
          key={index}
          data-filled={index < filled ? "" : undefined}
        />
      ))}
    </SegmentsTrack>
  );
}

export const Progress = {
  Root,
  RootProvider,
  Circle,
  CircleRange,
  CircleTrack,
  Label,
  Range,
  Segments,
  Track,
  ValueText,
  View,
};
