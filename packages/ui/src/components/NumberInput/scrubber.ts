import { holdStyle } from "../../foundations/holdStyle";
import { isSafari } from "../../foundations/platform";
import { holdTextSelection } from "../../foundations/trackPointerMove";

export interface ScrubPoint {
  x: number;
  y: number;
}

const roundToDpr = (value: number, dpr: number) => Math.floor(value * dpr + 0.5) / dpr;

const wrap = (value: number, max: number) => ((value % max) + max) % max;

/** Where the virtual cursor starts: centred on the press. */
export function getScrubStart(event: MouseEvent): ScrubPoint {
  const dpr = (event.view ?? window).devicePixelRatio;
  const half = roundToDpr(7.5, dpr);
  return { x: event.clientX - half, y: event.clientY - half };
}

/** Which way a locked mouse move scrubs, and where it moves the virtual cursor, wrapping at the edges. */
export function getScrubMove(event: MouseEvent, point: ScrubPoint, rtl: boolean) {
  const view = event.view ?? window;
  const dpr = view.devicePixelRatio;
  const x = roundToDpr(event.movementX, dpr);
  const y = roundToDpr(event.movementY, dpr);

  let hint: "increment" | "decrement" | null = x > 0 ? "increment" : x < 0 ? "decrement" : null;
  if (rtl && hint) hint = hint === "increment" ? "decrement" : "increment";

  const half = roundToDpr(7.5, dpr);
  const next = { x: wrap(point.x + x + half, view.innerWidth) - half, y: point.y + y };
  return { hint, point: next };
}

const CURSOR_SVG = `
  <svg width="46" height="15" style="left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);">
    <g transform="translate(2 3)">
      <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z" style="stroke-width: 2px; stroke: white;"></path>
      <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z"></path>
    </g>
  </svg>`;

/**
 * Locks the pointer, draws a stand-in cursor and blocks text selection while a scrub runs, and
 * returns a cleanup and a way to move the stand-in. Safari keeps its own cursor and no lock.
 */
export function startScrub(doc: Document, point: ScrubPoint) {
  const cleanups: Array<() => void> = [];
  let cursor: HTMLDivElement | null = null;

  if (!isSafari()) {
    if ("pointerLockElement" in doc) {
      Promise.resolve()
        .then(() => doc.body.requestPointerLock())
        .catch(() => {});
      cleanups.push(() => doc.exitPointerLock());
    }

    cursor = doc.createElement("div");
    cursor.className = "scrubber--cursor";
    Object.assign(cursor.style, {
      width: "15px",
      height: "15px",
      position: "fixed",
      pointerEvents: "none",
      left: "0px",
      top: "0px",
      zIndex: "2147483647",
      transform: `translate3d(${point.x}px, ${point.y}px, 0px)`,
      willChange: "transform",
    });
    cursor.innerHTML = CURSOR_SVG;
    doc.body.appendChild(cursor);
    const added = cursor;
    cleanups.push(() => added.remove());
  }

  cleanups.push(
    holdStyle(doc.body, "pointer-events", "none"),
    holdTextSelection(doc),
    holdStyle(doc.documentElement, "cursor", "ew-resize"),
  );

  return {
    move(next: ScrubPoint) {
      if (cursor) cursor.style.transform = `translate3d(${next.x}px, ${next.y}px, 0px)`;
    },
    stop() {
      for (const cleanup of cleanups.reverse()) cleanup();
    },
  };
}
