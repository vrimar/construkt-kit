import {
  type Color,
  type ColorChannel,
  type ColorFormat,
  type ColorStringFormat,
  convertColor,
  formatColor,
  formatColorChannelValue,
  getColorChannelRange,
  getColorChannelValue,
  getColorChannelValuePercent,
  parseColor,
  setColorChannelValue,
} from "@construkt-kit/utils";
import {
  type CSSProperties,
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type Ref,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

import { createSlotRecipeContext, styled } from "#styled-system/jsx";
import { visuallyHidden } from "#styled-system/patterns";
import { colorPicker } from "#styled-system/recipes";

import { isComposingEvent } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { dataAttr, openStateAttributes, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import type { WithRef } from "../../types";
import { useFieldTriggerProps } from "../fieldTrigger";
import {
  PickerPopupProvider,
  type PickerPopupProps,
  createPickerContent,
  getPickerTriggerProps,
  usePickerPopup,
  usePickerPopupContext,
} from "../pickerPopup";
import {
  ColorPickerContext,
  type ColorPickerStateOptions,
  useColorPickerContext,
  useColorPickerState,
} from "./colorPickerRoot";
import {
  type ExtendedColorChannel,
  type Orientation,
  getAreaGradient,
  getChannelDisplayColor,
  getChannelInputRange,
  getChannelInputValue,
  getNextFormat,
  getSliderBackground,
  isColorFormat,
} from "./pickerColors";

const { withProvider, withContext } = createSlotRecipeContext(colorPicker);

const StyledRoot = withProvider(renderable.div, "root");
const StyledLabel = withContext(renderable.label, "label");
const StyledControl = withContext(renderable.div, "control");
const StyledTrigger = withContext(renderable.button, "trigger");
const StyledContent = withContext(renderable.div, "content");
const PickerContent = createPickerContent(withContext(renderable.div, "positioner"), StyledContent);
const StyledArea = withContext(renderable.div, "area");
const StyledAreaBackground = withContext(renderable.div, "areaBackground");
const StyledAreaThumb = withContext(renderable.div, "areaThumb");
const StyledValueText = withContext(renderable.span, "valueText");
const StyledChannelSlider = withContext(renderable.div, "channelSlider");
const StyledChannelSliderLabel = withContext(renderable.label, "channelSliderLabel");
const StyledChannelSliderTrack = withContext(renderable.div, "channelSliderTrack");
const StyledChannelSliderThumb = withContext(renderable.div, "channelSliderThumb");
const StyledChannelSliderValueText = withContext(renderable.span, "channelSliderValueText");
const StyledChannelInput = withContext(renderable.input, "channelInput");
const StyledTransparencyGrid = withContext(renderable.div, "transparencyGrid");
const StyledSwatchGroup = withContext(renderable.div, "swatchGroup");
const StyledSwatchTrigger = withContext(renderable.button, "swatchTrigger");
const StyledSwatchIndicator = withContext(renderable.div, "swatchIndicator");
const StyledSwatch = withContext(renderable.div, "swatch");
const StyledEyeDropperTrigger = withContext(renderable.button, "eyeDropperTrigger");
const StyledFormatTrigger = withContext(renderable.button, "formatTrigger");
const StyledFormatSelect = withContext(renderable.select, "formatSelect");
const StyledView = withContext(renderable.div, "view");
const StyledValueSwatch = withContext(renderable.div, "valueSwatch");
const TriggerSwatch = styled(renderable.div, {
  base: {
    display: "grid",
    width: "full",
    height: "full",
    borderRadius: "inherit",
    overflow: "hidden",
  },
});

const hiddenInputClass = visuallyHidden();

const FORMATS: ColorFormat[] = ["rgba", "hsla", "hsba"];

type Style = CSSProperties & Record<`--${string}`, string | undefined>;

const stateAttributes = (picker: { disabled: boolean; readOnly: boolean; invalid: boolean }) => ({
  "data-disabled": dataAttr(picker.disabled),
  "data-read-only": dataAttr(picker.readOnly),
  "data-invalid": dataAttr(picker.invalid),
});

const normalizeColor = (value: string | Color) =>
  typeof value === "string" ? parseColor(value) : value;

type RootElementProps = Omit<ComponentProps<typeof StyledRoot>, "defaultValue" | "onChange">;

export interface ColorPickerRootProps
  extends RootElementProps, ColorPickerStateOptions, PickerPopupProps {
  /** The element to focus as the popup opens, in place of its first focusable one. */
  initialFocusEl?: (() => HTMLElement | null) | undefined;
  /** Shows the content in place, always open, with no popup. */
  inline?: boolean | undefined;
}

function Root({
  ref,
  value,
  defaultValue,
  onValueChange,
  onValueChangeEnd,
  format,
  defaultFormat,
  onFormatChange,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  closeOnSelect,
  open,
  defaultOpen,
  onOpenChange,
  mobileLayout,
  placement,
  initialFocusEl,
  inline,
  ...props
}: ColorPickerRootProps) {
  const popup = usePickerPopup({
    open,
    defaultOpen,
    onOpenChange,
    mobileLayout,
    inline,
    placement,
    initialFocus: initialFocusEl,
  });
  const picker = useColorPickerState(
    {
      value,
      defaultValue,
      onValueChange,
      onValueChangeEnd,
      format,
      defaultFormat,
      onFormatChange,
      disabled,
      readOnly,
      invalid,
      required,
      name,
      closeOnSelect,
    },
    {
      open: popup.open,
      requestClose: (event) => popup.requestOpenChange(false, "item-press", event),
    },
  );
  const composedRef = useComposedRefs(ref, picker.rootRef);

  return (
    <PickerPopupProvider popup={popup}>
      <ColorPickerContext value={picker}>
        <StyledRoot
          {...mergeProps<ComponentProps<typeof StyledRoot>>(
            {
              id: picker.ids.root,
              dir: picker.dir,
              ...stateAttributes(picker),
              style: { "--color-picker-value": formatColor(picker.value, "css") } as Style,
            },
            props,
          )}
          ref={composedRef}
        />
      </ColorPickerContext>
    </PickerPopupProvider>
  );
}

function Label(props: ComponentProps<typeof StyledLabel>) {
  const picker = useColorPickerContext();
  const { setLabelRendered } = picker;
  useLayoutEffect(() => {
    setLabelRendered(true);
    return () => setLabelRendered(false);
  }, [setLabelRendered]);
  return (
    <StyledLabel
      {...mergeProps<ComponentProps<typeof StyledLabel>>(
        {
          id: picker.ids.label,
          htmlFor: picker.ids.hiddenInput,
          ...stateAttributes(picker),
          "data-required": dataAttr(picker.required),
          onClick: (event: MouseEvent<HTMLLabelElement>) => {
            event.preventDefault();
            event.currentTarget.ownerDocument
              .getElementById(picker.ids.control)
              ?.querySelector<HTMLElement>("[data-channel=hex]")
              ?.focus({ preventScroll: true });
          },
        } as ComponentProps<typeof StyledLabel>,
        props,
      )}
    />
  );
}

function Control(props: ComponentProps<typeof StyledControl>) {
  const picker = useColorPickerContext();
  const popup = usePickerPopupContext();
  return (
    <StyledControl
      {...mergeProps<ComponentProps<typeof StyledControl>>(
        { id: picker.ids.control, ...stateAttributes(picker), ...openStateAttributes(popup.open) },
        props,
      )}
    />
  );
}

function Trigger({
  ref,
  ...props
}: WithRef<ComponentProps<typeof StyledTrigger>, HTMLButtonElement>) {
  const picker = useColorPickerContext();
  const popup = usePickerPopupContext();
  const fieldProps = useFieldTriggerProps(popup.ids.trigger);
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, popup.setTriggerEl);
  const labelledBy = picker.labelRendered ? `${picker.ids.label} ${popup.ids.trigger}` : undefined;
  return (
    <StyledTrigger
      {...mergeProps<ComponentProps<typeof StyledTrigger>>(
        {
          ...getPickerTriggerProps(popup, { interactive: picker.interactive }),
          "aria-label": `select color. current color is ${picker.valueAsString}`,
          ...fieldProps,
          "aria-labelledby": fieldProps["aria-labelledby"] ?? labelledBy,
          disabled: picker.disabled,
          ...stateAttributes(picker),
        },
        props,
      )}
      ref={composedRef}
    />
  );
}

export type ColorPickerContentProps = WithRef<ComponentProps<typeof StyledContent>>;

function Content(props: ColorPickerContentProps) {
  const popup = usePickerPopupContext();
  const picker = useColorPickerContext();
  return (
    <PickerContent
      aria-label={popup.inline ? undefined : "Color picker"}
      data-dragging={dataAttr(picker.dragging)}
      {...props}
    />
  );
}

interface AreaAxes {
  xChannel: ColorChannel;
  yChannel: ColorChannel;
}

const AreaContext = createContext<AreaAxes | null>(null);

function useAreaAxes(): AreaAxes {
  const axes = useContext(AreaContext);
  if (!axes) throw new Error("ColorPicker.Area parts must be rendered inside ColorPicker.Area.");
  return axes;
}

export interface ColorPickerAreaProps extends ComponentProps<typeof StyledArea> {
  /** @default the format's saturation */
  xChannel?: ColorChannel | undefined;
  /** @default the format's brightness or lightness */
  yChannel?: ColorChannel | undefined;
}

function Area({ xChannel, yChannel, ...props }: ColorPickerAreaProps) {
  const picker = useColorPickerContext();
  const axes = picker.getAreaChannels(xChannel, yChannel);
  const gradient = getAreaGradient(picker.areaValue, axes, picker.dir);
  return (
    <AreaContext value={axes}>
      <StyledArea
        {...mergeProps<ComponentProps<typeof StyledArea>>(
          {
            id: picker.ids.area,
            role: "group",
            "data-no-drag": "",
            ...stateAttributes(picker),
            "data-dragging": dataAttr(picker.dragging),
            style: { "--color-picker-area-bg": gradient.base } as Style,
            onPointerDown: (event: PointerEvent<HTMLDivElement>) =>
              picker.startAreaDrag(event, axes),
          } as ComponentProps<typeof StyledArea>,
          props,
        )}
      />
    </AreaContext>
  );
}

function AreaBackground(props: ComponentProps<typeof StyledAreaBackground>) {
  const picker = useColorPickerContext();
  const gradient = getAreaGradient(picker.areaValue, useAreaAxes(), picker.dir);
  return (
    <StyledAreaBackground
      {...mergeProps<ComponentProps<typeof StyledAreaBackground>>(
        {
          id: picker.ids.areaGradient,
          ...stateAttributes(picker),
          style: {
            "--color-picker-area-gradient": gradient.gradient,
            "--color-picker-area-mask": gradient.mask,
          } as Style,
        },
        props,
      )}
    />
  );
}

function AreaThumb(props: ComponentProps<typeof StyledAreaThumb>) {
  const picker = useColorPickerContext();
  const axes = useAreaAxes();
  const { areaValue } = picker;
  const xPercent = getColorChannelValuePercent(areaValue, axes.xChannel);
  const yPercent = 1 - getColorChannelValuePercent(areaValue, axes.yChannel);
  const xValue = getColorChannelValue(areaValue, axes.xChannel);
  const yValue = getColorChannelValue(areaValue, axes.yChannel);
  const left = picker.dir === "rtl" ? 1 - xPercent : xPercent;
  return (
    <StyledAreaThumb
      {...mergeProps<ComponentProps<typeof StyledAreaThumb>>(
        {
          id: picker.ids.areaThumb,
          role: "slider",
          tabIndex: picker.disabled ? undefined : 0,
          ...stateAttributes(picker),
          "data-dragging": dataAttr(picker.dragging),
          "aria-disabled": picker.disabled || undefined,
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-valuenow": xValue,
          "aria-label": `${axes.xChannel} and ${axes.yChannel}`,
          "aria-roledescription": "2d slider",
          "aria-valuetext": `${axes.xChannel} ${xValue}, ${axes.yChannel} ${yValue}`,
          style: {
            left: `${left * 100}%`,
            top: `${yPercent * 100}%`,
            "--color-picker-color": formatColor(setColorChannelValue(areaValue, "alpha", 1), "css"),
          } as Style,
          onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => picker.onAreaKeyDown(event, axes),
        } as ComponentProps<typeof StyledAreaThumb>,
        props,
      )}
    />
  );
}

function ValueText({
  format,
  children,
  ...props
}: ComponentProps<typeof StyledValueText> & { format?: ColorStringFormat | undefined }) {
  const picker = useColorPickerContext();
  return (
    <StyledValueText
      {...mergeProps<ComponentProps<typeof StyledValueText>>(stateAttributes(picker), props)}
    >
      {children || (format ? formatColor(picker.value, format) : picker.valueAsString)}
    </StyledValueText>
  );
}

const ViewFormatContext = createContext<ColorFormat | undefined>(undefined);

interface ChannelProps {
  channel: ColorChannel;
  orientation: Orientation;
  format: ColorFormat | undefined;
}

const ChannelContext = createContext<ChannelProps | null>(null);

function useChannel(): ChannelProps {
  const channel = useContext(ChannelContext);
  if (!channel) {
    throw new Error(
      "ColorPicker.ChannelSlider parts must be rendered inside ColorPicker.ChannelSlider.",
    );
  }
  return channel;
}

export interface ColorPickerChannelSliderProps extends ComponentProps<typeof StyledChannelSlider> {
  channel: ColorChannel;
  /** @default "horizontal" */
  orientation?: Orientation | undefined;
}

function ChannelSlider({
  channel,
  orientation = "horizontal",
  ...props
}: ColorPickerChannelSliderProps) {
  const picker = useColorPickerContext();
  const format = useContext(ViewFormatContext);
  const value = { channel, orientation, format };
  return (
    <ChannelContext value={value}>
      <StyledChannelSlider
        {...mergeProps<ComponentProps<typeof StyledChannelSlider>>(
          {
            role: "presentation",
            "data-no-drag": "",
            "data-channel": channel,
            "data-orientation": orientation,
            onPointerDown: (event: PointerEvent<HTMLDivElement>) =>
              picker.startSliderDrag(event, value),
          } as ComponentProps<typeof StyledChannelSlider>,
          props,
        )}
      />
    </ChannelContext>
  );
}

function ChannelSliderTrack(props: ComponentProps<typeof StyledChannelSliderTrack>) {
  const picker = useColorPickerContext();
  const { channel, orientation, format } = useChannel();
  const color = picker.sliderValue(channel, format);
  return (
    <StyledChannelSliderTrack
      {...mergeProps<ComponentProps<typeof StyledChannelSliderTrack>>(
        {
          id: picker.ids.track(channel),
          role: "group",
          "data-channel": channel,
          "data-orientation": orientation,
          style: {
            "--color-picker-track-bg": getSliderBackground(color, channel, orientation, picker.dir),
          } as Style,
        } as ComponentProps<typeof StyledChannelSliderTrack>,
        props,
      )}
    />
  );
}

function ChannelSliderThumb(props: ComponentProps<typeof StyledChannelSliderThumb>) {
  const picker = useColorPickerContext();
  const { channel, orientation, format } = useChannel();
  const color = picker.sliderValue(channel, format);
  const range = getColorChannelRange(color, channel);
  const channelValue = getColorChannelValue(color, channel);
  const offset = (channelValue - range.minValue) / (range.maxValue - range.minValue);
  const horizontal = orientation === "horizontal";
  const position = horizontal ? (picker.dir === "rtl" ? 1 - offset : offset) : 1 - offset;
  return (
    <StyledChannelSliderThumb
      {...mergeProps<ComponentProps<typeof StyledChannelSliderThumb>>(
        {
          id: picker.ids.thumb(channel),
          role: "slider",
          "aria-label": channel,
          tabIndex: picker.disabled ? undefined : 0,
          "data-channel": channel,
          "data-disabled": dataAttr(picker.disabled),
          "data-orientation": orientation,
          "data-dragging": dataAttr(picker.dragging),
          "aria-disabled": picker.disabled || undefined,
          "aria-orientation": orientation,
          "aria-valuemax": range.maxValue,
          "aria-valuemin": range.minValue,
          "aria-valuenow": channelValue,
          "aria-valuetext": `${channel} ${channelValue}`,
          style: {
            ...(horizontal
              ? { left: `${position * 100}%`, top: "50%" }
              : { top: `${position * 100}%`, left: "50%" }),
            "--color-picker-color": formatColor(
              getChannelDisplayColor(picker.areaValue, channel),
              "css",
            ),
          } as Style,
          onKeyDown: (event: KeyboardEvent<HTMLDivElement>) =>
            picker.onSliderKeyDown(event, channel, format),
        } as ComponentProps<typeof StyledChannelSliderThumb>,
        props,
      )}
    />
  );
}

function ChannelSliderLabel(props: ComponentProps<typeof StyledChannelSliderLabel>) {
  const picker = useColorPickerContext();
  const { channel } = useChannel();
  return (
    <StyledChannelSliderLabel
      {...mergeProps<ComponentProps<typeof StyledChannelSliderLabel>>(
        {
          "data-channel": channel,
          onClick: (event: MouseEvent<HTMLLabelElement>) => {
            if (!picker.interactive) return;
            event.preventDefault();
            event.currentTarget.ownerDocument
              .getElementById(picker.ids.thumb(channel))
              ?.focus({ preventScroll: true });
          },
        } as ComponentProps<typeof StyledChannelSliderLabel>,
        props,
      )}
    />
  );
}

function ChannelSliderValueText({
  children,
  ...props
}: ComponentProps<typeof StyledChannelSliderValueText>) {
  const picker = useColorPickerContext();
  const { channel, format } = useChannel();
  return (
    <StyledChannelSliderValueText
      {...mergeProps<ComponentProps<typeof StyledChannelSliderValueText>>(
        { "data-channel": channel } as ComponentProps<typeof StyledChannelSliderValueText>,
        props,
      )}
    >
      {children ||
        formatColorChannelValue(picker.sliderValue(channel, format), channel, picker.locale)}
    </StyledChannelSliderValueText>
  );
}

export interface ColorPickerChannelInputProps extends Omit<
  ComponentProps<typeof StyledChannelInput>,
  "defaultValue" | "value"
> {
  channel: ExtendedColorChannel;
}

function ChannelInput({
  ref,
  channel,
  ...props
}: WithRef<ColorPickerChannelInputProps, HTMLInputElement>) {
  const picker = useColorPickerContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(ref, inputRef);
  const text = getChannelInputValue(picker.value, channel, picker.format);
  const textField = channel === "hex" || channel === "css";
  const range = getChannelInputRange(picker.value, channel, picker.format);

  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.value = text;
  }, [text]);

  return (
    <StyledChannelInput
      {...mergeProps<ComponentProps<typeof StyledChannelInput>>(
        {
          dir: picker.dir,
          type: textField ? "text" : "number",
          "data-channel": channel,
          "aria-label": channel,
          "aria-describedby": picker.describedBy,
          spellCheck: false,
          autoComplete: "off",
          disabled: picker.disabled,
          readOnly: picker.readOnly,
          ...stateAttributes(picker),
          defaultValue: text,
          min: range?.minValue,
          max: range?.maxValue,
          step: range?.step,
          onFocus: (event: FocusEvent<HTMLInputElement>) => {
            if (picker.interactive) event.currentTarget.select();
          },
          onBlur: (event: FocusEvent<HTMLInputElement>) => {
            if (picker.interactive) picker.commitChannelInput(event.currentTarget, channel);
          },
          onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.defaultPrevented || !picker.interactive || isComposingEvent(event)) return;
            if (event.key !== "Enter") return;
            event.preventDefault();
            picker.commitChannelInput(event.currentTarget, channel);
          },
        } as ComponentProps<typeof StyledChannelInput>,
        props,
      )}
      ref={composedRef}
    />
  );
}

