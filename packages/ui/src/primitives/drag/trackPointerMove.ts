import { holdTextSelection } from "./holdStyle";

export interface PointerMoveHandlers {
  onMove: (point: { x: number; y: number }) => void;
  onUp: () => void;
}

const isIOS = () =>
  /^(iPhone|iPad)/i.test(navigator.platform) ||
  (/^Mac/i.test(navigator.platform) && navigator.maxTouchPoints > 1);

/** `onUp` also runs on cancel, context menu, or a mouse move with no button held. */
export function trackPointerMove(doc: Document, { onMove, onUp }: PointerMoveHandlers): () => void {
  const handleMove = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.buttons === 0) {
      onUp();
      return;
    }
    onMove({ x: event.clientX, y: event.clientY });
  };
  doc.addEventListener("pointermove", handleMove);
  doc.addEventListener("pointerup", onUp);
  doc.addEventListener("pointercancel", onUp);
  doc.addEventListener("contextmenu", onUp);
  const releaseSelection = isIOS() ? holdTextSelection(doc) : undefined;

  return () => {
    doc.removeEventListener("pointermove", handleMove);
    doc.removeEventListener("pointerup", onUp);
    doc.removeEventListener("pointercancel", onUp);
    doc.removeEventListener("contextmenu", onUp);
    // iOS starts a text selection from the release unless the lock outlives it.
    if (releaseSelection) setTimeout(releaseSelection, 300);
  };
}
