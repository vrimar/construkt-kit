import {
  type Color,
  type ColorChannel,
  type ColorFormat,
  convertColor,
  decrementColorChannel,
  formatColor,
  getColorChannelPercentValue,
  getColorChannelRange,
  getColorChannelValue,
  getColorChannels,
  incrementColorChannel,
  isColorEqual,
  parseColor,
  setColorChannelValue,
} from "@construkt-kit/utils";
import {
  type KeyboardEvent,
  type PointerEvent,
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import { trackPointerMove } from "../../primitives/drag";
import {
  dispatchInputValueEvent,
  useFieldControlState,
  useFormControl,
} from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { getEventStepValue, isModifierKey } from "../numberMath";
import {
  type ExtendedColorChannel,
  type Orientation,
  getChannelInputValue,
  getChannelSpace,
  prefixHex,
} from "./pickerColors";

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
  format: ColorFormat | undefined;
  orientation: Orientation;
}

type Drag = AreaDrag | SliderDrag;

interface Point {
  x: number;
  y: number;
}

interface EyeDropperConstructor {
  new (): { open: () => Promise<{ sRGBHex: string }> };
}

const DEFAULT_COLOR: Color = { format: "rgba", red: 0, green: 0, blue: 0, alpha: 1 };

const areaFormatOf = (format: ColorFormat): ColorFormat =>
  format.startsWith("hsl") ? "hsla" : "hsba";

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 1);

function rtlKey(key: string, rtl: boolean) {
  if (!rtl) return key;
  if (key === "ArrowLeft") return "ArrowRight";
  if (key === "ArrowRight") return "ArrowLeft";
  return key;
}

