import {
  type KeyboardEventHandler,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
} from "react";

import { isComposingEvent, isEditableTarget } from "../foundations/dom";
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

const matchHotkey = (
  event: KeyboardEvent,
  shortcuts: string | readonly string[],
  enableOnEditable: boolean,
) => {
  if (event.defaultPrevented || isComposingEvent(event)) return undefined;
  if (!enableOnEditable && isEditableTarget(event.target)) return undefined;
  const list = typeof shortcuts === "string" ? [shortcuts] : shortcuts;
  return list.find((item) => matchesShortcut(event, item));
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
      const latest = latestRef.current;
      const shortcut = matchHotkey(event, latest.shortcuts, latest.enableOnEditable);
      if (shortcut === undefined) return;
      if (latest.preventDefault) event.preventDefault();
      latest.handler(event, shortcut);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, latestRef]);
}

/**
 * The element-scoped {@link useHotkeys}: an `onKeyDown` handler that calls `handler` when a keydown on
 * the element or inside it matches one of `shortcuts`. Matching and options are the same.
 */
export function useHotkeyHandler<T extends Element = Element>(
  shortcuts: string | readonly string[],
  handler: (event: ReactKeyboardEvent<T>, shortcut: string) => void,
  { enabled = true, enableOnEditable = false, preventDefault = true }: UseHotkeysOptions = {},
): KeyboardEventHandler<T> {
  const latestRef = useLatestRef({ shortcuts, handler, enabled, enableOnEditable, preventDefault });

  return useCallback(
    (event: ReactKeyboardEvent<T>) => {
      const latest = latestRef.current;
      if (!latest.enabled) return;
      const shortcut = matchHotkey(event.nativeEvent, latest.shortcuts, latest.enableOnEditable);
      if (shortcut === undefined) return;
      if (latest.preventDefault) event.preventDefault();
      latest.handler(event, shortcut);
    },
    [latestRef],
  );
}
