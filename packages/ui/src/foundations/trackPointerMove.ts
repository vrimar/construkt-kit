import { holdStyle } from "./holdStyle";
import { isIOS } from "./platform";

export interface PointerMoveHandlers {
  /** Follows only this pointer; omit to follow any. */
  pointerId?: number | undefined;
  /** Keeps iOS from selecting text through the drag and just after it. @default true */
  lockSelection?: boolean | undefined;
  onMove: (point: { x: number; y: number }, event: PointerEvent) => void;
  /**
   * Runs with the event that ends the press: `pointerup`, `pointercancel`, `contextmenu`, or a
   * mouse move with no button held.
   */
  onUp: (event: PointerEvent | MouseEvent) => void;
}

export function holdTextSelection(doc: Document): () => void {
  // WebKit still selects under a page-level `user-select: text` unless both properties are held.
  const releaseUnprefixed = holdStyle(doc.documentElement, "user-select", "none");
  const releasePrefixed = holdStyle(doc.documentElement, "-webkit-user-select", "none");
  return () => {
    releasePrefixed();
    releaseUnprefixed();
  };
}

/** Keeps iOS from selecting text until just after the returned function runs. */
export function lockTextSelection(doc: Document): () => void {
  if (!isIOS()) return () => {};
  const release = holdTextSelection(doc);
  return () => setTimeout(release, 300);
}

/** Swallows the click that follows a drag's `pointerup`, so the drag doesn't also press its target. */
export function swallowNextClick(doc: Document): void {
  const swallow = (click: MouseEvent) => {
    click.stopPropagation();
    click.preventDefault();
  };
  doc.addEventListener("click", swallow, { capture: true, once: true });
  (doc.defaultView ?? window).setTimeout(
    () => doc.removeEventListener("click", swallow, { capture: true }),
    0,
  );
}

/** Follows a press on the document until it ends; returns a function that stops following it. */
export function trackPointerMove(
  doc: Document,
  { pointerId, lockSelection = true, onMove, onUp }: PointerMoveHandlers,
): () => void {
  const follows = (event: PointerEvent) => pointerId === undefined || event.pointerId === pointerId;
  const handleMove = (event: PointerEvent) => {
    if (!follows(event)) return;
    if (event.pointerType === "mouse" && event.buttons === 0) {
      onUp(event);
      return;
    }
    onMove({ x: event.clientX, y: event.clientY }, event);
  };
  const handleUp = (event: PointerEvent) => {
    if (follows(event)) onUp(event);
  };
  doc.addEventListener("pointermove", handleMove);
  doc.addEventListener("pointerup", handleUp);
  doc.addEventListener("pointercancel", handleUp);
  doc.addEventListener("contextmenu", onUp);
  const releaseSelection = lockSelection ? lockTextSelection(doc) : undefined;

  return () => {
    doc.removeEventListener("pointermove", handleMove);
    doc.removeEventListener("pointerup", handleUp);
    doc.removeEventListener("pointercancel", handleUp);
    doc.removeEventListener("contextmenu", onUp);
    releaseSelection?.();
  };
}