function HiddenInput({ ref, ...props }: WithRef<ComponentProps<"input">, HTMLInputElement>) {
  const picker = useColorPickerContext();
  const composedRef = useComposedRefs(ref, picker.hiddenInputRef);
  return (
    <input
      {...mergeProps<ComponentProps<"input">>(
        {
          type: "text",
          "aria-hidden": true,
          "aria-describedby": picker.describedBy,
          className: hiddenInputClass,
          id: picker.ids.hiddenInput,
          name: picker.name,
          tabIndex: -1,
          disabled: picker.disabled,
          readOnly: picker.readOnly,
          required: picker.required,
          defaultValue: picker.valueAsString,
        },
        props,
      )}
      ref={composedRef}
    />
  );
}

export interface ColorPickerTransparencyGridProps extends ComponentProps<
  typeof StyledTransparencyGrid
> {
  /** The side of each checkerboard square. @default "12px" */
  size?: string | undefined;
}

function TransparencyGrid({ size, ...props }: ColorPickerTransparencyGridProps) {
  return (
    <StyledTransparencyGrid
      {...mergeProps<ComponentProps<typeof StyledTransparencyGrid>>(
        { style: { "--color-picker-grid-size": size } as Style },
        props,
      )}
    />
  );
}

function SwatchGroup(props: ComponentProps<typeof StyledSwatchGroup>) {
  return (
    <StyledSwatchGroup
      {...mergeProps<ComponentProps<typeof StyledSwatchGroup>>({ role: "group" }, props)}
    />
  );
}

