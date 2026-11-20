export type DismissReason = "escape-key" | "outside-press" | "focus-out";

export interface Layer {
  readonly parent: Layer | null;
  /** The element of a popup, menu or dialog; `null` for a layer that isn't an overlay, such as a tooltip. */
  readonly overlayElement: (() => Element | null) | null;
  /** The `<dialog>` a modal layer shows with `showModal()`; `null` for an anchored layer. */
  modalElement: () => HTMLElement | null;
  /** Whether `target` is part of this layer itself: its popup, trigger or anchor. */
  contains: (target: Node) => boolean;
  /** Asks the layer to close; returns whether it did. */
  dismiss: (reason: DismissReason, event: Event) => boolean;
}

interface EscapeFallback {
  scope: Layer | null;
  handle: (event: KeyboardEvent) => boolean;
}

const stack: Layer[] = [];
const escapeFallbacks: EscapeFallback[] = [];
const branches = new Set<Element>();
const pressStartedOutside = new Set<Layer>();
const closedByPress = new Set<Layer>();
// Kept past a layer's close, so a kit <dialog> still animating out never reads as the page's own.
const kitModals = new WeakSet<Element>();
const stackListeners = new Set<() => void>();
const settleListeners = new Set<() => void>();
let topmostModal: HTMLElement | null = null;
let closingOverlays = 0;

const descendsFrom = (layer: Layer, ancestor: Layer) => {
  for (let parent = layer.parent; parent; parent = parent.parent) {
    if (parent === ancestor) return true;
  }
  return false;
};

function someComposedHost(target: Node, test: (node: Node) => boolean): boolean {
  for (let node: Node | null = target; node;) {
    if (test(node)) return true;
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return false;
}

const branchContains = (node: Node) => [...branches].some((branch) => branch.contains(node));

const isInBranch = (target: Node) => someComposedHost(target, branchContains);

/**
 * Makes `element` count as part of every open layer, so a press, focus or Escape inside it
 * dismisses none of them, without making it a layer itself. Returns the function that undoes it.
 */
export function registerLayerBranch(element: Element): () => void {
  branches.add(element);
  return () => {
    branches.delete(element);
  };
}

/** Whether `target` is inside `layer`, any open layer nested in it, or a layer branch, across shadow roots. */
export const isWithinLayer = (layer: Layer, target: Node): boolean =>
  someComposedHost(
    target,
    (node) =>
      branchContains(node) ||
      layer.contains(node) ||
      stack.some((other) => other !== layer && descendsFrom(other, layer) && other.contains(node)),
  );

/** Whether `layer` is the open layer Escape goes to. */
export const isTopmostLayer = (layer: Layer): boolean => stack.at(-1) === layer;

/** How many open modal layers are nested in `layer`. */
export const countNestedModals = (layer: Layer): number =>
  stack.filter((other) => other.modalElement() !== null && descendsFrom(other, layer)).length;

/** The `<dialog>` of the topmost open modal layer, or `null` when none is open. */
export const getTopmostModal = (): HTMLElement | null => topmostModal;

/** Whether a popup, menu or dialog is open, leaving out any inside `except` or holding it. */
export const hasOpenOverlay = (except?: Element | null): boolean =>
  stack.some((layer) => {
    if (layer.overlayElement === null) return false;
    const element = layer.overlayElement();
    return !except || !element || !(except.contains(element) || element.contains(except));
  });

/** Counts an overlay as closing until the returned function runs. */
export function holdOverlayClose(): () => void {
  closingOverlays += 1;
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    closingOverlays -= 1;
    if (closingOverlays === 0) for (const listener of [...settleListeners]) listener();
  };
}

/**
 * Runs `fn` once the overlays closing by the next frame, such as the menu whose item called it,
 * have left the page and handed focus back. Returns a function that cancels it.
 */
export function whenOverlaysSettle(fn: () => void): () => void {
  let pending = true;
  const run = () => {
    if (!pending) return;
    pending = false;
    settleListeners.delete(run);
    fn();
  };
  const frame = requestAnimationFrame(() => {
    if (closingOverlays === 0) run();
    else settleListeners.add(run);
  });
  return () => {
    pending = false;
    cancelAnimationFrame(frame);
    settleListeners.delete(run);
  };
}

/** Calls `listener` whenever a layer opens or closes; returns the unsubscribe function. */
export function subscribeLayers(listener: () => void): () => void {
  stackListeners.add(listener);
  return () => {
    stackListeners.delete(listener);
  };
}

function notify() {
  topmostModal = null;
  for (const layer of stack) {
    const modal = layer.modalElement();
    if (modal) kitModals.add(modal);
    topmostModal = modal ?? topmostModal;
  }
  for (const listener of [...stackListeners]) listener();
}

const eventTarget = (event: Event) => {
  const [target] = event.composedPath();
  return target instanceof Node ? target : null;
};

const fallBackOnEscape = (scope: Layer | null, event: KeyboardEvent) =>
  [...escapeFallbacks]
    .reverse()
    .some((fallback) => fallback.scope === scope && fallback.handle(event));

