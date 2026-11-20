import {
  type FieldState,
  useFieldContext,
  useFieldControlId,
  useFieldsetContext,
} from "./FieldContext";

export interface FieldControlStateOptions extends Partial<FieldState> {
  /** The control's own `id`; inside a `Field` it becomes the id the label points at. */
  id?: string | undefined;
}

export interface FieldControlState extends FieldState {
  id: string | undefined;
  /** The enclosing `Field`'s rendered label. */
  labelId: string | undefined;
  /** The enclosing `Field`'s rendered messages. */
  describedBy: string | undefined;
}

/**
 * A control's id and states: its own props where given, else the enclosing `Field`'s, else the
 * enclosing `Fieldset`'s `disabled`.
 */
export function useFieldControlState({
  id,
  disabled,
  invalid,
  readOnly,
  required,
}: FieldControlStateOptions): FieldControlState {
  const field = useFieldContext();
  const fieldset = useFieldsetContext();
  return {
    id: useFieldControlId(id),
    labelId: field?.labelId,
    describedBy: field?.describedBy,
    disabled: disabled ?? field?.disabled ?? fieldset?.disabled ?? false,
    invalid: invalid ?? field?.invalid ?? false,
    readOnly: readOnly ?? field?.readOnly ?? false,
    required: required ?? field?.required ?? false,
  };
}