function useSwatchState(value: string | Color, disabled?: boolean) {
  const picker = useColorPickerContext();
  const color = convertColor(normalizeColor(value), picker.format);
  return {
    color,
    hex: formatColor(color, "hex"),
    checked: formatColor(color, "hexa") === formatColor(picker.value, "hexa"),
    disabled: Boolean(disabled) || !picker.interactive,
  };
}

const checkedAttributes = (checked: boolean) => ({
  "data-checked": dataAttr(checked),
  "data-unchecked": dataAttr(!checked),
});

export interface ColorPickerSwatchTriggerProps extends Omit<
  ComponentProps<typeof StyledSwatchTrigger>,
  "value"
> {
  value: string | Color;
  disabled?: boolean | undefined;
}

function SwatchTrigger({ value, disabled, ...props }: ColorPickerSwatchTriggerProps) {
  const picker = useColorPickerContext();
  const swatch = useSwatchState(value, disabled);
  return (
    <StyledSwatchTrigger
      {...mergeProps<ComponentProps<typeof StyledSwatchTrigger>>(
        {
          type: "button",
          disabled: swatch.disabled,
          "aria-label": `select ${swatch.hex} as the color`,
          ...checkedAttributes(swatch.checked),
          "data-value": swatch.hex,
          "data-disabled": dataAttr(swatch.disabled),
          style: { "--color-picker-color": swatch.hex } as Style,
          onClick: (event: MouseEvent<HTMLButtonElement>) => {
            if (event.defaultPrevented || swatch.disabled) return;
            picker.pickSwatch(swatch.color, event.nativeEvent);
          },
        } as ComponentProps<typeof StyledSwatchTrigger>,
        props,
      )}
    />
  );
}

