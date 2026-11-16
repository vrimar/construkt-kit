export interface EdgeAutoScrollInset {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface EdgeAutoScrollOptions {
  /** Scroll container that scrolls while the pointer is near or past its edges. */
  element: HTMLElement | null | undefined;
  /** Moves each edge zone inward, past sticky bands such as a header or pinned columns. A function is read every frame. */
  inset?: EdgeAutoScrollInset | (() => EdgeAutoScrollInset);
  /** Axes it scrolls. Defaults to `"both"`. */
  axis?: "x" | "y" | "both";
  /** Depth of each edge zone in px. Defaults to `40`. */
  edge?: number;
  /** Speed at the edge and beyond, in px per 60Hz frame. Defaults to `20`. */
  maxSpeed?: number;
}

export interface EdgeAutoScroll {
  /** Records the pointer's viewport position and starts scrolling if it is in an edge zone. */
  update: (clientX: number, clientY: number) => void;
  /** Stops scrolling until the next `update`. */
  stop: () => void;
}

const FRAME_MS = 1000 / 60;
const DEFAULT_EDGE = 40;
const DEFAULT_MAX_SPEED = 20;
const NO_INSET: EdgeAutoScrollInset = {};

const edgeVelocity = (position: number, start: number, end: number, edge: number, max: number) => {
  if (position < start + edge) return -max * Math.min(1, (start + edge - position) / edge);
  if (position > end - edge) return max * Math.min(1, (position - end + edge) / edge);
  return 0;
};

const wholePixels = (value: number) =>
  value === 0 ? 0 : Math.sign(value) * Math.max(1, Math.round(Math.abs(value)));

/**
 * Scrolls a container while the pointer is near or past its edges, one step per animation frame of
 * the container's window. Speed ramps up across each edge zone, scales with frame time and moves at
 * least a whole pixel. Feed it positions from pointer moves or HTML5 `dragover` events; it keeps
 * scrolling between them, and `onScroll` runs after each step that moved the container, so the
 * caller can re-hit-test under a pointer that has not moved. `options` given as a function is read
 * every frame; returning `undefined` pauses scrolling.
 */
export function createEdgeAutoScroll(
  options: EdgeAutoScrollOptions | (() => EdgeAutoScrollOptions | undefined),
  onScroll?: () => void,
): EdgeAutoScroll {
  const read = typeof options === "function" ? options : () => options;
  let clientX = 0;
  let clientY = 0;
  let frame = 0;
  let lastTime = 0;
  let view: Window | null = null;

  const velocity = (element: HTMLElement, current: EdgeAutoScrollOptions) => {
    const rect = element.getBoundingClientRect();
    const inset =
      (typeof current.inset === "function" ? current.inset() : current.inset) ?? NO_INSET;
    const edge = current.edge ?? DEFAULT_EDGE;
    const max = current.maxSpeed ?? DEFAULT_MAX_SPEED;
    const axis = current.axis ?? "both";
    const left = rect.left + (inset.left ?? 0);
    const right = rect.right - (inset.right ?? 0);
    const top = rect.top + (inset.top ?? 0);
    const bottom = rect.bottom - (inset.bottom ?? 0);
    return {
      x: axis === "y" ? 0 : edgeVelocity(clientX, left, right, edge, max),
      y: axis === "x" ? 0 : edgeVelocity(clientY, top, bottom, edge, max),
    };
  };

  const schedule = (element: HTMLElement) => {
    view = element.ownerDocument.defaultView ?? window;
    frame = view.requestAnimationFrame(tick);
  };

  function tick(time: number) {
    frame = 0;
    const current = read();
    const element = current?.element;
    const { x, y } = current && element ? velocity(element, current) : { x: 0, y: 0 };
    if (!element || (x === 0 && y === 0)) {
      lastTime = 0;
      return;
    }
    const scale = lastTime ? Math.min(4, (time - lastTime) / FRAME_MS) : 1;
    lastTime = time;
    const { scrollLeft, scrollTop } = element;
    element.scrollBy({
      left: wholePixels(x * scale),
      top: wholePixels(y * scale),
      behavior: "instant",
    });
    if (element.scrollLeft !== scrollLeft || element.scrollTop !== scrollTop) onScroll?.();
    schedule(element);
  }

  return {
    update: (nextX, nextY) => {
      clientX = nextX;
      clientY = nextY;
      if (frame) return;
      const element = read()?.element;
      if (element) schedule(element);
    },
    stop: () => {
      if (frame) view?.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    },
  };
}
