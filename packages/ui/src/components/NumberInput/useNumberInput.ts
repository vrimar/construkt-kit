import {
  clampValue,
  decrementValue,
  incrementValue,
  isValueAtMax,
  isValueAtMin,
  isValueWithinRange,
} from "@construkt-kit/utils";
import { NumberFormatter, NumberParser } from "@internationalized/number";
import {
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getEventStepValue, isComposingEvent, isModifierKey } from "../../foundations/dom";
import { trackPointerMove } from "../../foundations/trackPointerMove";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { useRenderedParts } from "../../hooks/useRenderedParts";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import { useFieldContext, useFormFieldState } from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { type InputSelection, recordCursor, restoreCursor, setCaretToEnd } from "./cursor";
import { type ScrubPoint, getScrubMove, getScrubStart, startScrub } from "./scrubber";

export type NumberInputValueChangeReason =
  | "input-change"
  | "increment-press"
  | "decrement-press"
  | "keyboard"
  | "wheel"
  | "scrub"
  | "blur"
  | "enter"
  | "form-reset";

/** Why `onValueChange` was called, the value as a number, and a way to keep the value as it is. */
export interface NumberInputValueChangeDetails extends ChangeDetails<NumberInputValueChangeReason> {
  valueAsNumber: number;
}

export interface NumberInputValueDetails {
  valueAsNumber: number;
}

export interface NumberInputInvalidDetails extends NumberInputValueDetails {
  reason: "rangeOverflow" | "rangeUnderflow";
}

export interface NumberInputFocusDetails extends NumberInputValueDetails {
  value: string;
}

export interface NumberInputTranslations {
  /** @default "increment value" */
  incrementLabel?: string | undefined;
  /** @default "decrease value" */
  decrementLabel?: string | undefined;
  /** The input's `aria-valuetext` for a value. */
  valueText?: ((value: string) => string) | undefined;
}

export interface NumberInputOptions {
  /** The value as the input shows it, in the locale's number format: `"2,5"` in `de-DE`. */
  value?: string | undefined;
  /** @default "" */
  defaultValue?: string | undefined;
  onValueChange?: ((value: string, details: NumberInputValueChangeDetails) => void) | undefined;
  /**
   * Called on Enter, when focus leaves the input and its triggers, and when a trigger press or
   * scrub that left focus outside them ends, with the value as formatted.
   */
  onValueCommit?: ((value: string, details: NumberInputValueDetails) => void) | undefined;
  /** Called when the value moves outside `min`–`max` other than by typing, and on a blur that leaves it there. */
  onValueInvalid?: ((value: string, details: NumberInputInvalidDetails) => void) | undefined;
  onFocusChange?: ((focused: boolean, details: NumberInputFocusDetails) => void) | undefined;
  /** @default Number.MIN_SAFE_INTEGER */
  min?: number | undefined;
  /** @default Number.MAX_SAFE_INTEGER */
  max?: number | undefined;
  /** @default 1, or 0.01 with a `percent` format */
  step?: number | undefined;
  /** The step of Shift with an arrow and of Page Up and Page Down. @default 10 × step */
  largeStep?: number | undefined;
  /** The step of Alt with an arrow. @default step ÷ 10 */
  smallStep?: number | undefined;
  /** Lets the value step and stay beyond `min` and `max`. */
  allowOverflow?: boolean | undefined;
  /** Clamps the value to `min`–`max` on blur. @default !allowOverflow */
  clampValueOnBlur?: boolean | undefined;
  /** Steps the value with the mouse wheel while the input has focus. */
  allowMouseWheel?: boolean | undefined;
  /** Moves focus to the input when a trigger or the scrubber changes the value. @default true */
  focusInputOnChange?: boolean | undefined;
  /** Keeps stepping while a trigger is held. @default true */
  spinOnPress?: boolean | undefined;
  formatOptions?: Intl.NumberFormatOptions | undefined;
  /** Formats and parses in this locale instead of the `LocaleProvider`'s. */
  locale?: string | undefined;
  /** @default "decimal" */
  inputMode?: "decimal" | "numeric" | "text" | "tel" | "search" | "email" | "url" | undefined;
  /** Ignored with `formatOptions`. */
  pattern?: string | undefined;
  translations?: NumberInputTranslations | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  /** Marks the input invalid; otherwise a value outside `min`–`max` does, outside a `Field`. */
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  name?: string | undefined;
  form?: string | undefined;
  /** The base of the parts' generated ids. */
  id?: string | undefined;
}

