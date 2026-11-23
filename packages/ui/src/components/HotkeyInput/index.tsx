import {
  type ComponentProps,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { hotkeyInput } from "#styled-system/recipes";

import { isComposingEvent } from "../../foundations/dom";
import { isMacPlatform } from "../../foundations/platform";
import { MODIFIER_KEYS, formatShortcut, shortcutFromEvent } from "../../foundations/shortcuts";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import { joinIds, useFieldControlState } from "../../primitives/field";
import { dataAttr, renderable } from "../../primitives/render";
import type { WithRef } from "../../types";

const { withProvider, withContext } = createSlotRecipeContext(hotkeyInput);

const Root = withProvider(renderable.div, "root");
const Control = withContext(renderable.button, "control");
const ErrorText = withContext(renderable.span, "error");

const subscribeToNothing = () => () => {};
const useIsMac = () => useSyncExternalStore(subscribeToNothing, isMacPlatform, () => false);

export interface HotkeyInputProps extends Omit<
  ComponentProps<typeof Root>,
  "children" | "defaultValue" | "onChange" | "placeholder" | "ref"
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
  disabled: disabledProp,
  id: idProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...rootProps
}: WithRef<HotkeyInputProps, HTMLButtonElement>) {
  const field = useFieldControlState({ id: idProp, disabled: disabledProp });
  const { disabled } = field;
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
  const describedBy = joinIds([ariaDescribedBy, field.describedBy, recording && error && errorId]);
  const ownLabel = !ariaLabelledBy && ariaLabel ? ariaLabel : undefined;
  const labelledBy = ariaLabelledBy ?? (ownLabel ? labelId : field.labelId);

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
        id={field.id}
        type="button"
        disabled={disabled}
        aria-labelledby={labelledBy ? `${labelledBy} ${valueId}` : undefined}
        aria-describedby={describedBy}
        aria-invalid={field.invalid || undefined}
        data-recording={dataAttr(recording)}
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
