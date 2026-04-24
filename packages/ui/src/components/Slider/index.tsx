import { ark } from "@ark-ui/react/factory";
import { Slider as ArkSlider } from "@ark-ui/react/slider";
import type { ComponentProps, ReactNode } from "react";
import { HStack, createStyleContext } from "@b3/styled-system/jsx";
import { slider } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";

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

export const Slider = ({
  ref,
  marks: marksProp,
  label,
  showValue,
  ...rest
}: WithRef<SliderProps>) => {
  const value = rest.defaultValue ?? rest.value;

  const marks = marksProp?.map((mark) => {
    if (typeof mark === "number") return { value: mark, label: undefined };
    return mark;
  });

  const hasMarkLabel = !!marks?.some((mark) => mark.label);

  return (
    <Root
      ref={ref}
      cursor="pointer"
      thumbAlignment="center"
      {...rest}
    >
      {label && !showValue && <Label fontWeight="medium">{label}</Label>}
      {label && showValue && (
        <HStack justify="space-between">
          <Label fontWeight="medium">{label}</Label>
          <ValueText />
        </HStack>
      )}
      <Control mb={hasMarkLabel ? "4" : undefined}>
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
          {marks.map((mark, index) => {
            const markValue = typeof mark === "number" ? mark : mark.value;
            const markLabel = typeof mark === "number" ? undefined : mark.label;

            return (
              <Marker
                key={index}
                value={markValue}
                fontSize="md"
              >
                <MarkerIndicator />
                {markLabel}
              </Marker>
            );
          })}
        </MarkerGroup>
      )}
    </Root>
  );
};