function isUnderPageModal(layer: Layer, target: Node | null) {
  // A layer with no element of its own, such as a tooltip, sits where focus is.
  const element = layer.overlayElement?.() ?? layer.modalElement();
  const holds = (dialog: Element, node: Node | null) =>
    node !== null && someComposedHost(node, (host) => dialog.contains(host));
  return [...document.querySelectorAll("dialog:modal")].some(
    (dialog) =>
      !kitModals.has(dialog) &&
      !holds(dialog, element ?? target) &&
      ((element?.contains(dialog) ?? false) || holds(dialog, target)),
  );
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.isComposing || event.defaultPrevented) return;
  const target = eventTarget(event);
  const topmost = stack.at(-1) ?? null;
  if (topmost && isUnderPageModal(topmost, target)) return;
  const dismissed =
    !(target && isInBranch(target)) &&
    (fallBackOnEscape(topmost, event) || (topmost?.dismiss("escape-key", event) ?? false));
  // An Escape left to the browser closes the topmost modal <dialog> behind the layer stack's back.
  if (dismissed || topmostModal !== null) event.preventDefault();
}

function isScrollbarPress(event: PointerEvent, target: Node) {
  if (!(target instanceof HTMLElement) || event.pointerType === "touch") return false;
  const style = getComputedStyle(target);
  const root = target === target.ownerDocument.documentElement;
  const scrollableX = root || /auto|scroll/.test(style.overflowX);
  const scrollableY = root || /auto|scroll/.test(style.overflowY);
  const canScrollX =
    scrollableX && target.clientWidth > 0 && target.scrollWidth > target.clientWidth;
  const canScrollY =
    scrollableY && target.clientHeight > 0 && target.scrollHeight > target.clientHeight;
  const pressedVertical =
    canScrollY &&
    (style.direction === "rtl"
      ? event.offsetX <= target.offsetWidth - target.clientWidth
      : event.offsetX > target.clientWidth);
  return pressedVertical || (canScrollX && event.offsetY > target.clientHeight);
}

function endPress() {
  pressStartedOutside.clear();
  closedByPress.clear();
}

function onPointerDown(event: PointerEvent) {
  endPress();
  const target = eventTarget(event);
  if (event.button !== 0 || !target || isScrollbarPress(event, target)) return;
  let lowestReached = 0;
  for (let index = stack.length - 1; index >= 0; index--) {
    const layer = stack[index];
    if (isWithinLayer(layer, target)) {
      lowestReached = index + 1;
      break;
    }
    if (layer.modalElement() !== null) {
      lowestReached = index;
      break;
    }
  }
  for (const layer of stack.slice(lowestReached)) pressStartedOutside.add(layer);
}

function onPointerUp(event: PointerEvent) {
  const target = eventTarget(event);
  const pressed = [...pressStartedOutside];
  const closedByFocusOut = new Set(closedByPress);
  endPress();
  if (!target) return;
  const takenBy: Layer[] = [];
  for (const layer of pressed.reverse()) {
    if (takenBy.some((above) => descendsFrom(above, layer))) continue;
    const closed = closedByFocusOut.has(layer);
    // Closed mid-press for another reason, such as the pointer leaving a submenu: it has no say.
    if (!closed && !stack.includes(layer)) continue;
    if (layer.overlayElement !== null) takenBy.push(layer);
    if (!closed && !isWithinLayer(layer, target)) layer.dismiss("outside-press", event);
  }
}

function onFocusIn(event: FocusEvent) {
  const target = eventTarget(event);
  if (!target) return;
  for (const layer of [...stack].reverse()) {
    if (isWithinLayer(layer, target) || !layer.dismiss("focus-out", event)) continue;
    if (pressStartedOutside.has(layer)) closedByPress.add(layer);
  }
}

const listeners = [
  ["keydown", onKeyDown, false],
  ["pointerdown", onPointerDown, true],
  ["pointerup", onPointerUp, true],
  ["pointercancel", endPress, true],
  ["focusin", onFocusIn, false],
] as const;

const isListening = () => stack.length > 0 || escapeFallbacks.length > 0;

function listen(add: boolean) {
  for (const [type, listener, capture] of listeners) {
    if (add) document.addEventListener(type, listener as EventListener, capture);
    else document.removeEventListener(type, listener as EventListener, capture);
  }
}

function track<T>(list: T[], item: T): () => void {
  if (!isListening()) listen(true);
  list.push(item);
  return () => {
    const index = list.indexOf(item);
    if (index !== -1) list.splice(index, 1);
    if (!isListening()) listen(false);
  };
}

/** Puts `layer` on top of the stack; the returned function takes it off again. */
export function pushLayer(layer: Layer): () => void {
  const untrack = track(stack, layer);
  notify();
  return () => {
    untrack();
    if (stack.length === 0) endPress();
    notify();
  };
}

/**
 * Offers Escape to `handle`, before `scope` itself, while no open layer sits above `scope` (`null`
 * for the page). `handle` returns whether it took it. Returns the function that undoes it.
 */
export function registerEscapeFallback(
  scope: Layer | null,
  handle: (event: KeyboardEvent) => boolean,
): () => void {
  return track(escapeFallbacks, { scope, handle });
}
