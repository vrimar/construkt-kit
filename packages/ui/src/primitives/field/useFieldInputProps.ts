import type { AriaAttributes } from "react";

import { dataAttr } from "../render";
import { joinIds, useFieldContext } from "./FieldContext";
import { type FieldControlState, useFieldControlState } from "./useFieldControlState";

interface NativeControlProps {
  id?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: AriaAttributes["aria-invalid"] | undefined;
}

/** A native text control's props with `state`'s id, description and states. */
export function fieldInputState<P extends NativeControlProps>(
  state: FieldControlState,
  props: P,
): P {
  return {
    ...props,
    id: state.id,
    "aria-describedby": joinIds([props["aria-describedby"], state.describedBy]),
    "aria-invalid": props["aria-invalid"] ?? (state.invalid || undefined),
    "data-invalid": dataAttr(state.invalid),
    disabled: state.disabled,
    readOnly: state.readOnly,
    required: state.required,
  };
}

/** A native text control's props, with the enclosing `Field`'s id, description and states. */
export function useFieldInputProps<P extends NativeControlProps>(props: P): P {
  const field = useFieldContext();
  const state = useFieldControlState({
    id: props.id,
    disabled: props.disabled,
    readOnly: props.readOnly,
    required: props.required,
  });
  return field ? fieldInputState(state, props) : props;
}
