import { useFieldContext } from "../primitives/field";

export function useFieldTriggerProps(triggerId: string | undefined) {
  const field = useFieldContext();
  if (!field) return {};

  return {
    // The trigger's own id keeps its value in the name, after the label.
    "aria-labelledby": triggerId && field.labelId ? `${field.labelId} ${triggerId}` : undefined,
    "aria-describedby": field.describedBy,
    "aria-invalid": field.invalid || undefined,
  };
}

/** The enclosing `Field`'s ids and states, for a text control it labels and describes. */
export function useFieldControl() {
  const field = useFieldContext();
  if (!field) return undefined;

  return {
    id: field.ids.control,
    labelId: field.labelId,
    describedBy: field.describedBy,
    invalid: field.invalid,
    disabled: field.disabled,
    readOnly: field.readOnly,
    required: field.required,
  };
}
