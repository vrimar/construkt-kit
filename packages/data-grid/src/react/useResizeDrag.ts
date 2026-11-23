import { usePointerDrag } from "@construkt-kit/ui";
import { type PointerEventHandler, useRef } from "react";

interface ResizeDragOptions<S, T> {
  axis: "x" | "y";
  begin: () => S;
  resize: (start: S, delta: number) => T | null;
  preview: (size: T | null) => void;
  commit: (size: T) => void;
}

export function useResizeDrag<S, T>({
  axis,
  begin,
  resize,
  preview,
  commit,
}: ResizeDragOptions<S, T>): PointerEventHandler<HTMLSpanElement> {
  const resizeBy = useRef<(delta: number) => T | null>(() => null);
  const size = useRef<T | null>(null);
  const { onPointerDown } = usePointerDrag<HTMLSpanElement>({
    claimPress: true,
    activeAttribute: "data-resizing",
    onPress: () => {
      const start = begin();
      resizeBy.current = (delta) => resize(start, delta);
      size.current = null;
    },
    onMove: ({ deltaX, deltaY }) => {
      size.current = resizeBy.current(axis === "x" ? deltaX : deltaY);
      preview(size.current);
    },
    onEnd: (_, { cancelled }) => {
      if (cancelled || size.current === null) preview(null);
      else commit(size.current);
    },
  });
  return onPointerDown;
}
