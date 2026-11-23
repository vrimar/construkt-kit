import { clampValue } from "@construkt-kit/utils";
import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { getEventStepValue } from "../foundations/dom";
import { trackPointerMove } from "../foundations/trackPointerMove";
import { useLatestRef } from "../hooks/useLatestRef";
import { mirrorArrowKey } from "../primitives/composite";

export interface Point {
  x: number;
  y: number;
}

export type SliderOrientation = "horizontal" | "vertical";

/**
 * What a key does to a thumb's value: a signed step for every arrow and Page key, up and right
 * increasing, with left and right swapped in a horizontal right-to-left slider; Home and End jump to
 * the thumb's ends.
 */
export function getSliderKeyAction(
  event: { key: string; shiftKey: boolean; altKey: boolean },
  options: { step: number; largeStep: number; orientation: SliderOrientation; dir: "ltr" | "rtl" },
): number | "min" | "max" | undefined {
  const by = getEventStepValue(event, options);
  const mirrored = options.orientation === "horizontal" && options.dir === "rtl";
  switch (mirrorArrowKey(event.key, mirrored)) {
    case "ArrowUp":
    case "ArrowRight":
    case "PageUp":
      return by;
    case "ArrowDown":
    case "ArrowLeft":
    case "PageDown":
      return -by;
    case "Home":
      return "min";
    case "End":
      return "max";
    default:
      return undefined;
  }
}

/**
 * Where `point` falls in `rect`, from 0 to 1 on each axis: `x` from the inline start, `y` from the
 * bottom, leaving out `inset` pixels at every edge.
 */
export function getPointerPercent(
  point: Point,
  rect: DOMRect,
  { rtl, inset = 0 }: { rtl: boolean; inset?: number },
): Point {
  const width = rect.width - inset * 2;
  const height = rect.height - inset * 2;
  const x = width > 0 ? clampValue((point.x - rect.left - inset) / width, 0, 1) : 0;
  const y = height > 0 ? clampValue((point.y - rect.top - inset) / height, 0, 1) : 0;
  return { x: rtl ? 1 - x : x, y: 1 - y };
}

/** How far `point` is from the centre of `element`, so a drag that grabs a thumb keeps it under the pointer. */
export function getGrabOffset(point: Point, element: Element): Point {
  const rect = element.getBoundingClientRect();
  return { x: point.x - (rect.left + rect.width / 2), y: point.y - (rect.top + rect.height / 2) };
}

/**
 * A thumb's inline position, centred on `x` from the inline start and `y` from the bottom; `rtl`
 * must match the thumb's computed direction, which the logical inset follows.
 */
export function getThumbPlacement(
  { x, y }: { x?: string | undefined; y?: string | undefined },
  rtl: boolean,
): CSSProperties {
  const shiftX = x === undefined ? "0" : rtl ? "50%" : "-50%";
  const shiftY = y === undefined ? "0" : "50%";
  return { insetInlineStart: x, bottom: y, transform: `translate(${shiftX}, ${shiftY})` };
}

export interface SliderThumbAriaOptions {
  value: number;
  min: number;
  max: number;
  valueText?: string | undefined;
  orientation?: SliderOrientation | undefined;
  disabled: boolean;
}

/** The ARIA a slider thumb exposes, focusable unless disabled. */
export const sliderThumbAria = ({
  value,
  min,
  max,
  valueText,
  orientation,
  disabled,
}: SliderThumbAriaOptions) => ({
  role: "slider",
  tabIndex: disabled ? undefined : 0,
  "aria-disabled": disabled || undefined,
  "aria-orientation": orientation,
  "aria-valuemin": min,
  "aria-valuemax": max,
  "aria-valuenow": value,
  "aria-valuetext": valueText,
});

export interface ValueDragHandlers {
  /** The pointer's position, less the offset it grabbed the thumb at. */
  onMove: (point: Point) => void;
  /**
   * Runs once as the drag ends: `released` when the pointer lets go, `false` when `disabled` cuts it
   * short. Either way the value it reached stays.
   */
  onEnd: (released: boolean) => void;
  /** Ends a drag in progress, cut short, and keeps a new one from following the pointer. */
  disabled: boolean;
}

/** A thumb drag that follows the pointer across `elementRef`'s document until it lets go. */
export function useValueDrag(elementRef: RefObject<Element | null>, handlers: ValueDragHandlers) {
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const grabRef = useRef<Point>({ x: 0, y: 0 });
  const latest = useLatestRef(handlers);

  const end = useCallback(
    (released: boolean) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      latest.current.onEnd(released);
    },
    [latest],
  );

  useEffect(() => {
    const doc = elementRef.current?.ownerDocument;
    if (!dragging || !doc) return;
    return trackPointerMove(doc, {
      onMove: (point) => {
        const grab = grabRef.current;
        latest.current.onMove({ x: point.x - grab.x, y: point.y - grab.y });
      },
      onUp: () => end(true),
    });
  }, [dragging, elementRef, end, latest]);

  const { disabled } = handlers;
  useEffect(() => {
    if (disabled) end(false);
  }, [disabled, end]);

  return {
    dragging,
    /** Starts following the pointer, keeping it `grab` away from the thumb's centre. */
    start(grab: Point = { x: 0, y: 0 }) {
      grabRef.current = grab;
      draggingRef.current = true;
      setDragging(true);
    },
  };
}
