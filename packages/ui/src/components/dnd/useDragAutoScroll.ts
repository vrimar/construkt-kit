import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import { useEffect } from "react";

import { createEdgeAutoScroll } from "../../hooks/edgeAutoScroll";
import { useLatestRef } from "../../hooks/useLatestRef";

type CanScroll = NonNullable<Parameters<typeof monitorForElements>[0]["canMonitor"]>;
type MaxScrollSpeed = "standard" | "fast";

const MAX_SPEED: Record<MaxScrollSpeed, number> = { standard: 15, fast: 25 };

interface DragAutoScrollOptions {
  /** Scroll container to auto-scroll near its edges during a drag. */
  element: Element | null | undefined;
  axis: "vertical" | "horizontal";
  disabled: boolean;
  maxScrollSpeed?: MaxScrollSpeed;
  /** Whether a drag scrolls `element`. */
  canScroll: CanScroll;
}

/** Edge auto-scroll; re-binds when the scroll element mounts or changes. */
export function useDragAutoScroll({
  element,
  axis,
  disabled,
  maxScrollSpeed = "standard",
  canScroll,
}: DragAutoScrollOptions) {
  const options = useLatestRef({ maxScrollSpeed, canScroll });

  useEffect(() => {
    if (disabled || !element) return;
    const edgeScroll = createEdgeAutoScroll(() => ({
      element: element as HTMLElement,
      axis: axis === "vertical" ? "y" : "x",
      maxSpeed: MAX_SPEED[options.current.maxScrollSpeed],
    }));
    const stopMonitoring = monitorForElements({
      canMonitor: (args) => options.current.canScroll(args),
      onDrag: ({ location }) => {
        const { clientX, clientY } = location.current.input;
        edgeScroll.update(clientX, clientY);
      },
      onDrop: () => edgeScroll.stop(),
    });
    return () => {
      stopMonitoring();
      edgeScroll.stop();
    };
  }, [disabled, element, axis, options]);
}
