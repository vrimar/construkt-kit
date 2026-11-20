import { NumberParser } from "@internationalized/number";
import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { isComposingEvent } from "../../foundations/dom";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import { useFieldContext, useFieldControlState, useFormControl } from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import {
  clampValue,
  decrementValue,
  getEventStepValue,
  incrementValue,
  isModifierKey,
  isValueAtMax,
  isValueAtMin,
  isValueWithinRange,
} from "../numberMath";
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
  /** The value as the input shows it. */
  value?: string | undefined;
  /** @default "" */
  defaultValue?: string | undefined;
  onValueChange?: ((value: string, details: NumberInputValueChangeDetails) => void) | undefined;
  /** Called on blur and Enter with the value as formatted. */
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
  /** Ignored with `formatOptions`. @default "-?[0-9]*(.[0-9]+)?" */
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

type Phase = "idle" | "focused" | "before-spin" | "spinning" | "scrubbing";
type Hint = "increment" | "decrement";

const DEFAULT_PATTERN = "-?[0-9]*(.[0-9]+)?";

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
    pattern = DEFAULT_PATTERN,
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
  const field = useFieldControlState({
    disabled: options.disabled,
    readOnly: options.readOnly,
    required: options.required,
  });

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
      formatter: new Intl.NumberFormat(locale, parsed ?? {}),
      parser: new NumberParser(locale, parsed ?? {}),
    };
  }, [locale, formatKey]);
  const parseValue = (text: string) => {
    if (!formatOptions) return parseFloat(text);
    return text === "" ? Number.NaN : parser.parse(text);
  };
  const formatValue = (number: number) => {
    if (Number.isNaN(number)) return "";
    return formatOptions ? formatter.format(number) : number.toString();
  };

  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });
  const [initialValue] = useState(valueProp ?? defaultValue);
  const [phase, setPhaseState] = useState<Phase>("idle");
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
  const hintRef = useRef<Hint | null>(null);
  const pressPointerTypeRef = useRef("");
  const scrubPointRef = useRef<ScrubPoint | null>(null);
  const syncRef = useRef<{ raw: boolean; selection: InputSelection | undefined } | null>(null);
  const lastReasonRef = useRef<NumberInputValueChangeReason | null>(null);

  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  const valueAsNumber = parseValue(value);
  const readOnly = field.readOnly;
  const outOfRange = !isValueWithinRange(valueAsNumber, min, max);
  const invalid = options.invalid ?? fieldContext?.invalid ?? outOfRange;
  const canIncrement = allowOverflow || !isValueAtMax(valueAsNumber, max);
  const canDecrement = allowOverflow || !isValueAtMin(valueAsNumber, min);

  const latest = useLatestRef({ options, formatValue, parseValue, step, min, max, dir });

  function setPhase(next: Phase) {
    phaseRef.current = next;
    setPhaseState(next);
  }

  function change(next: string, reason: NumberInputValueChangeReason, event?: Event) {
    if (next === valueRef.current) return;
    const details = Object.assign(createChangeDetails(reason, event), {
      valueAsNumber: latest.current.parseValue(next),
    });
    latest.current.options.onValueChange?.(next, details);
    if (details.canceled) {
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
    const inRange = isValueWithinRange(current, low, high);
    const clamp = reason === "blur" && clampOnBlur && valueRef.current !== "" && !inRange;
    const next = format(clamp ? clampValue(current, low, high) : current);

    change(next, reason, event);
    if (!clamp) syncInput(false);
    hintRef.current = null;
    onFocusChange?.(false, focusDetails(next));
    if (reason === "blur" && !clamp && !inRange) {
      onValueInvalid?.(next, {
        reason: parse(next) > high ? "rangeOverflow" : "rangeUnderflow",
        valueAsNumber: parse(next),
      });
    }
    onValueCommit?.(next, { valueAsNumber: parse(next) });
  }

  function pressDown(hint: Hint, pointerType: string) {
    const from = phaseRef.current;
    if (from !== "idle" && from !== "focused") return;
    hintRef.current = hint;
    pressPointerTypeRef.current = pointerType;
    if (pointerType !== "touch") {
      focusInput();
      if (from === "idle") latest.current.options.onFocusChange?.(true, focusDetails());
    }
    setPhase("before-spin");
    stepValue(hint, pressReason(hint));
  }

  function pressUp(pointerType?: string) {
    const from = phaseRef.current;
    if (from !== "before-spin" && from !== "spinning") return;
    if (from === "spinning" || pointerType !== "touch") focusInput();
    hintRef.current = null;
    setPhase("focused");
  }

  const actions = useLatestRef({ stepValue, pressUp, focusInput, setPhase, syncInput });

  const { fieldsetDisabled } = useFormControl(inputRef, () => change(initialValue, "form-reset"));
  const disabled = field.disabled || fieldsetDisabled;

  useEffect(() => {
    if (phase !== "before-spin") return;
    const timeout = setTimeout(() => {
      const { parseValue: parse, min: low, max: high } = latest.current;
      const inRange = isValueWithinRange(parse(valueRef.current), low, high);
      if (inRange && latest.current.options.spinOnPress !== false) {
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
    if (phase !== "focused" || !allowMouseWheel || readOnly || !input) return;
    if (input.ownerDocument.activeElement !== input) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = Math.sign(event.deltaY) * -1;
      if (direction === 1) actions.current.stepValue("increment", "wheel", undefined, event);
      else if (direction === -1) actions.current.stepValue("decrement", "wheel", undefined, event);
    };
    input.addEventListener("wheel", onWheel, { passive: false });
    return () => input.removeEventListener("wheel", onWheel);
  }, [phase, allowMouseWheel, readOnly, actions]);

  useEffect(() => {
    const input = inputRef.current;
    const start = scrubPointRef.current;
    if (phase !== "scrubbing" || !input || !start) return;
    const doc = input.ownerDocument;
    const scrub = startScrub(doc, start);
    const onMouseMove = (event: globalThis.MouseEvent) => {
      const point = scrubPointRef.current;
      if (!point) return;
      const move = getScrubMove(event, point, latest.current.dir === "rtl");
      if (!move.hint) return;
      actions.current.stepValue(move.hint, "scrub", undefined, event);
      scrubPointRef.current = move.point;
      scrub.move(move.point);
    };
    const onMouseUp = () => {
      actions.current.focusInput();
      scrubPointRef.current = null;
      actions.current.setPhase("focused");
    };
    doc.addEventListener("mousemove", onMouseMove);
    doc.addEventListener("mouseup", onMouseUp);
    return () => {
      doc.removeEventListener("mousemove", onMouseMove);
      doc.removeEventListener("mouseup", onMouseUp);
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

  const focused = phase !== "idle";
  const scrubbing = phase === "scrubbing";
  const incrementDisabled = disabled || !canIncrement || readOnly;
  const decrementDisabled = disabled || !canDecrement || readOnly;
  const ids = {
    root: `number-input:${id}`,
    input: field.id ?? `number-input:${id}:input`,
    label: `number-input:${id}:label`,
    scrubber: `number-input:${id}:scrubber`,
  };
  const formattedValue = formatValue(valueAsNumber);

  const triggerProps = (hint: Hint) => {
    const isDisabled = hint === "increment" ? incrementDisabled : decrementDisabled;
    return {
      ref: triggerRefSetters[hint],
      id: `number-input:${id}:${hint === "increment" ? "inc" : "dec"}`,
      type: "button" as const,
      tabIndex: -1,
      disabled: isDisabled,
      "data-disabled": isDisabled ? ("" as const) : undefined,
      "aria-label":
        hint === "increment"
          ? (translations?.incrementLabel ?? "increment value")
          : (translations?.decrementLabel ?? "decrease value"),
      "aria-controls": ids.input,
      "data-scrubbing": scrubbing ? ("" as const) : undefined,
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
        if (hint === "decrement" && isDisabled) return;
        pressUp(hint === "increment" ? event.pointerType : undefined);
      },
    };
  };

  return {
    state: { focused, scrubbing, disabled, readOnly, invalid, required: field.required },
    value: formattedValue,
    rootProps: { id: ids.root },
    labelProps: {
      id: ids.label,
      htmlFor: ids.input,
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
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": Number.isNaN(valueAsNumber) ? undefined : valueAsNumber,
      "aria-valuetext": translations?.valueText?.(value),
      onFocus() {
        if (phaseRef.current !== "idle") return;
        setPhase("focused");
        latest.current.options.onFocusChange?.(true, focusDetails());
      },
      onBlur(event: FormEvent<HTMLInputElement>) {
        if (phaseRef.current !== "focused") return;
        commit("blur", event.nativeEvent);
        setPhase("idle");
      },
      onInput(event: FormEvent<HTMLInputElement>) {
        if (phaseRef.current !== "focused") return;
        const input = event.currentTarget;
        syncRef.current = { raw: true, selection: recordCursor(input) };
        change(input.value, "input-change", event.nativeEvent);
      },
      onBeforeInput(event: FormEvent<HTMLInputElement> & { data?: string | null }) {
        try {
          const { selectionStart, selectionEnd, value: text } = event.currentTarget;
          const next =
            text.slice(0, selectionStart ?? 0) + (event.data ?? "") + text.slice(selectionEnd ?? 0);
          if (!parser.isValidPartialNumber(next)) event.preventDefault();
        } catch {
          // A selection the input can't report leaves the typed text to the browser.
        }
      },
      onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.defaultPrevented || readOnly || isComposingEvent(event)) return;
        if (phaseRef.current !== "focused") return;
        const by = getEventStepValue(event, { step, largeStep, smallStep });
        const native = event.nativeEvent;
        switch (event.key) {
          case "ArrowUp":
            stepValue("increment", "keyboard", by, native);
            event.preventDefault();
            break;
          case "ArrowDown":
            stepValue("decrement", "keyboard", by, native);
            event.preventDefault();
            break;
          case "Home":
            if (isModifierKey(event)) return;
            change(formatValue(min), "keyboard", native);
            event.preventDefault();
            break;
          case "End":
            if (isModifierKey(event)) return;
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
      onMouseDown(event: MouseEvent<HTMLElement>) {
        if (disabled || readOnly || event.button !== 0) return;
        const from = phaseRef.current;
        if (from === "idle" || from === "focused") {
          scrubPointRef.current = getScrubStart(event.nativeEvent);
          hintRef.current = null;
          focusInput();
          if (from === "idle") latest.current.options.onFocusChange?.(true, focusDetails());
          setPhase("scrubbing");
        }
        event.preventDefault();
        requestAnimationFrame(() => setCaretToEnd(inputRef.current));
      },
    },
  };
}

export type NumberInputApi = ReturnType<typeof useNumberInput>;
