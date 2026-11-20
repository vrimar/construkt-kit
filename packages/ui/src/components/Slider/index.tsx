import {
  type ComponentProps,
  type ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
} from "react";

import { HStack, createSlotRecipeContext } from "#styled-system/jsx";
import { slider } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { isRenderable } from "../itemSlots";
import { type SliderApi, type SliderOptions, useSlider } from "./useSlider";

export type {
  SliderValueChangeDetails,
  SliderValueChangeEndDetails,
  SliderValueChangeReason,
} from "./useSlider";

const { withProvider, withContext } = createSlotRecipeContext(slider);

const SliderContext = createContext<SliderApi | null>(null);

function useSliderContext(): SliderApi {
  const context = useContext(SliderContext);
  if (!context) throw new Error("A Slider part must be placed inside the Slider.");
  return context;
}

type DivProps = ComponentProps<typeof renderable.div>;
type SpanProps = ComponentProps<typeof renderable.span>;

interface RootImplProps extends Omit<DivProps, keyof SliderOptions>, SliderOptions {}

function RootImpl({
  ref,
  value,
  defaultValue,
  onValueChange,
  onValueChangeEnd,
  onFocusChange,
  min,
  max,
  step,
  largeStep,
  minStepsBetweenThumbs,
  orientation,
  origin,
  thumbAlignment,
  thumbCollisionBehavior,
  thumbSize,
  getAriaValueText,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  disabled,
  readOnly,
  invalid,
  name,
  form,
  id,
  ...props
}: RootImplProps) {
  const api = useSlider({
    value,
    defaultValue,
    onValueChange,
    onValueChangeEnd,
    onFocusChange,
    min,
    max,
    step,
    largeStep,
    minStepsBetweenThumbs,
    orientation,
    origin,
    thumbAlignment,
    thumbCollisionBehavior,
    thumbSize,
    getAriaValueText,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    disabled,
    readOnly,
    invalid,
    name,
    form,
    id,
  });
  const { ref: rootRef, ...rootProps } = api.rootProps;
  const composedRef = useComposedRefs(rootRef, ref);

  return (
    <SliderContext value={api}>
      <renderable.div
        {...mergeProps<DivProps>(rootProps, props)}
        ref={composedRef}
      />
    </SliderContext>
  );
}

const Root = withProvider(RootImpl, "root", { forwardProps: ["orientation"] });

function LabelImpl(props: ComponentProps<typeof renderable.label>) {
  const { labelProps, setLabelRendered } = useSliderContext();
  useLayoutEffect(() => {
    setLabelRendered(true);
    return () => setLabelRendered(false);
  }, [setLabelRendered]);
  return (
    <renderable.label {...mergeProps<ComponentProps<typeof renderable.label>>(labelProps, props)} />
  );
}

function ControlImpl({ ref, ...props }: DivProps) {
  const { ref: controlRef, ...controlProps } = useSliderContext().controlProps;
  const composedRef = useComposedRefs(controlRef, ref);
  return (
    <renderable.div
      {...mergeProps<DivProps>(controlProps, props)}
      ref={composedRef}
    />
  );
}

function TrackImpl(props: DivProps) {
  return <renderable.div {...mergeProps<DivProps>(useSliderContext().trackProps, props)} />;
}

function RangeImpl(props: DivProps) {
  return <renderable.div {...mergeProps<DivProps>(useSliderContext().rangeProps, props)} />;
}

function ValueTextImpl({ children, ...props }: SpanProps) {
  const { valueTextProps, value } = useSliderContext();
  return (
    <renderable.span {...mergeProps<SpanProps>(valueTextProps, props)}>
      {children || value.join(", ")}
    </renderable.span>
  );
}

function ThumbImpl({ index, ...props }: DivProps & { index: number }) {
  return <renderable.div {...mergeProps<DivProps>(useSliderContext().thumbProps(index), props)} />;
}

function MarkerGroupImpl(props: DivProps) {
  return <renderable.div {...mergeProps<DivProps>(useSliderContext().markerGroupProps, props)} />;
}

function MarkerImpl({ value, ...props }: Omit<SpanProps, "value"> & { value: number }) {
  return (
    <renderable.span {...mergeProps<SpanProps>(useSliderContext().markerProps(value), props)} />
  );
}

function HiddenInput({ index }: { index: number }) {
  return <input {...useSliderContext().hiddenInputProps(index)} />;
}

const Control = withContext(ControlImpl, "control", { defaultProps: { "data-no-drag": "" } });
const Label = withContext(LabelImpl, "label");
const Marker = withContext(MarkerImpl, "marker");
const MarkerIndicator = withContext(renderable.div, "markerIndicator");
const MarkerLabel = withContext(renderable.span, "markerLabel");
const MarkerGroup = withContext(MarkerGroupImpl, "markerGroup");
const Range = withContext(RangeImpl, "range");
const Thumb = withContext(ThumbImpl, "thumb");
const Track = withContext(TrackImpl, "track");
const ValueText = withContext(ValueTextImpl, "valueText");

type RootProps = ComponentProps<typeof Root>;

export interface SliderProps extends RootProps {
  marks?: Array<number | { value: number; label: ReactNode }>;
  label?: ReactNode;
  showValue?: boolean;
}

function Thumbs() {
  const { value } = useSliderContext();

  return value.map((_, index) => (
    <Thumb
      key={index}
      index={index}
    >
      <HiddenInput index={index} />
    </Thumb>
  ));
}

export const Slider = ({ ref, marks: marksProp, label, showValue, ...rest }: SliderProps) => {
  const marks = marksProp?.map((mark) =>
    typeof mark === "number" ? { value: mark, label: undefined } : mark,
  );

  return (
    <Root
      ref={ref}
      thumbAlignment="center"
      {...rest}
    >
      {(label || showValue) && (
        <HStack justify={label ? "space-between" : "flex-end"}>
          {label && <Label>{label}</Label>}
          {showValue && <ValueText />}
        </HStack>
      )}
      <Control>
        <Track>
          <Range />
        </Track>
        <Thumbs />
        {marks && marks.length > 0 && (
          <MarkerGroup>
            {marks.map((mark, index) => (
              <Marker
                key={index}
                value={mark.value}
              >
                <MarkerIndicator />
                {isRenderable(mark.label) && <MarkerLabel>{mark.label}</MarkerLabel>}
              </Marker>
            ))}
          </MarkerGroup>
        )}
      </Control>
    </Root>
  );
};
