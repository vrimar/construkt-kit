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

export interface FieldState {
  disabled: boolean;
  invalid: boolean;
  readOnly: boolean;
  required: boolean;
}

export type FieldMessage = "helperText" | "errorText";

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
  registerControlId: (source: symbol, id: string | undefined) => void;
  resetControlId: () => void;
  setLabelId: (id: string | undefined) => void;
  setMessageRendered: (message: FieldMessage, rendered: boolean) => void;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export const useFieldContext = (): FieldContextValue | null => useContext(FieldContext);

export interface FieldsetContextValue {
  disabled: boolean;
  invalid: boolean;
  ids: { legend: string; helperText: string; errorText: string };
  /** The rendered messages' ids, the error first, as the fieldset's `aria-describedby`. */
  describedBy: string | undefined;
  setMessageRendered: (message: FieldMessage, rendered: boolean) => void;
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
  const [labelId, setLabelId] = useState<string | undefined>(undefined);
  const registrations = useRef<Map<symbol, string> | null>(null);

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
  const { describedBy, setMessageRendered } = useMessages(ids, invalid);

  return useMemo(
    () => ({
      ids,
      labelId,
      describedBy,
      disabled: resolvedDisabled,
      invalid,
      readOnly,
      required,
      registerControlId,
      resetControlId,
      setLabelId,
      setMessageRendered,
    }),
    [
      ids,
      labelId,
      describedBy,
      resolvedDisabled,
      invalid,
      readOnly,
      required,
      registerControlId,
      resetControlId,
      setMessageRendered,
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
  const ids = useMemo(
    () => ({
      legend: `fieldset::${id}::legend`,
      helperText: `fieldset::${id}::helper-text`,
      errorText: `fieldset::${id}::error-text`,
    }),
    [id],
  );
  const { describedBy, setMessageRendered } = useMessages(ids, invalid);
  return useMemo(
    () => ({ disabled, invalid, ids, describedBy, setMessageRendered }),
    [disabled, invalid, ids, describedBy, setMessageRendered],
  );
}

function useMessages(ids: { helperText: string; errorText: string }, invalid: boolean) {
  const [messages, setMessages] = useState({ helperText: false, errorText: false });
  const setMessageRendered = useCallback((message: FieldMessage, rendered: boolean) => {
    setMessages((prev) => (prev[message] === rendered ? prev : { ...prev, [message]: rendered }));
  }, []);
  const describedBy = joinIds([
    messages.errorText && invalid ? ids.errorText : undefined,
    messages.helperText ? ids.helperText : undefined,
  ]);
  return { describedBy, setMessageRendered };
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

/** Registers a rendered label with the enclosing `Field` and returns the id it renders. */
export function useFieldLabelId(id: string | undefined): string | undefined {
  const field = useFieldContext();
  const labelId = id ?? field?.ids.label;
  const setLabelId = field?.setLabelId;

  useLayoutEffect(() => {
    if (!setLabelId) return;
    setLabelId(labelId);
    return () => setLabelId(undefined);
  }, [setLabelId, labelId]);

  return labelId;
}

/** Registers a rendered helper or error text, so the field's control is described by it. */
export function useFieldMessage(
  register: ((message: FieldMessage, rendered: boolean) => void) | undefined,
  message: FieldMessage,
) {
  useLayoutEffect(() => {
    if (!register) return;
    register(message, true);
    return () => register(message, false);
  }, [register, message]);
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
