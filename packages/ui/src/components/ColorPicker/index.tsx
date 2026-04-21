import { ColorPicker as ArkColorPicker, ColorPickerContext } from "@ark-ui/react/color-picker";
import { ark } from "@ark-ui/react/factory";
import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps, RefObject } from "react";
import { createStyleContext, styled } from "styled-system/jsx";
import { colorPicker } from "styled-system/recipes";

import type { WithRef } from "../../types";
export { parseColor } from "@ark-ui/react/color-picker";

const { withRootProvider, withContext } = createStyleContext(colorPicker);

const Root = withRootProvider(ArkColorPicker.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const RootProvider = withRootProvider(ArkColorPicker.RootProvider, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
const Area = withContext(ArkColorPicker.Area, "area");
const AreaBackground = withContext(ArkColorPicker.AreaBackground, "areaBackground");
const AreaThumb = withContext(ArkColorPicker.AreaThumb, "areaThumb");
const ChannelInput = withContext(ArkColorPicker.ChannelInput, "channelInput");
const ChannelSlider = withContext(ArkColorPicker.ChannelSlider, "channelSlider");
const ChannelSliderLabel = withContext(ArkColorPicker.ChannelSliderLabel, "channelSliderLabel");
const ChannelSliderThumb = withContext(ArkColorPicker.ChannelSliderThumb, "channelSliderThumb");
const ChannelSliderTrack = withContext(ArkColorPicker.ChannelSliderTrack, "channelSliderTrack");
const ChannelSliderValueText = withContext(
  ArkColorPicker.ChannelSliderValueText,
  "channelSliderValueText",
);
const Content = withContext(ArkColorPicker.Content, "content");
const Control = withContext(ArkColorPicker.Control, "control");
const EyeDropperTrigger = withContext(ArkColorPicker.EyeDropperTrigger, "eyeDropperTrigger");
const FormatSelect = withContext(ArkColorPicker.FormatSelect, "formatSelect");
const FormatTrigger = withContext(ArkColorPicker.FormatTrigger, "formatTrigger");
const HiddenInput = ArkColorPicker.HiddenInput;
const Label = withContext(ArkColorPicker.Label, "label");
const Positioner = withContext(ArkColorPicker.Positioner, "positioner");
const Swatch = withContext(ArkColorPicker.Swatch, "swatch");
const SwatchGroup = withContext(ArkColorPicker.SwatchGroup, "swatchGroup");
const SwatchIndicator = withContext(ArkColorPicker.SwatchIndicator, "swatchIndicator");
const SwatchTrigger = withContext(ArkColorPicker.SwatchTrigger, "swatchTrigger");
const TransparencyGrid = withContext(ArkColorPicker.TransparencyGrid, "transparencyGrid");
const Trigger = withContext(ArkColorPicker.Trigger, "trigger");
const ValueSwatch = withContext(ArkColorPicker.ValueSwatch, "valueSwatch");
const ValueText = withContext(ArkColorPicker.ValueText, "valueText");
const View = withContext(ArkColorPicker.View, "view");
const TriggerSwatch = styled(ark.div, {
  base: {
    display: "grid",
    width: "full",
    height: "full",
    borderRadius: "inherit",
    overflow: "hidden",
  },
});

export type ColorPickerRootProps = ComponentProps<typeof Root>;

export interface ColorPickerContentProps extends ComponentProps<typeof Content> {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement | null>;
}

function ColorPickerContent({
  ref,
  portalled = true,
  portalRef,
  ...rest
}: WithRef<ColorPickerContentProps>) {
  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <Positioner>
        <Content
          animation="none"
          ref={ref}
          {...rest}
        />
      </Positioner>
    </Portal>
  );
}

export interface ColorPickerProps extends Omit<ColorPickerRootProps, "children"> {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement | null>;
  withAlpha?: boolean;
  swatches?: string[];
}

const ColorPickerSimple = ({
  portalled = true,
  portalRef,
  withAlpha = false,
  swatches,
  ...rest
}: ColorPickerProps) => {
  return (
    <Root {...rest}>
      <Control>
        <Trigger>
          <TriggerSwatch>
            <TransparencyGrid />
            <ValueSwatch />
          </TriggerSwatch>
        </Trigger>
      </Control>
      <ColorPickerContent
        portalled={portalled}
        portalRef={portalRef}
      >
        <Area>
          <AreaBackground />
          <AreaThumb />
        </Area>
        <ChannelInput channel="hex" />
        <ChannelSlider channel="hue">
          <ChannelSliderTrack />
          <ChannelSliderThumb />
        </ChannelSlider>
        {withAlpha && (
          <ChannelSlider channel="alpha">
            <TransparencyGrid />
            <ChannelSliderTrack />
            <ChannelSliderThumb />
          </ChannelSlider>
        )}
        {swatches && swatches.length > 0 && (
          <SwatchGroup>
            {swatches.map((swatch) => (
              <SwatchTrigger
                key={swatch}
                value={swatch}
              >
                <Swatch value={swatch} />
              </SwatchTrigger>
            ))}
          </SwatchGroup>
        )}
      </ColorPickerContent>
      <HiddenInput />
    </Root>
  );
};

export const ColorPicker = Object.assign(ColorPickerSimple, {
  Root,
  RootProvider,
  Area,
  AreaBackground,
  AreaThumb,
  ChannelInput,
  ChannelSlider,
  ChannelSliderLabel,
  ChannelSliderThumb,
  ChannelSliderTrack,
  ChannelSliderValueText,
  Content: ColorPickerContent,
  Control,
  EyeDropperTrigger,
  FormatSelect,
  FormatTrigger,
  HiddenInput,
  Label,
  Positioner,
  Swatch,
  SwatchGroup,
  SwatchIndicator,
  SwatchTrigger,
  TransparencyGrid,
  Trigger,
  ValueSwatch,
  ValueText,
  View,
  Context: ColorPickerContext,
});
