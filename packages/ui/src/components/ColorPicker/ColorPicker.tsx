import {
  ColorPicker as ChakraColorPicker,
  ColorPickerArea,
  ColorPickerAreaBackground,
  ColorPickerAreaThumb,
  ColorPickerChannelInput,
  ColorPickerChannelSlider,
  ColorPickerChannelSliderLabel,
  ColorPickerChannelSliderThumb,
  ColorPickerChannelSliderTrack,
  ColorPickerChannelSliderValueText,
  ColorPickerChannelText,
  ColorPickerContent,
  ColorPickerContext,
  ColorPickerControl,
  ColorPickerEyeDropper,
  ColorPickerEyeDropperTrigger,
  ColorPickerFormatSelect,
  ColorPickerFormatTrigger,
  ColorPickerHiddenInput,
  ColorPickerInput,
  ColorPickerLabel,
  ColorPickerPositioner,
  ColorPickerRoot,
  ColorPickerSliders,
  ColorPickerSwatch,
  ColorPickerSwatchGroup,
  ColorPickerSwatchIndicator,
  ColorPickerSwatchTrigger,
  ColorPickerTransparencyGrid,
  ColorPickerTrigger,
  ColorPickerValueSwatch,
  ColorPickerValueText,
  ColorPickerView,
  parseColor,
} from "@chakra-ui/react";
export type {
  ColorPickerAreaBackgroundProps,
  ColorPickerAreaProps,
  ColorPickerAreaThumbProps,
  ColorPickerChannelInputProps,
  ColorPickerChannelSliderLabelProps,
  ColorPickerChannelSliderProps,
  ColorPickerChannelSliderThumbProps,
  ColorPickerChannelSliderTrackProps,
  ColorPickerChannelSliderValueTextProps,
  ColorPickerChannelTextProps,
  ColorPickerContentProps,
  ColorPickerControlProps,
  ColorPickerEyeDropperProps,
  ColorPickerEyeDropperTriggerProps,
  ColorPickerFormatSelectProps,
  ColorPickerFormatTriggerProps,
  ColorPickerLabelProps,
  ColorPickerPositionerProps,
  ColorPickerRootProps,
  ColorPickerSwatchGroupProps,
  ColorPickerSwatchIndicatorProps,
  ColorPickerSwatchProps,
  ColorPickerSwatchTriggerProps,
  ColorPickerTransparencyGridProps,
  ColorPickerTriggerProps,
  ColorPickerValueChangeDetails,
  ColorPickerValueSwatchProps,
  ColorPickerValueTextProps,
  ColorPickerViewProps,
} from "@chakra-ui/react";

export {
  parseColor,
  ColorPickerArea,
  ColorPickerAreaBackground,
  ColorPickerAreaThumb,
  ColorPickerChannelInput,
  ColorPickerChannelSlider,
  ColorPickerChannelSliderLabel,
  ColorPickerChannelSliderThumb,
  ColorPickerChannelSliderTrack,
  ColorPickerChannelSliderValueText,
  ColorPickerChannelText,
  ColorPickerContent,
  ColorPickerContext,
  ColorPickerControl,
  ColorPickerEyeDropper,
  ColorPickerEyeDropperTrigger,
  ColorPickerFormatSelect,
  ColorPickerFormatTrigger,
  ColorPickerHiddenInput,
  ColorPickerInput,
  ColorPickerLabel,
  ColorPickerPositioner,
  ColorPickerRoot,
  ColorPickerSliders,
  ColorPickerSwatch,
  ColorPickerSwatchGroup,
  ColorPickerSwatchIndicator,
  ColorPickerSwatchTrigger,
  ColorPickerTransparencyGrid,
  ColorPickerTrigger,
  ColorPickerValueSwatch,
  ColorPickerValueText,
  ColorPickerView,
};

export interface ColorPickerProps extends Omit<ChakraColorPicker.RootProps, "children"> {
  withAlpha?: boolean;
  swatches?: string[];
}

export function ColorPicker({ withAlpha = false, swatches, ...rest }: ColorPickerProps) {
  return (
    <ChakraColorPicker.Root {...rest}>
      <ChakraColorPicker.HiddenInput />
      <ChakraColorPicker.Control>
        <ChakraColorPicker.Input />
        <ChakraColorPicker.Trigger />
      </ChakraColorPicker.Control>
      <ChakraColorPicker.Positioner>
        <ChakraColorPicker.Content>
          <ChakraColorPicker.Area>
            <ChakraColorPicker.AreaBackground />
            <ChakraColorPicker.AreaThumb />
          </ChakraColorPicker.Area>
          <ChakraColorPicker.Sliders>
            <ChakraColorPicker.ChannelSlider channel="hue" />
            {withAlpha && <ChakraColorPicker.ChannelSlider channel="alpha" />}
          </ChakraColorPicker.Sliders>
          {swatches && swatches.length > 0 && (
            <ChakraColorPicker.SwatchGroup>
              {swatches.map((swatch) => (
                <ChakraColorPicker.SwatchTrigger key={swatch} value={swatch}>
                  <ChakraColorPicker.Swatch value={swatch} />
                </ChakraColorPicker.SwatchTrigger>
              ))}
            </ChakraColorPicker.SwatchGroup>
          )}
        </ChakraColorPicker.Content>
      </ChakraColorPicker.Positioner>
    </ChakraColorPicker.Root>
  );
}