interface SwatchProps {
  value: string | Color;
  respectAlpha: boolean;
}

const SwatchContext = createContext<SwatchProps | null>(null);

export interface ColorPickerSwatchProps extends ComponentProps<typeof StyledSwatch> {
  value: string | Color;
  /** Shows the swatch's transparency; `false` paints it opaque. @default true */
  respectAlpha?: boolean | undefined;
}

function SwatchPart({
  value,
  respectAlpha = true,
  Element,
  ...props
}: ColorPickerSwatchProps & { Element: typeof StyledSwatch }) {
  const swatch = useSwatchState(value);
  const color = formatColor(swatch.color, respectAlpha ? "css" : "hex");
  return (
    <SwatchContext value={{ value, respectAlpha }}>
      <Element
        {...mergeProps<ComponentProps<typeof StyledSwatch>>(
          {
            ...checkedAttributes(swatch.checked),
            "data-value": swatch.hex,
            style: { "--color-picker-color": color } as Style,
          } as ComponentProps<typeof StyledSwatch>,
          props,
        )}
      />
    </SwatchContext>
  );
}

function Swatch(props: ColorPickerSwatchProps) {
  return (
    <SwatchPart
      {...props}
      Element={StyledSwatch}
    />
  );
}

function ValueSwatch(
  props: Omit<ComponentProps<typeof StyledValueSwatch>, "value"> & {
    respectAlpha?: boolean | undefined;
  },
) {
  const picker = useColorPickerContext();
  return (
    <SwatchPart
      {...props}
      value={picker.valueAsString}
      Element={StyledValueSwatch}
    />
  );
}

