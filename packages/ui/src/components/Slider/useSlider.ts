import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
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
import { useFieldControlState, useFormControl } from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { dataAttr } from "../../primitives/render";
import { clampValue, getEventStepValue, isModifierKey } from "../numberMath";
import {
  type SliderBounds,
  type ThumbCollisionBehavior,
  type ThumbGeometry,
  getClosestIndex,
  getPercentValue,
  getRangeAtIndex,
  getRangeOffsets,
  getThumbOffset,
  getValuePercent,
  normalizeValues,
  resolveThumbCollision,
  selectMovableThumb,
  setValueAtIndex,
  stepThumb,
} from "./sliderMath";

export type SliderValueChangeReason = "pointer" | "keyboard" | "form-reset";

/** Why `onValueChange` was called, and a way to keep the value as it is. */
export type SliderValueChangeDetails = ChangeDetails<SliderValueChangeReason>;

export interface SliderValueChangeEndDetails {
  reason: Exclude<SliderValueChangeReason, "form-reset">;
}

export interface SliderOptions {
  /** One value per thumb. */
  value?: number[] | undefined;
  /** @default [min] */
  defaultValue?: number[] | undefined;
  onValueChange?: ((value: number[], details: SliderValueChangeDetails) => void) | undefined;
  /** Called once a drag, key press or step that changed the value is done. */
  onValueChangeEnd?: ((value: number[], details: SliderValueChangeEndDetails) => void) | undefined;
  /** Called with the focused thumb's index, or -1 once none has focus. */
  onFocusChange?: ((focusedIndex: number, details: { value: number[] }) => void) | undefined;
  /** @default 0 */
  min?: number | undefined;
  /** @default 100 */
  max?: number | undefined;
  /** @default 1 */
  step?: number | undefined;
  /** The step of Page Up, Page Down and Shift with an arrow. @default 10 × step */
  largeStep?: number | undefined;
  /** How many steps apart neighbouring thumbs stay. @default 0 */
  minStepsBetweenThumbs?: number | undefined;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical" | undefined;
  /** Where a single thumb's range starts filling from. @default "start" */
  origin?: "start" | "center" | "end" | undefined;
  /** `contain` keeps the thumbs inside the track at its ends; `center` centres them on their value. @default "contain" */
  thumbAlignment?: "contain" | "center" | undefined;
  /** What a dragged thumb does at a neighbour: stop, push it along or swap with it. @default "none" */
  thumbCollisionBehavior?: ThumbCollisionBehavior | undefined;
  /** The thumbs' size, for `contain`, when it is known up front instead of measured. */
  thumbSize?: { width: number; height: number } | undefined;
  getAriaValueText?: ((details: { value: number; index: number }) => string) | undefined;
  /** Each thumb's accessible name: one for all, or one per thumb. */
  "aria-label"?: string | string[] | undefined;
  "aria-labelledby"?: string | string[] | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  invalid?: boolean | undefined;
  /** The name the hidden inputs submit under, with `[]` appended for several thumbs. */
  name?: string | undefined;
  form?: string | undefined;
  /** The base of the parts' generated ids. */
  id?: string | undefined;
}

type Phase = "idle" | "focus" | "dragging";

interface Point {
  x: number;
  y: number;
}

