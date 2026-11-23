import { cssLengthToPx } from "../../foundations/cssSize";

export type ScrollAxis = "x" | "y";

function getScrollPadding(element: HTMLElement, axis: ScrollAxis) {
  const style = getComputedStyle(element);
  const size = axis === "x" ? element.offsetWidth : element.offsetHeight;
  const [before, after] = axis === "x" ? ["left", "right"] : ["top", "bottom"];
  const read = (side: string) =>
    cssLengthToPx(style.getPropertyValue(`scroll-padding-${side}`), element, size) ?? 0;
  return { before: read(before), after: read(after) };
}

function getScale(element: HTMLElement, axis: ScrollAxis): number {
  const rect = element.getBoundingClientRect();
  const hasTransform =
    Math.round(rect.width) !== element.offsetWidth ||
    Math.round(rect.height) !== element.offsetHeight;
  if (!hasTransform) return 1;
  const scale =
    axis === "x"
      ? Math.round(rect.width) / element.offsetWidth
      : Math.round(rect.height) / element.offsetHeight;
  return scale && Number.isFinite(scale) ? scale : 1;
}

/**
 * The scroll offsets along `axis` that `element`'s children snap to, from their
 * `scroll-snap-align` and the scroller's `scroll-padding`, in the scroller's own `scrollLeft` or
 * `scrollTop` terms (negative in a right-to-left scroller that counts down from 0).
 */
export function getScrollSnapPositions(element: HTMLElement, axis: ScrollAxis): number[] {
  const rtl = axis === "x" && getComputedStyle(element).direction === "rtl";
  const padding = getScrollPadding(element, axis);
  const scale = getScale(element, axis);
  const parentRect = element.getBoundingClientRect();
  const layoutSize = axis === "x" ? element.offsetWidth : element.offsetHeight;
  const maxScroll =
    axis === "x"
      ? element.scrollWidth - element.offsetWidth
      : element.scrollHeight - element.offsetHeight;
  const scrolled = axis === "x" ? element.scrollLeft : element.scrollTop;
  const [start, end, size] =
    axis === "x" ? (["left", "right", "width"] as const) : (["top", "bottom", "height"] as const);
  const crossAxisIntersects = (rect: DOMRect) =>
    axis === "x"
      ? parentRect.bottom >= rect.top && parentRect.top <= rect.bottom
      : parentRect.right >= rect.left && parentRect.left <= rect.right;

  const positions: number[] = [];
  for (const child of element.children) {
    const rect = child.getBoundingClientRect();
    if (!crossAxisIntersects(rect)) continue;
    const [alignY, alignX = alignY] = getComputedStyle(child)
      .getPropertyValue("scroll-snap-align")
      .split(" ");
    const align = axis === "x" ? alignX : alignY;
    const offsetStart = rtl
      ? (parentRect[end] - rect[end]) / scale + Math.abs(scrolled)
      : (rect[start] - parentRect[start]) / scale + scrolled;
    const childSize = rect[size] / scale;
    let position: number;
    if (align === "start") {
      position = offsetStart - (rtl ? padding.after : padding.before);
    } else if (align === "center") {
      position = offsetStart + childSize / 2 - layoutSize / 2;
    } else if (align === "end") {
      position = offsetStart + childSize - layoutSize + (rtl ? padding.before : padding.after);
    } else {
      continue;
    }
    positions.push(Math.max(0, Math.min(maxScroll, position)));
  }

  const unique = [...new Set(positions)];
  return rtl && element.scrollLeft <= 0 ? unique.map((position) => -position) : unique;
}

export const resolveSlidesPerMove = (slidesPerMove: number | "auto", slidesPerPage: number) =>
  slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove;

/** One placeholder snap point per page until the carousel can measure its slides. */
export function getPageSnapPoints(
  slideCount: number,
  slidesPerMove: number | "auto",
  slidesPerPage: number,
): number[] {
  const perMove = resolveSlidesPerMove(slidesPerMove, slidesPerPage);
  if (slidesPerPage <= 0 || perMove <= 0) return [];
  const points: number[] = [];
  for (let index = 0; index + slidesPerPage <= slideCount; index += perMove) points.push(index);
  return points;
}