function SwatchIndicator(props: ComponentProps<typeof StyledSwatchIndicator>) {
  const swatchProps = useContext(SwatchContext);
  if (!swatchProps) {
    throw new Error("ColorPicker.SwatchIndicator must be rendered inside ColorPicker.Swatch.");
  }
  const swatch = useSwatchState(swatchProps.value);
  return (
    <StyledSwatchIndicator
      {...mergeProps<ComponentProps<typeof StyledSwatchIndicator>>(
        { hidden: !swatch.checked },
        props,
      )}
    />
  );
}

function EyeDropperTrigger(props: ComponentProps<typeof StyledEyeDropperTrigger>) {
  const picker = useColorPickerContext();
  return (
    <StyledEyeDropperTrigger
      {...mergeProps<ComponentProps<typeof StyledEyeDropperTrigger>>(
        {
          type: "button",
          disabled: picker.disabled,
          ...stateAttributes(picker),
          "aria-label": "Pick a color from the screen",
          onClick: (event: MouseEvent<HTMLButtonElement>) => {
            if (!event.defaultPrevented) picker.openEyeDropper();
          },
        },
        props,
      )}
    />
  );
}

function FormatTrigger(props: ComponentProps<typeof StyledFormatTrigger>) {
  const picker = useColorPickerContext();
  const next = getNextFormat(picker.format);
  return (
    <StyledFormatTrigger
      {...mergeProps<ComponentProps<typeof StyledFormatTrigger>>(
        {
          type: "button",
          "aria-label": `change color format to ${next}`,
          onClick: (event: MouseEvent<HTMLButtonElement>) => {
            if (event.defaultPrevented || event.currentTarget.disabled) return;
            picker.setFormat(next);
          },
        },
        props,
      )}
    />
  );
}

