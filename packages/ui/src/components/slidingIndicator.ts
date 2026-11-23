import { type CSSProperties, useLayoutEffect, useState } from "react";

import { useLatestRef } from "../hooks/useLatestRef";

interface IndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const sameRect = (a: IndicatorRect | null, b: IndicatorRect | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height);

const offsetRect = (element: HTMLElement): IndicatorRect => ({
  left: element.offsetLeft,
  top: element.offsetTop,
  width: element.offsetWidth,
  height: element.offsetHeight,
});

export interface SlidingIndicatorTarget {
  /** The selected item's element, read again on every resize. */
  selected: () => HTMLElement | null | undefined;
  /** The list and its items, whose resizes move the selected item. */
  observed: () => Iterable<HTMLElement>;
}

/**
 * The selected item's offset box as the `--indicator-left`, `-top`, `-width` and `-height` an
 * indicator slides with, measured again as `selected` or `orientation` change and as the observed
 * elements resize; hidden while there is no box.
 */
export function useSlidingIndicator(
  target: SlidingIndicatorTarget,
  selected: string | null,
  orientation: string,
) {
  const [rect, setRect] = useState<IndicatorRect | null>(null);
  const latest = useLatestRef(target);

  useLayoutEffect(() => {
    const measure = () => {
      const item = latest.current.selected();
      const next = item ? offsetRect(item) : null;
      setRect((previous) => (sameRect(previous, next) ? previous : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const element of latest.current.observed()) {
      observer.observe(element, { box: "border-box" });
    }
    return () => observer.disconnect();
  }, [latest, selected, orientation]);

  const empty =
    !rect || (rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0);
  return {
    hidden: empty,
    style: (rect
      ? {
          "--indicator-left": `${rect.left}px`,
          "--indicator-top": `${rect.top}px`,
          "--indicator-width": `${rect.width}px`,
          "--indicator-height": `${rect.height}px`,
        }
      : undefined) as CSSProperties | undefined,
  };
}