const isSameValue = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export function useSlider(options: SliderOptions) {
  const {
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    orientation = "horizontal",
    origin = "start",
    thumbAlignment = "contain",
    thumbSize: thumbSizeProp,
    name,
    form,
  } = options;
  const largeStep = options.largeStep ?? 10 * step;
  const bounds: SliderBounds = { min, max, step, minStepsBetweenThumbs };
  const uid = useId();
  const id = options.id ?? uid;
  const { dir } = useLocale();
  const field = useFieldControlState({
    disabled: options.disabled,
    readOnly: options.readOnly,
    invalid: options.invalid,
  });

  const [defaultValue] = useState(() => normalizeValues(options.defaultValue ?? [min], bounds));
  const controlled =
    options.value === undefined ? undefined : normalizeValues(options.value, bounds);
  const [value, setValue] = useControllableState({ value: controlled, defaultValue });
  const [initialValue] = useState(controlled ?? defaultValue);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [focusedIndex, setFocusedIndexState] = useState(-1);
  const [measuredThumbSize, setMeasuredThumbSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [labelRendered, setLabelRendered] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const phaseRef = useRef<Phase>("idle");
  const focusedIndexRef = useRef(-1);
  const dragOffsetRef = useRef<Point | null>(null);
  const dragStartRef = useRef<number[] | null>(null);

  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  const vertical = orientation === "vertical";
  const rtl = !vertical && dir === "rtl";
  const thumbSize = thumbSizeProp ?? measuredThumbSize;
  const contain = thumbAlignment === "contain";
  const geometry: ThumbGeometry = { min, max, vertical, rtl, contain, thumbSize };
  const measuring = contain && thumbSize == null;

  const ids = {
    root: `slider:${id}`,
    control: `slider:${id}:control`,
    track: `slider:${id}:track`,
    range: `slider:${id}:range`,
    label: `slider:${id}:label`,
    valueText: `slider:${id}:value-text`,
    thumb: (index: number) => `slider:${id}:thumb:${index}`,
    hiddenInput: (index: number) => `slider:${id}:input:${index}`,
    marker: (markerValue: number) => `slider:${id}:marker:${markerValue}`,
  };

  const latest = useLatestRef({ options, bounds, geometry, dir, vertical, ids });

  function setPhase(next: Phase) {
    phaseRef.current = next;
    setPhaseState(next);
  }

  function setFocusedIndex(index: number) {
    if (focusedIndexRef.current === index) return;
    focusedIndexRef.current = index;
    setFocusedIndexState(index);
    latest.current.options.onFocusChange?.(index, { value: valueRef.current });
  }

  function change(next: number[], reason: SliderValueChangeReason, event?: Event) {
    if (isSameValue(next, valueRef.current)) return;
    const details = createChangeDetails(reason, event);
    latest.current.options.onValueChange?.(next, details);
    if (details.canceled) return;
    if (latest.current.options.value === undefined) valueRef.current = next;
    setValue(next);
  }

  function changeEnd(reason: SliderValueChangeEndDetails["reason"], from: number[]) {
    queueMicrotask(() => {
      if (isSameValue(valueRef.current, from)) return;
      latest.current.options.onValueChangeEnd?.(valueRef.current, { reason });
    });
  }

  function focusActiveThumb() {
    requestAnimationFrame(() => {
      const thumb = rootRef.current?.ownerDocument.getElementById(
        latest.current.ids.thumb(focusedIndexRef.current),
      );
      thumb?.focus({ preventScroll: true });
    });
  }

  function getPointValue(point: Point) {
    const control = controlRef.current;
    if (!control) return undefined;
    const {
      geometry: current,
      bounds: range,
      dir: direction,
      vertical: isVertical,
    } = latest.current;
    const offset = dragOffsetRef.current;
    const x = point.x - (offset?.x ?? 0);
    const y = point.y - (offset?.y ?? 0);
    const size = current.thumbSize;
    const inset = current.contain ? (isVertical ? (size?.height ?? 0) : (size?.width ?? 0)) / 2 : 0;
    const rect = control.getBoundingClientRect();
    const width = rect.width - inset * 2;
    const height = rect.height - inset * 2;
    const percentX = width > 0 ? clampValue((x - rect.left - inset) / width, 0, 1) : 0;
    const percentY = height > 0 ? clampValue((y - rect.top - inset) / height, 0, 1) : 0;
    const percent = isVertical ? 1 - percentY : direction === "rtl" ? 1 - percentX : percentX;
    return getPercentValue(percent, range.min, range.max, range.step);
  }

  function setPointerValue(point: Point, event?: Event) {
    const pointValue = getPointValue(point);
    if (pointValue == null) return;
    const index = focusedIndexRef.current;
    const result = resolveThumbCollision(
      latest.current.options.thumbCollisionBehavior ?? "none",
      index,
      pointValue,
      valueRef.current,
      latest.current.bounds,
      dragStartRef.current?.[index],
    );
    if (result.swapped) setFocusedIndex(result.index);
    change(result.values, "pointer", event);
  }

  function startDrag() {
    dragStartRef.current = valueRef.current.slice();
    setPhase("dragging");
    focusActiveThumb();
  }

  function endDrag(cancelled: boolean) {
    const from = dragStartRef.current ?? valueRef.current;
    dragOffsetRef.current = null;
    dragStartRef.current = null;
    if (cancelled) {
      setFocusedIndex(-1);
      setPhase("idle");
      return;
    }
    setPhase("focus");
    focusActiveThumb();
    changeEnd("pointer", from);
  }

  const actions = useLatestRef({ setPointerValue, endDrag });

  const { fieldsetDisabled } = useFormControl(
    rootRef,
    () => change(initialValue, "form-reset"),
    () => rootRef.current?.ownerDocument.getElementById(ids.hiddenInput(0)),
  );
  const disabled = field.disabled || fieldsetDisabled;
  const interactive = !(field.readOnly || disabled);

  useEffect(() => {
    const doc = rootRef.current?.ownerDocument;
    if (phase !== "dragging" || !doc) return;
    return trackPointerMove(doc, {
      onMove: (point) => actions.current.setPointerValue(point),
      onUp: () => actions.current.endDrag(false),
    });
  }, [phase, actions]);

  useEffect(() => {
    if (disabled && phaseRef.current === "dragging") actions.current.endDrag(true);
  }, [disabled, actions]);

  const valueKey = value.join(",");
  const previousValueKey = useRef(valueKey);
  useLayoutEffect(() => {
    if (previousValueKey.current === valueKey) return;
    previousValueKey.current = valueKey;
    const doc = rootRef.current?.ownerDocument;
    valueKey.split(",").forEach((text, index) => {
      const input = doc?.getElementById(latest.current.ids.hiddenInput(index));
      if (!(input instanceof HTMLInputElement)) return;
      input.value = text;
      input.setAttribute("value", text);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }, [valueKey, latest]);

  const thumbCount = value.length;
  useEffect(() => {
    const control = controlRef.current;
    if (!contain || thumbSizeProp || !control) return;
    const thumbs = [...control.querySelectorAll<HTMLElement>("[role=slider]")];
    const measure = (thumb: HTMLElement) => {
      const size = { width: thumb.offsetWidth, height: thumb.offsetHeight };
      setMeasuredThumbSize((previous) =>
        previous?.width === size.width && previous.height === size.height ? previous : size,
      );
    };
    thumbs.forEach(measure);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) measure(entry.target as HTMLElement);
    });
    for (const thumb of thumbs) observer.observe(thumb, { box: "border-box" });
    return () => observer.disconnect();
  }, [contain, thumbSizeProp, thumbCount]);

  const focused = phase === "focus";
  const dragging = phase === "dragging";
  const invalid = field.invalid;
  const common = {
    "data-disabled": dataAttr(disabled),
    "data-orientation": orientation,
    "data-invalid": dataAttr(invalid),
    "data-focus": dataAttr(focused),
  };
  const percents = value.map((entry) => 100 * getValuePercent(entry, min, max));
  const range = getRangeOffsets(percents, origin);
  const labelledBy = labelRendered ? ids.label : (field.labelId ?? ids.label);

  const thumbProps = (index: number) => {
    const thumbValue = value[index];
    const thumbRange = getRangeAtIndex(value, index, bounds);
    const ariaLabel = options["aria-label"];
    const ariaLabelledBy = options["aria-labelledby"];
    const offset = getThumbOffset(thumbValue, geometry);
    return {
      id: ids.thumb(index),
      role: "slider",
      tabIndex: disabled ? undefined : 0,
      draggable: false,
      "data-index": index,
      "data-disabled": dataAttr(disabled),
      "data-orientation": orientation,
      "data-focus": dataAttr(focused && focusedIndex === index),
      "data-dragging": dataAttr(dragging && focusedIndex === index),
      "data-hidden": dataAttr(measuring),
      "aria-disabled": disabled || undefined,
      "aria-label": Array.isArray(ariaLabel) ? ariaLabel[index] : ariaLabel,
      "aria-labelledby":
        (Array.isArray(ariaLabelledBy) ? ariaLabelledBy[index] : ariaLabelledBy) ?? labelledBy,
      "aria-orientation": orientation,
      "aria-valuemax": thumbRange.max,
      "aria-valuemin": thumbRange.min,
      "aria-valuenow": thumbValue,
      "aria-valuetext": options.getAriaValueText?.({ value: thumbValue, index }),
      style: (vertical
        ? { bottom: offset, transform: "translateY(50%)" }
        : {
            insetInlineStart: offset,
            transform: rtl ? "translateX(50%)" : "translateX(-50%)",
          }) satisfies CSSProperties,
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (!interactive || event.button !== 0) return;
        event.stopPropagation();
        const from = phaseRef.current;
        if (from !== "idle" && from !== "focus") return;
        const rect = event.currentTarget.getBoundingClientRect();
        dragOffsetRef.current = {
          x: event.clientX - (rect.left + rect.width / 2),
          y: event.clientY - (rect.top + rect.height / 2),
        };
        setFocusedIndex(selectMovableThumb(valueRef.current, index, max));
        startDrag();
      },
      onFocus() {
        if (!interactive || phaseRef.current !== "idle") return;
        setFocusedIndex(selectMovableThumb(valueRef.current, index, max));
        setPhase("focus");
        focusActiveThumb();
      },
      onBlur() {
        if (!interactive || phaseRef.current !== "focus") return;
        setFocusedIndex(-1);
        setPhase("idle");
      },
      onKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.defaultPrevented || !interactive || phaseRef.current !== "focus") return;
        const by = getEventStepValue(event, { step, largeStep });
        const key =
          rtl && (event.key === "ArrowLeft" || event.key === "ArrowRight")
            ? event.key === "ArrowLeft"
              ? "ArrowRight"
              : "ArrowLeft"
            : event.key;
        const active = focusedIndexRef.current;
        const current = valueRef.current;
        let next: number[] | undefined;
        if (
          (key === "ArrowUp" && vertical) ||
          (key === "ArrowRight" && !vertical) ||
          key === "PageUp"
        ) {
          next = stepThumb(current, active, 1, by, bounds);
        } else if (
          (key === "ArrowDown" && vertical) ||
          (key === "ArrowLeft" && !vertical) ||
          key === "PageDown"
        ) {
          next = stepThumb(current, active, -1, by, bounds);
        } else if (key === "Home") {
          next = setValueAtIndex(current, active, getRangeAtIndex(current, active, bounds).min);
        } else if (key === "End") {
          next = setValueAtIndex(current, active, getRangeAtIndex(current, active, bounds).max);
        } else if (
          key === "ArrowUp" ||
          key === "ArrowDown" ||
          key === "ArrowLeft" ||
          key === "ArrowRight"
        ) {
          event.preventDefault();
          event.stopPropagation();
          return;
        } else {
          return;
        }
        change(next, "keyboard", event.nativeEvent);
        changeEnd("keyboard", current);
        event.preventDefault();
        event.stopPropagation();
      },
    };
  };

  return {
    value,
    state: { disabled, invalid, focused, dragging, orientation },
    common,
    setLabelRendered,
    rootProps: {
      ref: rootRef,
      id: ids.root,
      dir,
      ...common,
      "data-dragging": dataAttr(dragging),
    },
    labelProps: {
      ...common,
      id: ids.label,
      htmlFor: ids.hiddenInput(0),
      "data-dragging": dataAttr(dragging),
      onClick(event: MouseEvent<HTMLElement>) {
        if (!interactive) return;
        event.preventDefault();
        rootRef.current?.ownerDocument.getElementById(ids.thumb(0))?.focus();
      },
    },
    controlProps: {
      ref: controlRef,
      id: ids.control,
      ...common,
      "data-dragging": dataAttr(dragging),
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (!interactive || event.button !== 0 || isModifierKey(event)) return;
        const from = phaseRef.current;
        if (from !== "idle" && from !== "focus") return;
        const point = { x: event.clientX, y: event.clientY };
        const pointValue = getPointValue(point);
        if (pointValue != null) setFocusedIndex(getClosestIndex(valueRef.current, pointValue, max));
        startDrag();
        setPointerValue(point, event.nativeEvent);
        event.preventDefault();
        event.stopPropagation();
      },
    },
    trackProps: {
      id: ids.track,
      ...common,
      "data-dragging": dataAttr(dragging),
    },
    rangeProps: {
      id: ids.range,
      ...common,
      "data-dragging": dataAttr(dragging),
      style: (vertical
        ? { bottom: range.start, top: range.end }
        : { insetInlineStart: range.start, insetInlineEnd: range.end }) satisfies CSSProperties,
    },
    valueTextProps: {
      id: ids.valueText,
      ...common,
    },
    markerGroupProps: {
      role: "presentation",
      "aria-hidden": true,
      "data-orientation": orientation,
    },
    markerProps: (markerValue: number) => {
      const offset = getThumbOffset(markerValue, geometry);
      return {
        id: ids.marker(markerValue),
        role: "presentation",
        "data-orientation": orientation,
        "data-value": markerValue,
        "data-disabled": dataAttr(disabled),
        "data-hidden": dataAttr(measuring),
        style: (vertical
          ? { bottom: offset, translate: "0% 50%" }
          : {
              insetInlineStart: offset,
              translate: rtl ? "50% 0%" : "-50% 0%",
            }) satisfies CSSProperties,
      };
    },
    thumbProps,
    hiddenInputProps: (index: number, inputName?: string) => ({
      id: ids.hiddenInput(index),
      type: "text",
      hidden: true,
      name: inputName ?? (name ? name + (value.length > 1 ? "[]" : "") : undefined),
      form,
      defaultValue: value[index],
    }),
  };
}

export type SliderApi = ReturnType<typeof useSlider>;
