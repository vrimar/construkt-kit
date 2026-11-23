const FOCUSABLE =
  "input:not([type='hidden']):not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], button:not(:disabled), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type";

const HIDDEN_VISIBILITY = new Set(["hidden", "collapse"]);

// Reads styles, not layout, where `checkVisibility` is missing, so it holds without layout (jsdom).
function isRendered(element: HTMLElement) {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility({ visibilityProperty: true });
  }
  if (HIDDEN_VISIBILITY.has(getComputedStyle(element).visibility)) return false;
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (getComputedStyle(node).display === "none") return false;
  }
  return true;
}

/** Whether `element` takes focus: a focusable kind, enabled, rendered and outside an `inert` subtree. */
export function isFocusable(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement) || element.closest("[inert]")) return false;
  return element.matches(FOCUSABLE) && isRendered(element);
}

/** Whether `target` is, or sits inside, an element that takes focus, such as a press's target. */
export function isWithinFocusable(target: EventTarget | null): boolean {
  for (let node = target instanceof Element ? target : null; node; node = node.parentElement) {
    if (isFocusable(node)) return true;
  }
  return false;
}

const tabIndexOf = (element: Element) => {
  const value = element.getAttribute("tabindex");
  return value ? Number.parseInt(value, 10) : Number.NaN;
};

function isTabbableRadio(element: HTMLElement) {
  if (!(element instanceof HTMLInputElement) || element.type !== "radio" || !element.name) {
    return true;
  }
  if (element.checked) return true;
  const scope = element.form ?? element.ownerDocument;
  const group = Array.from(
    scope.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(element.name)}"]`,
    ),
  ).filter((radio) => radio.form === element.form && isFocusable(radio));
  const checked = group.find((radio) => radio.checked);
  return checked ? checked === element : group[0] === element;
}

export function isTabbable(element: Element): element is HTMLElement {
  if (!isFocusable(element) || tabIndexOf(element) < 0) return false;
  return element.tabIndex > 0 || isTabbableRadio(element);
}

const candidates = (container: Element) => Array.from(container.querySelectorAll(FOCUSABLE));

export const getFocusables = (container: Element): HTMLElement[] =>
  candidates(container).filter(isFocusable);

/** The elements inside `container` that Tab reaches, in document order. */
export const getTabbables = (container: Element): HTMLElement[] =>
  candidates(container).filter(isTabbable);

export const hasTabbable = (container: Element): boolean => candidates(container).some(isTabbable);

export const NO_AUTOFOCUS_ATTRIBUTE = "data-no-autofocus";

const AUTOFOCUS_MARK = "[data-autofocus],[autofocus]";

export const findMarkedFocus = (root: HTMLElement): HTMLElement | null =>
  root.matches(AUTOFOCUS_MARK) ? root : root.querySelector<HTMLElement>(AUTOFOCUS_MARK);

/**
 * The `[data-autofocus]` or `[autofocus]` element in `root`, else its first tabbable that isn't
 * `[data-no-autofocus]`, or `null` when it has neither.
 */
export function findInitialFocus(root: HTMLElement): HTMLElement | null {
  return (
    findMarkedFocus(root) ??
    getTabbables(root).find((el) => !el.hasAttribute(NO_AUTOFOCUS_ATTRIBUTE)) ??
    null
  );
}

/** What a popup focuses when it opens: its `findInitialFocus` element, else the popup itself. */
export const getInitialFocus = (root: HTMLElement): HTMLElement => findInitialFocus(root) ?? root;