function FormatSelect(
  props: Omit<ComponentProps<typeof StyledFormatSelect>, "value" | "defaultValue">,
) {
  const picker = useColorPickerContext();
  return (
    <StyledFormatSelect
      {...mergeProps<ComponentProps<typeof StyledFormatSelect>>(
        {
          "aria-label": "change color format",
          dir: picker.dir,
          value: picker.format,
          disabled: picker.disabled,
          onChange: (event: ChangeEvent<HTMLSelectElement>) => {
            const next = event.currentTarget.value;
            if (isColorFormat(next)) picker.setFormat(next);
          },
        },
        props,
      )}
    >
      {FORMATS.map((format) => (
        <option
          key={format}
          value={format}
        >
          {format}
        </option>
      ))}
    </StyledFormatSelect>
  );
}

export interface ColorPickerViewProps extends ComponentProps<typeof StyledView> {
  /** The format whose controls this view holds; it shows only while that format is current. */
  format: ColorFormat;
}

function View({ format, ...props }: ColorPickerViewProps) {
  const picker = useColorPickerContext();
  if (picker.format !== format) return null;
  return (
    <ViewFormatContext value={format}>
      <StyledView
        data-format={format}
        {...props}
      />
    </ViewFormatContext>
  );
}

export interface ColorPickerProps extends Omit<ColorPickerRootProps, "children"> {
  withAlpha?: boolean;
  swatches?: string[];
}

const ColorPickerSimple = ({ withAlpha = false, swatches, ...rest }: ColorPickerProps) => (
  <Root {...rest}>
    <Control>
      <Trigger>
        <TriggerSwatch>
          <TransparencyGrid />
          <ValueSwatch />
        </TriggerSwatch>
      </Trigger>
    </Control>
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
    <HiddenInput />
  </Root>
);

export const ColorPicker = Object.assign(ColorPickerSimple, {
  Root,
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
  Swatch,
  SwatchGroup,
  SwatchIndicator,
  SwatchTrigger,
  TransparencyGrid,
  Trigger,
  ValueSwatch,
  ValueText,
  View,
});
