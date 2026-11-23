import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { isMacPlatform } from "./platform";

/** Whether a keydown belongs to an IME composition, so it must not act as a shortcut or Enter. */
export function isComposingEvent(event: KeyboardEvent | ReactKeyboardEvent): boolean {
  const native = "nativeEvent" in event ? event.nativeEvent : event;
  // WebKit sends the IME-confirming keydown with isComposing false but keyCode 229.
  return native.isComposing || native.keyCode === 229;
}

const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const EDITING_HOST_VALUES = new Set(["", "true", "plaintext-only"]);

// jsdom has no `isContentEditable`, so there the nearest `contenteditable` attribute decides.
const isContentEditable = (element: HTMLElement) =>
  typeof element.isContentEditable === "boolean"
    ? element.isContentEditable
    : EDITING_HOST_VALUES.has(
        element.closest("[contenteditable]")?.getAttribute("contenteditable") ?? "false",
      );

/** Whether `target` takes typed keys: a text-like input, a textarea, a select or editable content. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (isContentEditable(target)) return true;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(target.type);
  return target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

const BUTTON_INPUT_TYPES = new Set(["button", "checkbox", "image", "radio", "reset", "submit"]);

/** Whether presses and arrow keys edit `element` rather than activate or check it. */
export function isEditingControl(element: Element): boolean {
  if (element instanceof HTMLInputElement) return !BUTTON_INPUT_TYPES.has(element.type);
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true;
  return element instanceof HTMLElement && isContentEditable(element);
}

/** Whether arrow keys on `target` act on it, so a widget around it must leave them alone. */
export const ownsArrowKeys = (target: EventTarget | null): boolean =>
  target instanceof Element &&
  (isEditingControl(target) || (target instanceof HTMLInputElement && target.type === "radio"));

export function isRtl(element: Element): boolean {
  return getComputedStyle(element).direction === "rtl";
}

export const isAriaTrue = (value: boolean | string | undefined): boolean =>
  value === true || value === "true";

export const isModifierKey = (event: { ctrlKey: boolean; altKey: boolean; metaKey: boolean }) =>
  event.ctrlKey || event.altKey || event.metaKey;

const PAGE_KEYS = new Set(["PageUp", "PageDown"]);
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/** The step a key moves by: `smallStep` with Alt and an arrow, `largeStep` with Page keys or Shift and an arrow. */
export function getEventStepValue(
  event: { key: string; shiftKey: boolean; altKey: boolean },
  { step, largeStep, smallStep }: { step: number; largeStep: number; smallStep?: number },
) {
  const arrow = ARROW_KEYS.has(event.key);
  if (smallStep != null && event.altKey && arrow) return smallStep;
  return PAGE_KEYS.has(event.key) || (event.shiftKey && arrow) ? largeStep : step;
}

const NATIVE_LINK_TARGET = "a[href], button[type='submit'], input[type='submit']";

/**
 * Whether a click on a link or submit button is the browser's to act on: a middle click or the
 * platform's new-tab modifier (⌘ on a Mac, Ctrl elsewhere) opens a new tab, Alt downloads.
 */
export function opensLinkNatively(event: {
  currentTarget: EventTarget | null;
  button: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}): boolean {
  const { currentTarget } = event;
  if (!(currentTarget instanceof Element) || !currentTarget.matches(NATIVE_LINK_TARGET)) {
    return false;
  }
  return event.button === 1 || event.altKey || (isMacPlatform() ? event.metaKey : event.ctrlKey);
}

const NESTED_CONTROL = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[tabindex]",
  "[contenteditable]:not([contenteditable='false'])",
  "[role=button]",
  "[role=checkbox]",
  "[role=combobox]",
  "[role=link]",
  "[role=radio]",
  "[role=slider]",
  "[role=spinbutton]",
  "[role=switch]",
  "[role=tab]",
  "[role=textbox]",
].join(", ");

/**
 * Whether `target` is inside a control nested in `container`, such as a button in a clickable row,
 * so that a press or key on it belongs to that control rather than to `container`.
 */
export function isWithinNestedControl(target: EventTarget | null, container: Element): boolean {
  if (!(target instanceof Element)) return false;
  const control = target.closest(NESTED_CONTROL);
  return control !== null && control !== container && container.contains(control);
}

const isSubmitButton = (element: Element): element is HTMLButtonElement | HTMLInputElement =>
  (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) &&
  element.type === "submit";

/**
 * Submits `form` as Enter in a single-line field does: through its first submit button, not at all
 * while that button is disabled, and by itself when it has none.
 */
export function submitImplicitly(form: HTMLFormElement | null | undefined): void {
  if (!form) return;
  const submitter = Array.from(form.elements).find(isSubmitButton);
  if (!submitter) form.requestSubmit();
  else if (!submitter.disabled && submitter.getAttribute("aria-disabled") !== "true") {
    form.requestSubmit(submitter);
  }
}
