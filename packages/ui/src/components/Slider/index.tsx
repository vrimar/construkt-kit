import { ark } from "@ark-ui/react/factory";
import { Slider as ArkSlider } from "@ark-ui/react/slider";
import { HStack, createStyleContext } from "@construkt-kit/styled-system/jsx";
import { slider } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps, ReactNode } from "react";

const { withProvider, withContext } = createStyleContext(slider);

type RootProps = ComponentProps<typeof Root>;
const Root = withProvider(ArkSlider.Root, "root");
const Control = withContext(ArkSlider.Control, "control");
const Label = withContext(ArkSlider.Label, "label");
const Marker = withContext(ArkSlider.Marker, "marker");
const MarkerIndicator = withContext(ark.div, "markerIndicator");
const MarkerGroup = withContext(ArkSlider.MarkerGroup, "markerGroup");
const Range = withContext(ArkSlider.Range, "range");
const Thumb = withContext(ArkSlider.Thumb, "thumb");
const Track = withContext(ArkSlider.Track, "track");
const ValueText = withContext(ArkSlider.ValueText, "valueText");
const HiddenInput = ArkSlider.HiddenInput;

export interface SliderProps extends RootProps {
  marks?: Array<number | { value: number; label: ReactNode }>;
  label?: ReactNode;
  showValue?: boolean;
}

export const Slider = ({ ref, marks: marksProp, label, showValue, ...rest }: SliderProps) => {
  const value = rest.defaultValue ?? rest.value;

  const marks = marksProp?.map((mark) =>
    typeof mark === "number" ? { value: mark, label: undefined } : mark,
  );

  const hasMarkLabel = marks?.some((mark) => !!mark.label) ?? false;

  return (
    <Root
      ref={ref}
      thumbAlignment="center"
      {...rest}
    >
      {label && (
        <HStack justify="space-between">
          <Label>{label}</Label>
          {showValue && <ValueText />}
        </HStack>
      )}
      <Control data-has-mark-label={hasMarkLabel || undefined}>
        <Track>
          <Range />
        </Track>
        {value?.map((_, index) => (
          <Thumb
            key={index}
            index={index}
          >
            <HiddenInput />
          </Thumb>
        ))}
      </Control>
      {marks?.length && (
        <MarkerGroup>
          {marks.map((mark, index) => (
            <Marker
              key={index}
              value={mark.value}
            >
              <MarkerIndicator />
              {mark.label}
            </Marker>
          ))}
        </MarkerGroup>
      )}
    </Root>
  );
};
