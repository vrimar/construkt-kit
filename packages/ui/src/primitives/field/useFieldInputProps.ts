import type { AriaAttributes } from "react";

import { dataAttr } from "../render";
import { joinIds, useFieldContext, useFieldControlId } from "./FieldContext";

interface NativeControlProps {
  id?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: AriaAttributes["aria-invalid"] | undefined;
}

/** A native text control's props, with the enclosing `Field`'s id, description and states. */
export function useFieldInputProps<P extends NativeControlProps>(props: P): P {
  const field = useFieldContext();
  const id = useFieldControlId(props.id);
  if (!field) return props;
  return {
    ...props,
    id,
    "aria-describedby": joinIds([props["aria-describedby"], field.describedBy]),
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    "data-invalid": dataAttr(field.invalid),
    disabled: props.disabled ?? field.disabled,
    readOnly: props.readOnly ?? field.readOnly,
    required: props.required ?? field.required,
  };
}
