import { useEffect } from "react";

import { isComposingEvent } from "../components/imeComposition";
import { matchesShortcut } from "../foundations/shortcuts";
import { useLatestRef } from "./useLatestRef";

export interface UseHotkeysOptions {
  /** Listens only while `true`. Defaults to `true`. */
  enabled?: boolean;
  /** Also fires while focus is in a text field, a select or editable content. Defaults to `false`. */
  enableOnEditable?: boolean;
  /** Calls `preventDefault()` on a matching event. Defaults to `true`. */
  preventDefault?: boolean;
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

const isEditable = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(target.type);
  return target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
};

/**
 * Calls `handler` when a keydown anywhere in the document matches one of `shortcuts`, written as
 * {@link matchesShortcut} reads them (`"Mod+K"`, `"Shift+?"`). Skips IME composition, events another
 * handler already prevented, and keys typed into editable fields unless `enableOnEditable` is set.
 */
export function useHotkeys(
  shortcuts: string | readonly string[],
  handler: (event: KeyboardEvent, shortcut: string) => void,
  { enabled = true, enableOnEditable = false, preventDefault = true }: UseHotkeysOptions = {},
): void {
  const latestRef = useLatestRef({ shortcuts, handler, enableOnEditable, preventDefault });

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isComposingEvent(event)) return;
      const latest = latestRef.current;
      if (!latest.enableOnEditable && isEditable(event.target)) return;
      const list = typeof latest.shortcuts === "string" ? [latest.shortcuts] : latest.shortcuts;
      const shortcut = list.find((item) => matchesShortcut(event, item));
      if (shortcut === undefined) return;
      if (latest.preventDefault) event.preventDefault();
      latest.handler(event, shortcut);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, latestRef]);
}
