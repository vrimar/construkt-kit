import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import {
  type RenderedParts,
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../../hooks/useRenderedParts";

export interface FieldState {
  disabled: boolean;
  invalid: boolean;
  readOnly: boolean;
  required: boolean;
}

export type FieldMessage = "helperText" | "errorText";

type FieldPart = "label" | FieldMessage;

type FieldsetPart = "legend" | FieldMessage;

export interface FieldIds {
  root: string;
  /** The control's id: the one a control registered, else the field's own. */
  control: string;
  label: string;
  helperText: string;
  errorText: string;
}

export interface FieldContextValue extends FieldState {
  ids: FieldIds;
  /** The rendered label's id. */
  labelId: string | undefined;
  /** The rendered messages' ids, the error first, as a control's `aria-describedby`. */
  describedBy: string | undefined;
  /** Focuses the control for a label whose `htmlFor` reaches no element. */
  focusControl: (() => void) | undefined;
  /** Sets `focusControl` until the returned function is called. */
  registerFocusControl: (focus: () => void) => () => void;
  registerControlId: (source: symbol, id: string | undefined) => void;
  resetControlId: () => void;
  reportRendered: ReportRendered<FieldPart>;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export const useFieldContext = (): FieldContextValue | null => useContext(FieldContext);

export interface FieldsetContextValue {
  disabled: boolean;
  invalid: boolean;
  ids: { legend: string; helperText: string; errorText: string };
  /** The rendered legend's id. */
  legendId: string | undefined;
  /** The rendered messages' ids, the error first, as the fieldset's `aria-describedby`. */
  describedBy: string | undefined;
  reportRendered: ReportRendered<FieldsetPart>;
}

export const FieldsetContext = createContext<FieldsetContextValue | null>(null);

export const useFieldsetContext = (): FieldsetContextValue | null => useContext(FieldsetContext);

export interface UseFieldRootOptions extends Partial<FieldState> {
  id?: string | undefined;
}

/** The state and registries an enclosing `Field` gives its label, control and messages. */
export function useFieldRoot({
  id: idProp,
  disabled,
  invalid = false,
  readOnly = false,
  required = false,
}: UseFieldRootOptions): FieldContextValue {
  const fieldset = useFieldsetContext();
  const uid = useId();
  const id = idProp ?? uid;
  const defaultControlId = id;
  const [controlId, setControlId] = useState<string | undefined>(undefined);
  const [rendered, reportRendered] = useRenderedParts<FieldPart>();
  const [focusControl, setFocusControl] = useState<(() => void) | undefined>(undefined);
  const registrations = useRef<Map<symbol, string> | null>(null);

  const registerFocusControl = useCallback((focus: () => void) => {
    setFocusControl(() => focus);
    return () => setFocusControl((current) => (current === focus ? undefined : current));
  }, []);

  const registerControlId = useCallback((source: symbol, nextId: string | undefined) => {
    registrations.current ??= new Map();
    const map = registrations.current;
    if (nextId === undefined) map.delete(source);
    else map.set(source, nextId);
    setControlId((prev) => {
      // A hidden subtree (`<Activity>`, a re-suspending Suspense) drops its effects but keeps its DOM.
      if (map.size === 0) return prev;
      const ids = [...map.values()];
      return prev !== undefined && ids.includes(prev) ? prev : ids[0];
    });
  }, []);

  const resetControlId = useCallback(() => {
    if (!registrations.current?.size) setControlId(undefined);
  }, []);

  const resolvedDisabled = disabled ?? fieldset?.disabled ?? false;
  const ids = useMemo<FieldIds>(
    () => ({
      root: `field::${id}`,
      control: controlId ?? defaultControlId,
      label: `field::${id}::label`,
      helperText: `field::${id}::helper-text`,
      errorText: `field::${id}::error-text`,
    }),
    [id, controlId, defaultControlId],
  );
  const labelId = rendered.label;
  const describedBy = messagesDescribedBy(rendered, invalid);

  return useMemo(
    () => ({
      ids,
      labelId,
      describedBy,
      focusControl,
      registerFocusControl,
      disabled: resolvedDisabled,
      invalid,
      readOnly,
      required,
      registerControlId,
      resetControlId,
      reportRendered,
    }),
    [
      ids,
      labelId,
      describedBy,
      focusControl,
      registerFocusControl,
      resolvedDisabled,
      invalid,
      readOnly,
      required,
      registerControlId,
      resetControlId,
      reportRendered,
    ],
  );
}

export interface UseFieldsetRootOptions {
  id?: string | undefined;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
}

/** The state and message registry an enclosing `Fieldset` gives its legend, messages and fields. */
export function useFieldsetRoot({
  id: idProp,
  disabled = false,
  invalid = false,
}: UseFieldsetRootOptions): FieldsetContextValue {
  const uid = useId();
  const id = idProp ?? uid;
  const [rendered, reportRendered] = useRenderedParts<FieldsetPart>();
  const ids = useMemo(
    () => ({
      legend: `fieldset::${id}::legend`,
      helperText: `fieldset::${id}::helper-text`,
      errorText: `fieldset::${id}::error-text`,
    }),
    [id],
  );
  const legendId = rendered.legend;
  const describedBy = messagesDescribedBy(rendered, invalid);
  return useMemo(
    () => ({ disabled, invalid, ids, legendId, describedBy, reportRendered }),
    [disabled, invalid, ids, legendId, describedBy, reportRendered],
  );
}

function messagesDescribedBy(rendered: RenderedParts<FieldMessage>, invalid: boolean) {
  return joinIds([invalid ? rendered.errorText : undefined, rendered.helperText]);
}

/**
 * Registers a control's own `id` with the enclosing `Field`, so its label points at it, and
 * returns the id the control renders: `id`, else the field's control id.
 */
export function useFieldControlId(id: string | undefined): string | undefined {
  const field = useFieldContext();
  const [source] = useState(() => Symbol("field-control"));
  const register = field?.registerControlId;
  const reset = field?.resetControlId;

  useLayoutEffect(() => {
    if (!register || !reset) return;
    if (id === undefined) {
      reset();
      return;
    }
    register(source, id);
    return () => register(source, undefined);
  }, [register, reset, source, id]);

  return id ?? field?.ids.control;
}

/** Registers a rendered label, `id` when given, with the enclosing `Field` and returns its id. */
export function useFieldLabelId(id: string | undefined): string | undefined {
  const field = useFieldContext();
  return useReportRendered(field?.reportRendered, "label", id ?? field?.ids.label);
}

interface FieldMessageOwner {
  ids: Record<FieldMessage, string>;
  reportRendered: ReportRendered<FieldMessage>;
}

/**
 * A `Field`'s or `Fieldset`'s helper or error text's props, registering it, `id` when given, as
 * rendered so the owner is described by it.
 */
export function useFieldMessageProps(owner: FieldMessageOwner, message: FieldMessage, id?: string) {
  const messageId = useReportRendered(owner.reportRendered, message, id ?? owner.ids[message]);
  return message === "errorText"
    ? { id: messageId, "aria-live": "polite" as const }
    : { id: messageId };
}

/**
 * Has the enclosing `Field`'s label call `focus` for a control its `htmlFor` can't point at, such as
 * a group or a popup trigger. `undefined` registers nothing.
 */
export function useFieldFocusControl(focus: (() => void) | undefined) {
  const register = useFieldContext()?.registerFocusControl;
  const latest = useLatestRef(focus);
  const registered = focus !== undefined;

  useLayoutEffect(() => {
    if (!register || !registered) return;
    return register(() => latest.current?.());
  }, [register, registered, latest]);
}

interface FieldTrigger {
  /** The id the trigger renders, a consumer's included. */
  triggerId: string;
  triggerEl: HTMLElement | null;
}

/**
 * A popup trigger's props for the enclosing `Field`'s label, messages and `invalid`; the label
 * focuses the trigger.
 */
export function useFieldTriggerProps({ triggerId, triggerEl }: FieldTrigger) {
  const field = useFieldContext();
  useFieldFocusControl(() => triggerEl?.focus());
  if (!field) return {};

  return {
    // The trigger's own id keeps its value in the name, after the label.
    "aria-labelledby": field.labelId ? `${field.labelId} ${triggerId}` : undefined,
    "aria-describedby": field.describedBy,
    "aria-invalid": field.invalid || undefined,
  };
}

/** Joins `aria-describedby` ids, dropping blanks and repeats. */
export function joinIds(ids: ReadonlyArray<string | false | null | undefined>): string | undefined {
  const unique = new Set<string>();
  for (const entry of ids) {
    if (!entry) continue;
    for (const id of entry.split(" ")) if (id) unique.add(id);
  }
  return unique.size ? [...unique].join(" ") : undefined;
}
