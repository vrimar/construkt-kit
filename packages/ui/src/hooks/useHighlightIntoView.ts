import { type RefObject, useEffect, useRef } from "react";

import { useLatestRef } from "./useLatestRef";

export function useHighlightSource() {
  const pointerRef = useRef(false);

  return {
    pointerRef,
    handlers: {
      onKeyDownCapture: () => {
        pointerRef.current = false;
      },
      onPointerDownCapture: () => {
        pointerRef.current = true;
      },
      onPointerMoveCapture: () => {
        pointerRef.current = true;
      },
    },
  };
}

export function useHighlightIntoView(
  highlightedValue: string | null | undefined,
  pointerRef: RefObject<boolean>,
  scrollIntoView: (value: string) => void,
): void {
  const scrollRef = useLatestRef(scrollIntoView);

  useEffect(() => {
    if (highlightedValue == null || pointerRef.current) return;
    scrollRef.current(highlightedValue);
  }, [highlightedValue, pointerRef, scrollRef]);
}

export function scrollIntoViewWithin(container: Element | null, item: Element | null | undefined) {
  if (container == null || item == null || container.scrollHeight <= container.clientHeight) return;
  item.scrollIntoView({ block: "nearest" });
}
