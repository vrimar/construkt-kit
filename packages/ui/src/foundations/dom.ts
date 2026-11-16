import type { AriaAttributes, KeyboardEvent as ReactKeyboardEvent } from "react";

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

/** Whether `target` takes typed keys: a text-like input, a textarea, a select or editable content. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(target.type);
  return target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

export function isRtl(element: Element): boolean {
  return getComputedStyle(element).direction === "rtl";
}

export const isAriaExpanded = (value: AriaAttributes["aria-expanded"]): boolean =>
  value === true || value === "true";
