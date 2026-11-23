import { clampValue } from "@construkt-kit/utils";
import { NumberFormatter } from "@internationalized/number";
import { type ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { progress } from "#styled-system/recipes";

import { useLocale } from "../../primitives/locale";
import { dataAttr, renderable } from "../../primitives/render";
import { createPartContext } from "../partContext";

const { withProvider, withContext } = createSlotRecipeContext(progress);

const StyledRoot = withProvider(renderable.div, "root");
const StyledCircle = withContext(renderable.svg, "circle");
const StyledCircleRange = withContext(renderable.circle, "circleRange");
const StyledCircleTrack = withContext(renderable.circle, "circleTrack");
const StyledLabel = withContext(renderable.span, "label");
const StyledRange = withContext(renderable.div, "range");
const StyledTrack = withContext(renderable.div, "track");
const StyledValueText = withContext(renderable.span, "valueText");
const StyledView = withContext(renderable.span, "view");
const SegmentsTrack = withContext(renderable.div, "segments");
const Segment = withContext(renderable.span, "segment");

/** `indeterminate` while the value is `null`, `complete` at `max`, else `loading`. */
export type ProgressState = "indeterminate" | "loading" | "complete";

export type ProgressOrientation = "horizontal" | "vertical";

export interface ProgressValueTextDetails {
  value: number | null;
  min: number;
  max: number;
  percent: number;
  formatter: Intl.NumberFormat;
}

export interface ProgressTranslations {
  /** The progressbar's `aria-label`. @default the percentage, or "loading..." while indeterminate */
  value?: ((details: ProgressValueTextDetails) => string) | undefined;
}

interface ProgressContextValue {
  value: number | null;
  min: number;
  max: number;
  percent: number;
  valueAsString: string;
  state: ProgressState;
  orientation: ProgressOrientation;
  stateAttributes: ProgressStateAttributes;
  progressbarProps: Record<string, unknown>;
}

type ProgressStateAttributes = Record<
  "data-indeterminate" | "data-loading" | "data-complete",
  "" | undefined
> & { "data-orientation": ProgressOrientation };

const [ProgressContext, useProgressContext] =
  createPartContext<ProgressContextValue>("<Progress.Root>");

const formatValue = (value: number, percent: number, formatter: Intl.NumberFormat) =>
  formatter.format(formatter.resolvedOptions().style === "percent" ? percent / 100 : value);

function defaultValueText({ value, percent, formatter }: ProgressValueTextDetails) {
  return value === null ? "loading..." : formatValue(value, percent, formatter);
}

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface ProgressRootProps extends StyledRootProps {
  /**
   * The progress, held to `min`–`max`, or `null` while it is unknown.
   * @default the midpoint of `min` and `max`
   */
  value?: number | null | undefined;
  /** @default 0 */
  min?: number | undefined;
  /** @default 100 */
  max?: number | undefined;
  /** How the value text formats the value. @default { style: "percent" } */
  formatOptions?: Intl.NumberFormatOptions | undefined;
  /** @default "horizontal" */
  orientation?: ProgressOrientation | undefined;
  translations?: ProgressTranslations | undefined;
}

function Root({
  value: valueProp,
  min = 0,
  max = 100,
  formatOptions,
  orientation = "horizontal",
  translations,
  style,
  ...props
}: ProgressRootProps) {
  const { locale } = useLocale();
  const given = valueProp === undefined ? min + (max - min) / 2 : valueProp;
  const value = given === null ? null : clampValue(given, min, max);
  const formatter = new NumberFormatter(locale, { style: "percent", ...formatOptions });
  const percent = value === null ? -1 : max === min ? 100 : ((value - min) / (max - min)) * 100;
  const state: ProgressState =
    value === null ? "indeterminate" : value === max ? "complete" : "loading";
  const stateAttributes: ProgressStateAttributes = {
    "data-indeterminate": dataAttr(state === "indeterminate"),
    "data-loading": dataAttr(state === "loading"),
    "data-complete": dataAttr(state === "complete"),
    "data-orientation": orientation,
  };
  const valueText = (translations?.value ?? defaultValueText)({
    value,
    min,
    max,
    percent,
    formatter,
  });

  const context: ProgressContextValue = {
    value,
    min,
    max,
    percent,
    valueAsString: value === null ? "" : formatValue(value, percent, formatter),
    state,
    orientation,
    stateAttributes,
    progressbarProps: {
      role: "progressbar",
      "aria-label": valueText,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": value ?? undefined,
      "data-max": max,
      ...stateAttributes,
    },
  };

  return (
    <ProgressContext value={context}>
      <StyledRoot
        data-max={max}
        data-value={value ?? undefined}
        {...stateAttributes}
        {...props}
        style={{ ...(value === null ? undefined : { "--progress-percent": percent }), ...style }}
      />
    </ProgressContext>
  );
}

function Label(props: ComponentProps<typeof StyledLabel>) {
  const context = useProgressContext("Progress.Label");
  return (
    <StyledLabel
      data-orientation={context.orientation}
      {...props}
    />
  );
}

/** The value formatted by `formatOptions`, a percentage by default, unless children replace it. */
function ValueText({ children, ...props }: ComponentProps<typeof StyledValueText>) {
  const context = useProgressContext("Progress.ValueText");
  return (
    <StyledValueText
      aria-live="polite"
      {...props}
    >
      {children || context.valueAsString}
    </StyledValueText>
  );
}

/** The bar's progressbar. */
function Track(props: ComponentProps<typeof StyledTrack>) {
  const context = useProgressContext("Progress.Track");
  return (
    <StyledTrack
      {...context.progressbarProps}
      {...props}
    />
  );
}

function Range(props: ComponentProps<typeof StyledRange>) {
  const context = useProgressContext("Progress.Range");
  return (
    <StyledRange
      {...context.stateAttributes}
      {...props}
    />
  );
}

/** The circle's progressbar, sized by the recipe's `--size` and `--thickness`. */
function Circle(props: ComponentProps<typeof StyledCircle>) {
  const context = useProgressContext("Progress.Circle");
  return (
    <StyledCircle
      {...context.progressbarProps}
      {...props}
    />
  );
}

function CircleTrack(props: ComponentProps<typeof StyledCircleTrack>) {
  const context = useProgressContext("Progress.CircleTrack");
  return (
    <StyledCircleTrack
      data-orientation={context.orientation}
      {...props}
    />
  );
}

function CircleRange(props: ComponentProps<typeof StyledCircleRange>) {
  const context = useProgressContext("Progress.CircleRange");
  return (
    <StyledCircleRange
      opacity={context.value === 0 ? 0 : undefined}
      {...context.stateAttributes}
      {...props}
    />
  );
}

export interface ProgressViewProps extends ComponentProps<typeof StyledView> {
  /** The state this view shows in. */
  state: ProgressState;
}

/** Content shown only in one state, such as a message once the progress is complete. */
function View({ state, ...props }: ProgressViewProps) {
  const context = useProgressContext("Progress.View");
  return (
    <StyledView
      hidden={state !== context.state}
      {...props}
    />
  );
}

export type ProgressSegmentsProps = Omit<ComponentProps<typeof SegmentsTrack>, "children">;

/** A track split into one segment per step from `min` to `max`, with the first `value - min` filled. */
function Segments(props: ProgressSegmentsProps) {
  const context = useProgressContext("Progress.Segments");
  const filled = context.value == null ? 0 : context.value - context.min;

  return (
    <SegmentsTrack
      {...context.progressbarProps}
      {...props}
    >
      {Array.from({ length: Math.max(0, context.max - context.min) }, (_, index) => (
        <Segment
          key={index}
          data-filled={dataAttr(index < filled)}
        />
      ))}
    </SegmentsTrack>
  );
}

export const Progress = {
  Root,
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