/** The value, format and handlers a color picker's parts share. */
export function useColorPickerState(
  options: ColorPickerStateOptions,
  popup: { open: boolean; requestClose: (event: Event) => void },
) {
  const uid = useId();
  const { dir, locale } = useLocale();
  const field = useFieldControlState({
    disabled: options.disabled,
    readOnly: options.readOnly,
    invalid: options.invalid,
    required: options.required,
  });

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
  const [dragging, setDragging] = useState(false);
  const [labelRendered, setLabelRendered] = useState(false);

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

  const latest = useLatestRef({ options, format, dir, requestClose: popup.requestClose, ids });

  function change(
    next: Color,
    reason: ColorPickerValueChangeReason,
    event?: Event,
    nextFormat = latest.current.format,
  ): boolean {
    if (isColorEqual(next, valueRef.current)) return false;
    const details = Object.assign(createChangeDetails(reason, event), {
      valueAsString: formatColor(next, nextFormat),
    });
    latest.current.options.onValueChange?.(next, details);
    if (details.canceled) return false;
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

  const { fieldsetDisabled } = useFormControl(
    rootRef,
    () => change(initialValue, "form-reset"),
    () => hiddenInputRef.current,
  );
  const disabled = field.disabled || fieldsetDisabled;
  const interactive = !(disabled || field.readOnly);
  const valueAsString = formatColor(value, format);
  const areaValue = convertColor(value, areaFormatOf(format));

  function areaColor(current: Color) {
    return convertColor(current, areaFormatOf(latest.current.format));
  }

  function sliderValue(current: Color, channel: ColorChannel, viewFormat: ColorFormat | undefined) {
    const color = convertColor(current, viewFormat ?? areaFormatOf(latest.current.format));
    if (channel === "alpha" || getColorChannels(color).includes(channel)) return color;
    return convertColor(current, getChannelSpace(color.format, channel));
  }

  function colorFromPoint(point: Point): Color | undefined {
    const drag = dragRef.current;
    if (!drag) return undefined;
    const rect = drag.element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return undefined;
    const px = rect.width > 0 ? clampPercent((point.x - rect.left) / rect.width) : 0;
    const py = rect.height > 0 ? clampPercent((point.y - rect.top) / rect.height) : 0;
    const x = latest.current.dir === "rtl" ? 1 - px : px;
    if (drag.kind === "area") {
      const color = areaColor(valueRef.current);
      const xValue = getColorChannelPercentValue(color, drag.xChannel, x);
      const yValue = getColorChannelPercentValue(color, drag.yChannel, 1 - py);
      return setColorChannelValue(
        setColorChannelValue(color, drag.xChannel, xValue),
        drag.yChannel,
        yValue,
      );
    }
    const color = sliderValue(valueRef.current, drag.channel, drag.format);
    const percent = drag.orientation === "horizontal" ? x : 1 - py;
    return setColorChannelValue(
      color,
      drag.channel,
      getColorChannelPercentValue(color, drag.channel, percent),
    );
  }

  function focusDragThumb() {
    const drag = dragRef.current;
    if (!drag) return;
    const { ids: current } = latest.current;
    const id = drag.kind === "area" ? current.areaThumb : current.thumb(drag.channel);
    const doc = drag.element.ownerDocument;
    requestAnimationFrame(() => doc.getElementById(id)?.focus({ preventScroll: true }));
  }

  function startDrag(drag: Drag, event: PointerEvent<HTMLElement>) {
    if (!interactive || event.button !== 0 || isModifierKey(event)) return;
    event.preventDefault();
    dragRef.current = drag;
    dragStartRef.current = valueRef.current;
    setDragging(true);
    const next = colorFromPoint({ x: event.clientX, y: event.clientY });
    if (next) change(next, "pointer", event.nativeEvent);
    focusDragThumb();
  }

  function endDrag(refocus: boolean) {
    if (!dragRef.current) return;
    if (refocus) focusDragThumb();
    dragRef.current = null;
    setDragging(false);
    changeEnd("pointer", dragStartRef.current);
  }

  const actions = useLatestRef({ colorFromPoint, change, endDrag });

  useEffect(() => {
    const doc = rootRef.current?.ownerDocument;
    if (!dragging || !doc) return;
    return trackPointerMove(doc, {
      onMove: (point) => {
        const next = actions.current.colorFromPoint(point);
        if (next) actions.current.change(next, "pointer");
      },
      onUp: () => actions.current.endDrag(true),
    });
  }, [dragging, actions]);

  useEffect(() => {
    if (disabled || !popup.open) actions.current.endDrag(false);
  }, [disabled, popup.open, actions]);

  const previousValueAsString = useRef(valueAsString);
  useLayoutEffect(() => {
    if (previousValueAsString.current === valueAsString) return;
    previousValueAsString.current = valueAsString;
    dispatchInputValueEvent(hiddenInputRef.current, valueAsString);
  }, [valueAsString]);

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
    switch (rtlKey(event.key, latest.current.dir === "rtl")) {
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
    viewFormat: ColorFormat | undefined,
  ) {
    if (event.defaultPrevented || !interactive) return;
    const color = sliderValue(valueRef.current, channel, viewFormat);
    const range = getColorChannelRange(color, channel);
    const step = getEventStepValue(event, { step: range.step, largeStep: range.step * 10 });
    let next: Color;
    switch (rtlKey(event.key, latest.current.dir === "rtl")) {
      case "ArrowUp":
      case "ArrowRight":
      case "PageUp":
        next = incrementColorChannel(color, channel, step);
        break;
      case "ArrowDown":
      case "ArrowLeft":
      case "PageDown":
        next = decrementColorChannel(color, channel, step);
        break;
      case "Home":
        next = setColorChannelValue(color, channel, range.minValue);
        break;
      case "End":
        next = setColorChannelValue(color, channel, range.maxValue);
        break;
      default:
        return;
    }
    event.preventDefault();
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
        next = setColorChannelValue(parsed, "alpha", current.alpha);
      } catch {
        next = current;
      }
    } else {
      const color = convertColor(current, getChannelSpace(latest.current.format, channel));
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
    dragging,
    name: options.name,
    describedBy: field.describedBy,
    labelRendered,
    setLabelRendered,
    rootRef,
    hiddenInputRef,
    getAreaChannels: (xChannel?: ColorChannel, yChannel?: ColorChannel) => {
      const channels = getColorChannels(areaValue);
      return { xChannel: xChannel ?? channels[1], yChannel: yChannel ?? channels[2] };
    },
    sliderValue: (channel: ColorChannel, viewFormat: ColorFormat | undefined) =>
      sliderValue(value, channel, viewFormat),
    startAreaDrag: (event: PointerEvent<HTMLElement>, axes: Omit<AreaDrag, "kind" | "element">) =>
      startDrag({ kind: "area", element: event.currentTarget, ...axes }, event),
    startSliderDrag: (
      event: PointerEvent<HTMLElement>,
      drag: Omit<SliderDrag, "kind" | "element">,
    ) => {
      const track = event.currentTarget.ownerDocument.getElementById(ids.track(drag.channel));
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

export const ColorPickerContext = createContext<ColorPickerState | null>(null);

export function useColorPickerContext(): ColorPickerState {
  const context = useContext(ColorPickerContext);
  if (!context) throw new Error("ColorPicker parts must be rendered inside ColorPicker.Root.");
  return context;
}
