import { ark } from "@ark-ui/react/factory";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { type HTMLStyledProps, createSlotRecipeContext } from "#styled-system/jsx";
import { hotkeyInput } from "#styled-system/recipes";

import { isComposingEvent } from "../../foundations/dom";
import {
  MODIFIER_KEYS,
  formatShortcut,
  isMacPlatform,
  shortcutFromEvent,
} from "../../foundations/shortcuts";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import type { WithRef } from "../../types";

const { withProvider, withContext } = createSlotRecipeContext(hotkeyInput);

const Root = withProvider(ark.div, "root");
const Control = withContext(ark.button, "control");
const ErrorText = withContext(ark.span, "error");

const subscribeToNothing = () => () => {};
const useIsMac = () => useSyncExternalStore(subscribeToNothing, isMacPlatform, () => false);

export interface HotkeyInputProps extends Omit<
  HTMLStyledProps<"div">,
  "children" | "defaultValue" | "onChange" | "placeholder"
> {
  /** The shortcut, such as `"Mod+K"`; `null` or `""` while none is set. */
  value: string | null | undefined;
  /** Called with each recorded shortcut that `validate` accepts. */
  onValueChange: (value: string) => void;
  /**
   * Returns a message to reject a recorded shortcut, such as one another action already uses.
   * The message shows under the control and recording continues.
   */
  validate?: (value: string) => string | null | undefined;
  /** Shown while no shortcut is set. Defaults to `"Not set"`. */
  placeholder?: string;
  /** Shown while recording. Defaults to `"Press keys…"`. */
  recordingLabel?: string;
  disabled?: boolean;
}

/**
 * Button that records a keyboard shortcut. Click it, then press the keys: modifiers alone are
 * ignored, Escape or leaving the control cancels, and Tab moves on. Shows the shortcut with
 * {@link formatShortcut}.
 */
export function HotkeyInput({
  ref,
  value,
  onValueChange,
  validate,
  placeholder = "Not set",
  recordingLabel = "Press keys…",
  disabled,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...rootProps
}: WithRef<HotkeyInputProps, HTMLButtonElement>) {
  const controlRef = useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(controlRef, ref);
  const mac = useIsMac();
  const labelId = useId();
  const valueId = useId();
  const errorId = useId();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (disabled && armed) setArmed(false);
  const recording = armed && !disabled;
  const latestRef = useLatestRef({ onValueChange, validate });

  const stop = useCallback(() => {
    setArmed(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!recording) return;
    // Captured on window so a surrounding dialog's Escape or an app hotkey never sees the keys.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target !== controlRef.current || isComposingEvent(event)) return;
      if (MODIFIER_KEYS.has(event.key)) return;
      if (event.key === "Tab" && !event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        stop();
        return;
      }
      const shortcut = shortcutFromEvent(event, isMacPlatform());
      const message = latestRef.current.validate?.(shortcut);
      if (message) {
        setError(message);
        return;
      }
      stop();
      latestRef.current.onValueChange(shortcut);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [latestRef, recording, stop]);

  const label = recording ? recordingLabel : value ? formatShortcut(value, { mac }) : placeholder;
  const describedBy = [ariaDescribedBy, recording && error ? errorId : undefined]
    .filter(Boolean)
    .join(" ");
  const ownLabel = !ariaLabelledBy && ariaLabel ? ariaLabel : undefined;
  const labelledBy = ariaLabelledBy ?? (ownLabel ? labelId : undefined);

  return (
    <Root {...rootProps}>
      {ownLabel && (
        <span
          id={labelId}
          hidden
        >
          {ownLabel}
        </span>
      )}
      <Control
        ref={composedRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-labelledby={labelledBy ? `${labelledBy} ${valueId}` : undefined}
        aria-describedby={describedBy || undefined}
        data-recording={recording ? "" : undefined}
        onClick={() => {
          if (recording) {
            stop();
            return;
          }
          controlRef.current?.focus();
          setArmed(true);
          setError(null);
        }}
        onBlur={stop}
      >
        <span id={valueId}>{label}</span>
      </Control>
      {recording && error && (
        <ErrorText
          id={errorId}
          role="alert"
        >
          {error}
        </ErrorText>
      )}
    </Root>
  );
}
