import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/utils/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/utils/set-custom-native-drag-preview";
import { useCallback, useState } from "react";
import { flushSync } from "react-dom";

type NativeSetDragImage = Parameters<typeof setCustomNativeDragPreview>[0]["nativeSetDragImage"];

/**
 * A custom native drag image for a pragmatic-drag-and-drop `draggable`: pass
 * `onGenerateDragPreview` to it and portal the preview into `container` while it is set.
 */
export function useNativeDragPreview() {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const onGenerateDragPreview = useCallback(
    ({ nativeSetDragImage }: { nativeSetDragImage: NativeSetDragImage }) => {
      // Always a compact offset chip (never the full-row native image) so target + indicator stay visible.
      setCustomNativeDragPreview({
        nativeSetDragImage,
        getOffset: pointerOutsideOfPreview({ x: "16px", y: "8px" }),
        render: ({ container: next }) => {
          // flushSync so the portal is committed into `container` before pdnd snapshots it.
          flushSync(() => setContainer(next));
          return () => setContainer(null);
        },
      });
    },
    [],
  );

  return { container, onGenerateDragPreview };
}
