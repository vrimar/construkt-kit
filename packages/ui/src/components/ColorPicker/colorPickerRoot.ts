import {
  type Color,
  type ColorChannel,
  type ColorFormat,
  convertColor,
  decrementColorChannel,
  formatColor,
  getColorAxes,
  getColorChannelPercentValue,
  getColorChannelRange,
  getColorChannelValue,
  incrementColorChannel,
  isColorEqual,
  parseColor,
  setColorChannelValue,
} from "@construkt-kit/utils";
import {
  type KeyboardEvent,
  type PointerEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { getEventStepValue, isModifierKey, isRtl } from "../../foundations/dom";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { useRenderedParts } from "../../hooks/useRenderedParts";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import { mirrorArrowKey } from "../../primitives/composite";
import { useFormFieldState, useHiddenInputValue } from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { createPartContext } from "../partContext";
import {
  type Point,
  getGrabOffset,
  getPointerPercent,
  getSliderKeyAction,
  useValueDrag,
} from "../sliderCore";
import {
  type ExtendedColorChannel,
  type Orientation,
  getChannelInputValue,
  getChannelSpace,
  hexHasAlpha,
  prefixHex,
} from "./pickerColors";

type ColorPickerPart =
  | "label"
  | "control"
  | "hiddenInput"
  | "areaThumb"
  | `track:${ColorChannel}`
  | `thumb:${ColorChannel}`;

export type ColorPickerValueChangeReason =
  | "pointer"
  | "keyboard"
  | "channel-input"
  | "swatch-press"
  | "eye-dropper"
  | "format-change"
  | "form-reset";

/** Why `onValueChange` was called, the value as a string in the current format, and a way to keep the value as it is. */
export interface ColorPickerValueChangeDetails extends ChangeDetails<ColorPickerValueChangeReason> {
  valueAsString: string;
}

export interface ColorPickerValueChangeEndDetails {
  reason: Exclude<ColorPickerValueChangeReason, "format-change" | "form-reset">;
  valueAsString: string;
}

export interface ColorPickerStateOptions {
  value?: Color | undefined;
  /** @default parseColor("#000000") */
  defaultValue?: Color | undefined;
  /** Called on every change, as the user drags too. */
  onValueChange?: ((value: Color, details: ColorPickerValueChangeDetails) => void) | undefined;
  /**
   * Called once a drag, key press, channel input, swatch press or eye dropper pick that changed the
   * value is done.
   */
  onValueChangeEnd?:
    | ((value: Color, details: ColorPickerValueChangeEndDetails) => void)
    | undefined;
  /** The space the inputs and `valueAsString` use. */
  format?: ColorFormat | undefined;
  /** @default the space of `value` or `defaultValue` */
  defaultFormat?: ColorFormat | undefined;
  onFormatChange?: ((format: ColorFormat) => void) | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  /** The name the hidden input submits the value under. */
  name?: string | undefined;
  /** Closes the popup once a swatch is picked. @default false */
  closeOnSelect?: boolean | undefined;
}

/** Every `ColorPickerStateOptions` key, to split them off the root's props. */
export const COLOR_PICKER_STATE_KEYS = {
  value: true,
  defaultValue: true,
  onValueChange: true,
  onValueChangeEnd: true,
  format: true,
  defaultFormat: true,
  onFormatChange: true,
  disabled: true,
  readOnly: true,
  invalid: true,
  required: true,
  name: true,
  closeOnSelect: true,
} as const satisfies Record<keyof ColorPickerStateOptions, true>;

interface AreaDrag {
  kind: "area";
  element: HTMLElement;
  xChannel: ColorChannel;
  yChannel: ColorChannel;
}

interface SliderDrag {
  kind: "slider";
  element: HTMLElement;
  channel: ColorChannel;
  orientation: Orientation;
}

type Drag = AreaDrag | SliderDrag;

interface EyeDropperConstructor {
  new (): { open: () => Promise<{ sRGBHex: string }> };
}

const DEFAULT_COLOR: Color = { format: "rgba", red: 0, green: 0, blue: 0, alpha: 1 };

const areaFormatOf = (format: ColorFormat): ColorFormat =>
  format.startsWith("hsl") ? "hsla" : "hsba";

/** The value, format and handlers a color picker's parts share. */
export function useColorPickerState(
  options: ColorPickerStateOptions,
  popup: { open: boolean; requestClose: (event: Event) => void },
) {
  const uid = useId();
  const { dir, locale } = useLocale();
  const initialColor = options.value ?? options.defaultValue ?? DEFAULT_COLOR;
  const [format, setFormatState] = useControllableState<ColorFormat>({
    value: options.format,
    defaultValue: options.defaultFormat ?? initialColor.format,
  });
  const [defaultValue] = useState(() =>
    convertColor(
      options.defaultValue ?? DEFAULT_COLOR,
      options.format ?? options.defaultFormat ?? initialColor.format,
    ),
  );
  const [value, setValue] = useControllableState({ value: options.value, defaultValue });
  const [initialValue] = useState(options.value ?? defaultValue);
  const [rendered, reportRendered] = useRenderedParts<ColorPickerPart>();

  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const dragRef = useRef<Drag | null>(null);
  const dragStartRef = useRef<Color>(value);

  useLayoutEffect(() => {
    valueRef.current = value;
  });

  const ids = {
    root: `color-picker:${uid}`,
    label: `color-picker:${uid}:label`,
    control: `color-picker:${uid}:control`,
    hiddenInput: `color-picker:${uid}:hidden-input`,
    area: `color-picker:${uid}:area`,
    areaGradient: `color-picker:${uid}:area-gradient`,
    areaThumb: `color-picker:${uid}:area-thumb`,
    track: (channel: ColorChannel) => `color-picker:${uid}:slider-track:${channel}`,
    thumb: (channel: ColorChannel) => `color-picker:${uid}:slider-thumb:${channel}`,
  };

  const latest = useLatestRef({
    options,
    format,
    dir,
    requestClose: popup.requestClose,
    rendered,
  });

  function change(
    next: Color,
    reason: ColorPickerValueChangeReason,
    event?: Event,
    nextFormat = latest.current.format,
  ): boolean {
    if (isColorEqual(next, valueRef.current)) return false;
    const valueAsString = formatColor(next, nextFormat);
    if (!emitChange(latest.current.options.onValueChange, next, reason, event, { valueAsString })) {
      return false;
    }
    valueRef.current = next;
    setValue(next);
    return true;
  }

  function changeEnd(reason: ColorPickerValueChangeEndDetails["reason"], from: Color) {
    queueMicrotask(() => {
      const current = valueRef.current;
      if (isColorEqual(current, from)) return;
      latest.current.options.onValueChangeEnd?.(current, {
        reason,
        valueAsString: formatColor(current, latest.current.format),
      });
    });
  }

  function commit(next: Color, reason: ColorPickerValueChangeEndDetails["reason"], event?: Event) {
    const from = valueRef.current;
    if (change(next, reason, event)) changeEnd(reason, from);
  }

  const field = useFormFieldState(
    {
      disabled: options.disabled,
      readOnly: options.readOnly,
      invalid: options.invalid,
      required: options.required,
    },
    {
      elementRef: rootRef,
      onReset: () => change(initialValue, "form-reset"),
      input: () => hiddenInputRef.current,
    },
  );
  const { disabled } = field;
  const interactive = !(disabled || field.readOnly);
  const valueAsString = formatColor(value, format);
  const areaValue = convertColor(value, areaFormatOf(format));

  function areaColor(current: Color) {
    return convertColor(current, areaFormatOf(latest.current.format));
  }

  function sliderValue(current: Color, channel: ColorChannel) {
    return convertColor(current, getChannelSpace(latest.current.format, channel));
  }

  function colorFromPoint(point: Point): Color | undefined {
    const drag = dragRef.current;
    if (!drag) return undefined;
    const rect = drag.element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return undefined;
    const percent = getPointerPercent(point, rect, { rtl: isRtl(drag.element) });
    if (drag.kind === "area") {
      const color = areaColor(valueRef.current);
      const xValue = getColorChannelPercentValue(color, drag.xChannel, percent.x);
      const yValue = getColorChannelPercentValue(color, drag.yChannel, percent.y);
      return setColorChannelValue(
        setColorChannelValue(color, drag.xChannel, xValue),
        drag.yChannel,
        yValue,
      );
    }
    const color = sliderValue(valueRef.current, drag.channel);
    return setColorChannelValue(
      color,
      drag.channel,
      getColorChannelPercentValue(
        color,
        drag.channel,
        drag.orientation === "horizontal" ? percent.x : percent.y,
      ),
    );
  }

  const thumbOf = (drag: Drag) => {
    const part: ColorPickerPart = drag.kind === "area" ? "areaThumb" : `thumb:${drag.channel}`;
    const id = latest.current.rendered[part];
    return id === undefined ? null : drag.element.ownerDocument.getElementById(id);
  };

  function focusDragThumb() {
    const drag = dragRef.current;
    if (!drag) return;
    requestAnimationFrame(() => thumbOf(drag)?.focus({ preventScroll: true }));
  }

  const valueDrag = useValueDrag(rootRef, {
    disabled: disabled || !popup.open,
    onMove(point) {
      const next = colorFromPoint(point);
      if (next) change(next, "pointer");
    },
    onEnd(released) {
      if (released) focusDragThumb();
      dragRef.current = null;
      changeEnd("pointer", dragStartRef.current);
    },
  });

  function startDrag(drag: Drag, event: PointerEvent<HTMLElement>) {
    if (!interactive || event.button !== 0 || isModifierKey(event)) return;
    event.preventDefault();
    dragRef.current = drag;
    dragStartRef.current = valueRef.current;
    const point = { x: event.clientX, y: event.clientY };
    const thumb = thumbOf(drag);
    const grabbed = thumb && event.target instanceof Node && thumb.contains(event.target);
    valueDrag.start(grabbed ? getGrabOffset(point, thumb) : undefined);
    const next = grabbed ? undefined : colorFromPoint(point);
    if (next) change(next, "pointer", event.nativeEvent);
    focusDragThumb();
  }

  useHiddenInputValue(() => hiddenInputRef.current, valueAsString);

  function setFormat(next: ColorFormat) {
    if (next === latest.current.format) return;
    latest.current.options.onFormatChange?.(next);
    setFormatState(next);
    change(convertColor(valueRef.current, next), "format-change", undefined, next);
  }

  function onAreaKeyDown(
    event: KeyboardEvent<HTMLElement>,
    axes: { xChannel: ColorChannel; yChannel: ColorChannel },
  ) {
    if (event.defaultPrevented || !interactive) return;
    const step = getEventStepValue(event, { step: 1, largeStep: 10 });
    const color = areaColor(valueRef.current);
    let next: Color;
    switch (mirrorArrowKey(event.key, latest.current.dir === "rtl")) {
      case "ArrowLeft":
      case "PageDown":
        next = decrementColorChannel(color, axes.xChannel, step);
        break;
      case "ArrowRight":
      case "PageUp":
        next = incrementColorChannel(color, axes.xChannel, step);
        break;
      case "ArrowUp":
        next = incrementColorChannel(color, axes.yChannel, step);
        break;
      case "ArrowDown":
        next = decrementColorChannel(color, axes.yChannel, step);
        break;
      default:
        return;
    }
    event.preventDefault();
    commit(next, "keyboard", event.nativeEvent);
  }

  function onSliderKeyDown(
    event: KeyboardEvent<HTMLElement>,
    channel: ColorChannel,
    orientation: Orientation,
  ) {
    if (event.defaultPrevented || !interactive) return;
    const color = sliderValue(valueRef.current, channel);
    const range = getColorChannelRange(color, channel);
    const action = getSliderKeyAction(event, {
      step: range.step,
      largeStep: range.step * 10,
      orientation,
      dir: latest.current.dir,
    });
    if (action === undefined) return;
    event.preventDefault();
    const next =
      typeof action === "number"
        ? incrementColorChannel(color, channel, action)
        : setColorChannelValue(color, channel, action === "min" ? range.minValue : range.maxValue);
    commit(next, "keyboard", event.nativeEvent);
  }

  function commitChannelInput(input: HTMLInputElement, channel: ExtendedColorChannel) {
    const current = valueRef.current;
    let next: Color;
    if (channel === "alpha") {
      const alpha = Number.parseFloat(input.value);
      next = setColorChannelValue(current, "alpha", Number.isNaN(alpha) ? current.alpha : alpha);
    } else if (channel === "hex" || channel === "css") {
      try {
        const parsed = parseColor(channel === "hex" ? prefixHex(input.value) : input.value);
        next =
          channel === "hex" && !hexHasAlpha(input.value)
            ? setColorChannelValue(parsed, "alpha", current.alpha)
            : parsed;
      } catch {
        next = current;
      }
    } else {
      const color = sliderValue(current, channel);
      const typed = input.valueAsNumber;
      next = setColorChannelValue(
        color,
        channel,
        Number.isNaN(typed) ? getColorChannelValue(color, channel) : typed,
      );
    }
    input.value = getChannelInputValue(next, channel, latest.current.format);
    commit(next, "channel-input");
  }

  function pickSwatch(color: Color, event: Event) {
    commit(convertColor(color, latest.current.format), "swatch-press", event);
    if (latest.current.options.closeOnSelect) latest.current.requestClose(event);
  }

  function openEyeDropper() {
    const view = rootRef.current?.ownerDocument.defaultView;
    const EyeDropper = (view as { EyeDropper?: EyeDropperConstructor } | null | undefined)
      ?.EyeDropper;
    if (!interactive || !EyeDropper) return;
    new EyeDropper()
      .open()
      .then(({ sRGBHex }) => {
        commit(convertColor(parseColor(sRGBHex), valueRef.current.format), "eye-dropper");
      })
      .catch(() => undefined);
  }

  return {
    ids,
    dir,
    locale,
    value,
    valueAsString,
    areaValue,
    format,
    setFormat,
    disabled,
    readOnly: field.readOnly,
    invalid: field.invalid,
    required: field.required,
    interactive,
    dragging: valueDrag.dragging,
    name: options.name,
    describedBy: field.describedBy,
    rendered,
    reportRendered,
    rootRef,
    hiddenInputRef,
    getAreaChannels: (xChannel?: ColorChannel, yChannel?: ColorChannel) => {
      const axes = getColorAxes(areaValue, { xChannel, yChannel });
      return { xChannel: axes.xChannel, yChannel: axes.yChannel };
    },
    sliderValue: (channel: ColorChannel) => convertColor(value, getChannelSpace(format, channel)),
    startAreaDrag: (event: PointerEvent<HTMLElement>, axes: Omit<AreaDrag, "kind" | "element">) =>
      startDrag({ kind: "area", element: event.currentTarget, ...axes }, event),
    startSliderDrag: (
      event: PointerEvent<HTMLElement>,
      drag: Omit<SliderDrag, "kind" | "element">,
    ) => {
      const trackId = rendered[`track:${drag.channel}`];
      const track =
        trackId === undefined ? null : event.currentTarget.ownerDocument.getElementById(trackId);
      startDrag({ kind: "slider", element: track ?? event.currentTarget, ...drag }, event);
    },
    onAreaKeyDown,
    onSliderKeyDown,
    commitChannelInput,
    pickSwatch,
    openEyeDropper,
  };
}

export type ColorPickerState = ReturnType<typeof useColorPickerState>;

export const [ColorPickerContext, useColorPickerContext] = createPartContext<ColorPickerState>(
  "<ColorPicker.Root>",
  "ColorPicker parts",
);