/** Every `NumberInputOptions` key, to split them off the root's props. */
export const NUMBER_INPUT_OPTION_KEYS = {
  value: true,
  defaultValue: true,
  onValueChange: true,
  onValueCommit: true,
  onValueInvalid: true,
  onFocusChange: true,
  min: true,
  max: true,
  step: true,
  largeStep: true,
  smallStep: true,
  allowOverflow: true,
  clampValueOnBlur: true,
  allowMouseWheel: true,
  focusInputOnChange: true,
  spinOnPress: true,
  formatOptions: true,
  locale: true,
  inputMode: true,
  pattern: true,
  translations: true,
  disabled: true,
  readOnly: true,
  invalid: true,
  required: true,
  name: true,
  form: true,
  id: true,
} as const satisfies Record<keyof NumberInputOptions, true>;

type Phase = "idle" | "before-spin" | "spinning" | "scrubbing";
type Hint = "increment" | "decrement";

const PLAIN_FORMAT: Intl.NumberFormatOptions = { useGrouping: false, maximumFractionDigits: 20 };

export function useNumberInput(options: NumberInputOptions) {
  const {
    value: valueProp,
    defaultValue = "",
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    allowOverflow = false,
    allowMouseWheel = false,
    formatOptions,
    inputMode = "decimal",
    pattern,
    translations,
    name,
    form,
  } = options;
  const uid = useId();
  const id = options.id ?? uid;
  const localeContext = useLocale();
  const locale = options.locale ?? localeContext.locale;
  const { dir } = localeContext;
  const fieldContext = useFieldContext();

  const step =
    options.step !== undefined && !Number.isNaN(options.step)
      ? options.step
      : formatOptions?.style === "percent"
        ? 0.01
        : 1;
  const largeStep = options.largeStep ?? 10 * step;
  const smallStep = options.smallStep ?? step / 10;

  const formatKey = JSON.stringify(formatOptions ?? null);
  const { formatter, parser } = useMemo(() => {
    const parsed = JSON.parse(formatKey) as Intl.NumberFormatOptions | null;
    return {
      formatter: new NumberFormatter(locale, parsed ?? PLAIN_FORMAT),
      parser: new NumberParser(locale, parsed ?? {}),
    };
  }, [locale, formatKey]);
  const parseValue = (text: string) => (text === "" ? Number.NaN : parser.parse(text));
  const formatValue = (number: number) =>
    Number.isNaN(number) ? "" : formatter.format(number || 0);

  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });
  const [initialValue] = useState(valueProp ?? defaultValue);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [focused, setFocusedState] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRefs = useRef<Record<Hint, HTMLButtonElement | null>>({
    increment: null,
    decrement: null,
  });
  const [triggerRefSetters] = useState(() => ({
    increment: (button: HTMLButtonElement | null) => {
      triggerRefs.current.increment = button;
    },
    decrement: (button: HTMLButtonElement | null) => {
      triggerRefs.current.decrement = button;
    },
  }));
  const valueRef = useRef(value);
  const phaseRef = useRef<Phase>("idle");
  const focusedRef = useRef(false);
  const hintRef = useRef<Hint | null>(null);
  const pressPointerTypeRef = useRef("");
  const scrubStartRef = useRef<{ pointerId: number; point: ScrubPoint } | null>(null);
  const syncRef = useRef<{ raw: boolean; selection: InputSelection | undefined } | null>(null);
  const lastReasonRef = useRef<NumberInputValueChangeReason | null>(null);

  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  const [rendered, reportRendered] = useRenderedParts<"input">();
  const field = useFormFieldState(
    { disabled: options.disabled, readOnly: options.readOnly, required: options.required },
    { elementRef: inputRef, onReset: () => change(initialValue, "form-reset") },
  );
  const isInRange = (number: number) =>
    Number.isNaN(number) || isValueWithinRange(number, min, max);
  const valueAsNumber = parseValue(value);
  const { readOnly } = field;
  const outOfRange = !isInRange(valueAsNumber);
  const invalid = options.invalid ?? fieldContext?.invalid ?? outOfRange;
  const empty = Number.isNaN(valueAsNumber);
  const canIncrement = allowOverflow || empty || !isValueAtMax(valueAsNumber, max);
  const canDecrement = allowOverflow || empty || !isValueAtMin(valueAsNumber, min);

  const latest = useLatestRef({ options, formatValue, parseValue, isInRange, step, min, max, dir });

  function setPhase(next: Phase) {
    phaseRef.current = next;
    setPhaseState(next);
  }

  function setFocused(next: boolean) {
    focusedRef.current = next;
    setFocusedState(next);
  }

  function enterFocus() {
    if (focusedRef.current) return;
    setFocused(true);
    latest.current.options.onFocusChange?.(true, focusDetails());
  }

  function change(next: string, reason: NumberInputValueChangeReason, event?: Event) {
    if (next === valueRef.current) return;
    const extra = { valueAsNumber: latest.current.parseValue(next) };
    if (!emitChange(latest.current.options.onValueChange, next, reason, event, extra)) {
      if (reason === "input-change") syncInput(true);
      return;
    }
    lastReasonRef.current = reason;
    if (latest.current.options.value === undefined) valueRef.current = next;
    setValue(next);
  }

  function stepValue(hint: Hint, reason: NumberInputValueChangeReason, by?: number, event?: Event) {
    const { parseValue: parse, formatValue: format, step: base } = latest.current;
    const current = parse(valueRef.current);
    let next =
      hint === "increment"
        ? incrementValue(current, by ?? base)
        : decrementValue(current, by ?? base);
    if (!latest.current.options.allowOverflow) {
      next = clampValue(next, latest.current.min, latest.current.max);
    }
    change(format(next), reason, event);
  }

  const pressReason = (hint: Hint) =>
    hint === "increment" ? "increment-press" : "decrement-press";

  function focusInput() {
    if (latest.current.options.focusInputOnChange === false) return;
    const input = inputRef.current;
    if (!input || input.ownerDocument.activeElement === input) return;
    requestAnimationFrame(() => input.focus({ preventScroll: true }));
  }

  function focusDetails(next = valueRef.current): NumberInputFocusDetails {
    const { parseValue: parse, formatValue: format } = latest.current;
    return { value: format(parse(next)), valueAsNumber: parse(next) };
  }

  function syncInput(raw: boolean, selection = recordCursor(inputRef.current)) {
    const input = inputRef.current;
    const { parseValue: parse, formatValue: format } = latest.current;
    const text = raw ? valueRef.current : format(parse(valueRef.current));
    requestAnimationFrame(() => {
      if (!input) return;
      input.value = text;
      input.setAttribute("value", text);
      restoreCursor(input, selection);
    });
  }

  function commit(reason: "blur" | "enter", event: Event) {
    const { parseValue: parse, formatValue: format, min: low, max: high } = latest.current;
    const { onFocusChange, onValueCommit, onValueInvalid } = latest.current.options;
    const clampOnBlur =
      latest.current.options.clampValueOnBlur ?? !latest.current.options.allowOverflow;
    const current = parse(valueRef.current);
    const inRange = latest.current.isInRange(current);
    const clamp = reason === "blur" && clampOnBlur && !inRange;
    const next = format(clamp ? clampValue(current, low, high) : current);

    change(next, reason, event);
    if (!clamp) syncInput(false);
    hintRef.current = null;
    if (reason === "blur") onFocusChange?.(false, focusDetails(next));
    if (reason === "blur" && !clamp && !inRange) {
      onValueInvalid?.(next, {
        reason: parse(next) > high ? "rangeOverflow" : "rangeUnderflow",
        valueAsNumber: parse(next),
      });
    }
    onValueCommit?.(next, { valueAsNumber: parse(next) });
  }

  function pressDown(hint: Hint, pointerType: string) {
    if (phaseRef.current !== "idle") return;
    hintRef.current = hint;
    pressPointerTypeRef.current = pointerType;
    if (pointerType === "touch" || latest.current.options.focusInputOnChange !== false) {
      enterFocus();
    }
    if (pointerType !== "touch") focusInput();
    setPhase("before-spin");
    stepValue(hint, pressReason(hint));
  }

  function endGesture() {
    setPhase("idle");
    // With focus inside, the blur commits.
    if (focusedRef.current) return;
    const { parseValue: parse, formatValue: format } = latest.current;
    const next = format(parse(valueRef.current));
    latest.current.options.onValueCommit?.(next, { valueAsNumber: parse(next) });
  }

  function pressUp(pointerType?: string) {
    const from = phaseRef.current;
    if (from !== "before-spin" && from !== "spinning") return;
    if (from === "spinning" || pointerType !== "touch") focusInput();
    hintRef.current = null;
    endGesture();
  }

  const actions = useLatestRef({
    stepValue,
    pressUp,
    focusInput,
    endGesture,
    setPhase,
    syncInput,
  });

  const { disabled } = field;

  useEffect(() => {
    if (phase !== "before-spin") return;
    const timeout = setTimeout(() => {
      const { parseValue: parse, isInRange: inRange } = latest.current;
      if (inRange(parse(valueRef.current)) && latest.current.options.spinOnPress !== false) {
        actions.current.setPhase("spinning");
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [phase, latest, actions]);

  useEffect(() => {
    if (phase !== "spinning") return;
    const interval = setInterval(() => {
      const hint = hintRef.current;
      if (hint) actions.current.stepValue(hint, pressReason(hint));
    }, 50);
    return () => clearInterval(interval);
  }, [phase, actions]);

  useEffect(() => {
    if (phase !== "before-spin" && phase !== "spinning") return;
    const button = hintRef.current && triggerRefs.current[hintRef.current];
    if (!button) return;
    const release = () => actions.current.pressUp(pressPointerTypeRef.current);
    // The press itself may have disabled the button before the observer could see it.
    if (button.disabled) {
      release();
      return;
    }
    const observer = new MutationObserver(release);
    observer.observe(button, { attributes: true, attributeFilter: ["disabled"] });
    return () => observer.disconnect();
  }, [phase, actions]);

  useEffect(() => {
    const input = inputRef.current;
    if (!focused || phase !== "idle" || !allowMouseWheel || readOnly || !input) return;
    if (input.ownerDocument.activeElement !== input) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = Math.sign(event.deltaY) * -1;
      if (direction === 1) actions.current.stepValue("increment", "wheel", undefined, event);
      else if (direction === -1) actions.current.stepValue("decrement", "wheel", undefined, event);
    };
    input.addEventListener("wheel", onWheel, { passive: false });
    return () => input.removeEventListener("wheel", onWheel);
  }, [focused, phase, allowMouseWheel, readOnly, actions]);

  useEffect(() => {
    const input = inputRef.current;
    const start = scrubStartRef.current;
    if (phase !== "scrubbing" || !input || !start) return;
    const doc = input.ownerDocument;
    let point = start.point;
    const scrub = startScrub(doc, point);
    const stopTracking = trackPointerMove(doc, {
      pointerId: start.pointerId,
      lockSelection: false,
      onMove(_, event) {
        const move = getScrubMove(event, point, latest.current.dir === "rtl");
        if (!move.hint) return;
        actions.current.stepValue(move.hint, "scrub", undefined, event);
        point = move.point;
        scrub.move(point);
      },
      onUp() {
        actions.current.focusInput();
        actions.current.endGesture();
      },
    });
    return () => {
      stopTracking();
      scrub.stop();
    };
  }, [phase, latest, actions]);

  const syncKey = `${value}\u0000${locale}\u0000${formatKey}`;
  const previousSyncKey = useRef(syncKey);
  useLayoutEffect(() => {
    if (previousSyncKey.current === syncKey) return;
    previousSyncKey.current = syncKey;
    const source = syncRef.current;
    syncRef.current = null;
    actions.current.syncInput(source?.raw ?? false, source?.selection);
  }, [syncKey, actions]);

  const previousOutOfRange = useRef(outOfRange);
  useEffect(() => {
    if (previousOutOfRange.current === outOfRange) return;
    previousOutOfRange.current = outOfRange;
    if (!outOfRange || lastReasonRef.current === "input-change") return;
    const { parseValue: parse, formatValue: format, max: high } = latest.current;
    const current = parse(valueRef.current);
    latest.current.options.onValueInvalid?.(format(current), {
      reason: current > high ? "rangeOverflow" : "rangeUnderflow",
      valueAsNumber: current,
    });
  }, [outOfRange, latest]);

  const scrubbing = phase === "scrubbing";
  const incrementDisabled = disabled || !canIncrement || readOnly;
  const decrementDisabled = disabled || !canDecrement || readOnly;
  const ids = {
    root: `number-input:${id}`,
    input: `number-input:${id}:input`,
    label: `number-input:${id}:label`,
    scrubber: `number-input:${id}:scrubber`,
  };
  const formattedValue = formatValue(valueAsNumber);

  const triggerProps = (hint: Hint) => {
    const isDisabled = hint === "increment" ? incrementDisabled : decrementDisabled;
    return {
      ref: triggerRefSetters[hint],
      id: `number-input:${id}:${hint === "increment" ? "inc" : "dec"}`,
      tabIndex: -1,
      disabled: isDisabled,
      "aria-label":
        hint === "increment"
          ? (translations?.incrementLabel ?? "increment value")
          : (translations?.decrementLabel ?? "decrease value"),
      "aria-controls": rendered.input,
      onPointerDown(event: PointerEvent<HTMLButtonElement>) {
        if (isDisabled || event.button !== 0) return;
        pressDown(hint, event.pointerType);
        if (event.pointerType === "mouse") event.preventDefault();
        if (event.pointerType === "touch") event.currentTarget.focus({ preventScroll: true });
      },
      onPointerUp(event: PointerEvent<HTMLButtonElement>) {
        pressUp(event.pointerType);
      },
      onPointerLeave(event: PointerEvent<HTMLButtonElement>) {
        pressUp(event.pointerType);
      },
    };
  };

  return {
    state: { focused, scrubbing, disabled, readOnly, invalid, required: field.required },
    reportRendered,
    rootProps: {
      id: ids.root,
      onFocus: enterFocus,
      onBlur(event: FocusEvent<HTMLElement>) {
        if (!focusedRef.current) return;
        if (event.currentTarget.contains(event.relatedTarget)) return;
        commit("blur", event.nativeEvent);
        setFocused(false);
        setPhase("idle");
      },
    },
    labelProps: {
      id: ids.label,
      htmlFor: rendered.input,
      onClick() {
        requestAnimationFrame(() => setCaretToEnd(inputRef.current));
      },
    },
    controlProps: {
      role: "group",
      "aria-disabled": disabled,
      "aria-invalid": invalid || undefined,
    },
    inputProps: {
      ref: inputRef,
      id: ids.input,
      name,
      form,
      role: "spinbutton",
      type: "text",
      defaultValue: formattedValue,
      pattern: formatOptions ? undefined : pattern,
      inputMode,
      disabled,
      readOnly,
      required: field.required,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: "false" as const,
      "aria-invalid": invalid || undefined,
      "aria-describedby": field.describedBy,
      "aria-roledescription": "numberfield",
      "aria-valuemin": options.min,
      "aria-valuemax": options.max,
      "aria-valuenow": empty ? undefined : valueAsNumber,
      "aria-valuetext": translations?.valueText?.(value),
      onInput(event: FormEvent<HTMLInputElement>) {
        if (!focusedRef.current || phaseRef.current !== "idle") return;
        const input = event.currentTarget;
        syncRef.current = { raw: true, selection: recordCursor(input) };
        change(input.value, "input-change", event.nativeEvent);
      },
      onBeforeInput(event: FormEvent<HTMLInputElement> & { data?: string | null }) {
        try {
          const { selectionStart, selectionEnd, value: text } = event.currentTarget;
          const next =
            text.slice(0, selectionStart ?? 0) + (event.data ?? "") + text.slice(selectionEnd ?? 0);
          const valid = allowOverflow
            ? parser.isValidPartialNumber(next)
            : parser.isValidPartialNumber(next, min, max);
          if (!valid) event.preventDefault();
        } catch {
          // A selection the input can't report leaves the typed text to the browser.
        }
      },
      onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.defaultPrevented || readOnly || isComposingEvent(event)) return;
        if (!focusedRef.current || phaseRef.current !== "idle") return;
        const by = getEventStepValue(event, { step, largeStep, smallStep });
        const native = event.nativeEvent;
        switch (event.key) {
          case "ArrowUp":
          case "PageUp":
            stepValue("increment", "keyboard", by, native);
            event.preventDefault();
            break;
          case "ArrowDown":
          case "PageDown":
            stepValue("decrement", "keyboard", by, native);
            event.preventDefault();
            break;
          case "Home":
            if (isModifierKey(event) || options.min === undefined) return;
            change(formatValue(min), "keyboard", native);
            event.preventDefault();
            break;
          case "End":
            if (isModifierKey(event) || options.max === undefined) return;
            change(formatValue(max), "keyboard", native);
            event.preventDefault();
            break;
          case "Enter":
            commit("enter", native);
            break;
        }
      },
    },
    incrementTriggerProps: triggerProps("increment"),
    decrementTriggerProps: triggerProps("decrement"),
    scrubberProps: {
      id: ids.scrubber,
      role: "presentation",
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (disabled || readOnly || event.button !== 0 || event.pointerType === "touch") return;
        if (phaseRef.current === "idle") {
          scrubStartRef.current = {
            pointerId: event.pointerId,
            point: getScrubStart(event.nativeEvent),
          };
          hintRef.current = null;
          if (latest.current.options.focusInputOnChange !== false) enterFocus();
          focusInput();
          setPhase("scrubbing");
        }
        event.preventDefault();
        requestAnimationFrame(() => setCaretToEnd(inputRef.current));
      },
    },
  };
}

export type NumberInputApi = ReturnType<typeof useNumberInput>;
