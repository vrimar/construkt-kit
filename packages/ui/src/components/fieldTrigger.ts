import { useFieldContext } from "@ark-ui/react/field";

export function useFieldTriggerProps(triggerId: string | undefined) {
  const field = useFieldContext();
  if (!field) return {};

  return {
    // The trigger's own id keeps its value in the name, after the label.
    "aria-labelledby": triggerId && `${field.ids.label} ${triggerId}`,
    "aria-describedby": field.ariaDescribedby,
    "aria-invalid": field.invalid || undefined,
  };
}
