import {
  type Middleware,
  type Placement,
  type VirtualElement,
  arrow,
  autoUpdate,
  flip,
  limitShift,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/react-dom";
import { type CSSProperties, useCallback, useLayoutEffect, useState } from "react";

export type { Placement, VirtualElement };
export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";
/** An element, or a `{ getBoundingClientRect }` to place against a point or a measured box. */
export type Anchor = Element | VirtualElement;
/** A placement, or a list whose first entry is preferred and whose rest are tried when it doesn't fit. */
export type PlacementOption = Placement | readonly [Placement, ...Placement[]];

export interface UsePositionOptions {
  open: boolean;
  placement: PlacementOption;
  anchor: Anchor | null;
  /** Distance from the anchor in px, plus half the arrow when there is one. @default 8 */
  gutter?: number | undefined;
  /** Sizes the popup to the anchor's width. */
  sameWidth?: boolean | undefined;
}

export interface Position {
  setFloating: (node: HTMLElement | null) => void;
  setArrow: (node: HTMLElement | null) => void;
  side: Side;
  align: Align;
  floatingStyle: CSSProperties;
  arrowStyle: CSSProperties;
  positioned: boolean;
}

const OVERFLOW_PADDING = 8;
const ARROW_PADDING = 4;

const roundByDpr = (value: number) => {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
};

const sizeVars = size({
  padding: OVERFLOW_PADDING,
  apply({ elements, rects, availableWidth, availableHeight }) {
    const { style } = elements.floating;
    style.setProperty("--anchor-width", `${Math.round(rects.reference.width)}px`);
    style.setProperty("--anchor-height", `${Math.round(rects.reference.height)}px`);
    style.setProperty("--available-width", `${Math.floor(availableWidth)}px`);
    style.setProperty("--available-height", `${Math.floor(availableHeight)}px`);
  },
});

interface PositionInputs {
  gutter: number;
  fallbacks: Placement[];
  arrow: HTMLElement | null;
}

// floating-ui compares middleware by function source, so inputs that change are read at compute time.
function createMiddleware(inputs: PositionInputs) {
  const transformOrigin: Middleware = {
    name: "transformOrigin",
    fn({ elements, middlewareData, placement }) {
      const { arrow: arrowEl, gutter } = inputs;
      const side = placement.split("-")[0] as Side;
      const originX = (middlewareData.arrow?.x ?? 0) + (arrowEl?.clientWidth ?? 0) / 2;
      const originY = (middlewareData.arrow?.y ?? 0) + (arrowEl?.clientHeight ?? 0) / 2;
      const sideOffset = gutter + (arrowEl?.clientHeight ?? 0) / 2;
      const origin = {
        top: `${originX}px calc(100% + ${sideOffset}px)`,
        bottom: `${originX}px ${-sideOffset}px`,
        left: `calc(100% + ${sideOffset}px) ${originY}px`,
        right: `${-sideOffset}px ${originY}px`,
      }[side];
      elements.floating.style.setProperty("--transform-origin", origin);
      return {};
    },
  };
  return {
    set(next: Partial<PositionInputs>) {
      Object.assign(inputs, next);
    },
    middleware: [
      offset(() => ({ mainAxis: inputs.gutter + (inputs.arrow?.clientHeight ?? 0) / 2 })),
      flip(() => ({
        padding: OVERFLOW_PADDING,
        fallbackPlacements: inputs.fallbacks.length ? inputs.fallbacks : undefined,
      })),
      shift({ mainAxis: true, crossAxis: false, padding: OVERFLOW_PADDING, limiter: limitShift() }),
      arrow(({ elements }) => ({
        element: inputs.arrow ?? elements.floating.ownerDocument.createElement("div"),
        padding: ARROW_PADDING,
      })),
      transformOrigin,
      sizeVars,
    ],
  };
}

/**
 * Places a popup against its anchor in the viewport, flipping and shifting it to stay visible, and
 * writes `--anchor-width`, `--anchor-height`, `--available-width`, `--available-height` and
 * `--transform-origin` on the floating element.
 */
export function usePosition({
  open,
  placement,
  anchor,
  gutter = 8,
  sameWidth = false,
}: UsePositionOptions): Position {
  const [floating, setFloating] = useState<HTMLElement | null>(null);
  const [preferred, ...fallbacks] = typeof placement === "string" ? [placement] : placement;
  const fallbackKey = fallbacks.join(" ");
  const [engine] = useState(() => createMiddleware({ gutter, fallbacks, arrow: null }));

  const {
    x,
    y,
    placement: placed,
    middlewareData,
    isPositioned,
    update,
  } = useFloating({
    // Stays positioned while it animates out, and if it reopens before it unmounts.
    open: open || floating !== null,
    placement: preferred,
    strategy: "fixed",
    middleware: engine.middleware,
    elements: { reference: anchor, floating },
    whileElementsMounted: autoUpdate,
  });

  useLayoutEffect(() => {
    engine.set({
      gutter,
      fallbacks: fallbackKey ? (fallbackKey.split(" ") as Placement[]) : [],
    });
    update();
  }, [engine, gutter, fallbackKey, update]);

  const setArrow = useCallback(
    (node: HTMLElement | null) => {
      engine.set({ arrow: node });
      update();
    },
    [engine, update],
  );

  const [side, align = "center"] = placed.split("-") as [Side, Align | undefined];
  const floatingStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: sameWidth ? "var(--anchor-width)" : undefined,
    transform: isPositioned
      ? `translate3d(${roundByDpr(x)}px, ${roundByDpr(y)}px, 0)`
      : "translate3d(0, -100vh, 0)",
  };
  const arrowData = middlewareData.arrow;
  const arrowStyle: CSSProperties = {
    left: arrowData?.x != null ? `${arrowData.x}px` : undefined,
    top: arrowData?.y != null ? `${arrowData.y}px` : undefined,
    [side]: "calc(100% + var(--arrow-offset))",
  };

  return {
    setFloating,
    setArrow,
    side,
    align,
    floatingStyle,
    arrowStyle,
    positioned: isPositioned,
  };
}
