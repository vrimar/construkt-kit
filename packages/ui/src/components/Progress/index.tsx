import { Progress as ArkProgress } from "@ark-ui/react/progress";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { progress } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

const { withProvider, withContext } = createStyleContext(progress);

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

export type ProgressRootProps = ComponentProps<typeof Root>;

export const Progress = {
  Root,
  RootProvider,
  Circle,
  CircleRange,
  CircleTrack,
  Label,
  Range,
  Track,
  ValueText,
  View,
};
