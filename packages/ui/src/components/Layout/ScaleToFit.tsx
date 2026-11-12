import { useLayoutEffect, useRef, useState } from "react";

import { Box, type BoxProps } from "#styled-system/jsx";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import type { WithRef } from "../../types";

export interface ScaleToFitProps extends BoxProps {
  /** Width of the canvas the children are laid out on, in px. */
  designWidth: number;
  /** Height of the canvas the children are laid out on, in px. */
  designHeight: number;
}

interface Fit {
  scale: number;
  x: number;
  y: number;
}

// clientWidth and clientHeight round to whole px; computed sizes keep the fraction.
const paddingBoxSize = (box: HTMLElement) => {
  const style = getComputedStyle(box);
  const px = (value: string) => parseFloat(value) || 0;
  const borderBox = style.boxSizing === "border-box";
  const width =
    px(style.width) +
    (borderBox
      ? -px(style.borderLeftWidth) - px(style.borderRightWidth)
      : px(style.paddingLeft) + px(style.paddingRight));
  const height =
    px(style.height) +
    (borderBox
      ? -px(style.borderTopWidth) - px(style.borderBottomWidth)
      : px(style.paddingTop) + px(style.paddingBottom));
  return { width, height };
};

/**
 * Lays its children out on a fixed `designWidth` × `designHeight` canvas and scales the canvas to
 * fit the box, centred. The box keeps the canvas's aspect ratio unless you give it both a width
 * and a height.
 */
export const ScaleToFit = ({
  ref,
  designWidth,
  designHeight,
  children,
  style,
  ...props
}: WithRef<ScaleToFitProps>) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(boxRef, ref);
  const [fit, setFit] = useState<Fit | null>(null);
  const sizedByHeight =
    (props.height ?? props.h) !== undefined && (props.width ?? props.w) === undefined;

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const { width, height } = paddingBoxSize(box);
      const scale = Math.min(width / designWidth, height / designHeight);
      setFit({
        scale,
        x: (width - designWidth * scale) / 2,
        y: (height - designHeight * scale) / 2,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [designWidth, designHeight]);

  return (
    <Box
      ref={composedRef}
      position="relative"
      overflow="hidden"
      width={sizedByHeight ? undefined : "100%"}
      style={{ aspectRatio: `${designWidth} / ${designHeight}`, ...style }}
      {...props}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        transformOrigin="0 0"
        style={{
          width: designWidth,
          height: designHeight,
          transform: fit ? `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})` : undefined,
          visibility: fit ? undefined : "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
