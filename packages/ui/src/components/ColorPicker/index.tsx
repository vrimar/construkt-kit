import { ColorPicker as ArkColorPicker, ColorPickerContext } from "@ark-ui/react/color-picker";
import type { ComponentProps } from "react";
import { createStyleContext } from "styled-system/jsx";
import { colorPicker } from "styled-system/recipes";
export { parseColor } from "@ark-ui/react/color-picker";

const { withProvider, withContext } = createStyleContext(colorPicker);

const Root = withProvider(ArkColorPicker.Root, "root");
const RootProvider = withProvider(ArkColorPicker.RootProvider, "root");
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
const ValueSwatch = ArkColorPicker.ValueSwatch;
const ValueText = withContext(ArkColorPicker.ValueText, "valueText");
const View = withContext(ArkColorPicker.View, "view");

export type ColorPickerRootProps = ComponentProps<typeof Root>;

export interface ColorPickerProps extends Omit<ColorPickerRootProps, "children"> {
  withAlpha?: boolean;
  swatches?: string[];
}

export const ColorPicker = ({ withAlpha = false, swatches, ...rest }: ColorPickerProps) => {
  return (
    <ColorPickerParts.Root {...rest}>
      <Control>
        <Trigger>
          <TransparencyGrid />
          <ValueSwatch />
        </Trigger>
      </Control>
      <Positioner>
        <Content>
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
        </Content>
      </Positioner>
      <HiddenInput />
    </ColorPickerParts.Root>
  );
};

export const ColorPickerParts = {
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
  Content,
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
};
