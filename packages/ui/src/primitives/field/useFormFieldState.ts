import {
  type FieldControlState,
  type FieldControlStateOptions,
  useFieldControlState,
} from "./useFieldControlState";
import { type FormControlOptions, useFormControl } from "./useFormControl";

/**
 * A form control's id and states, as `useFieldControlState` gives them, also disabled while a native
 * `<fieldset disabled>` encloses it, with `form.onReset` called when its form resets.
 */
export function useFormFieldState(
  options: FieldControlStateOptions,
  form: FormControlOptions,
): FieldControlState {
  const field = useFieldControlState(options);
  const { fieldsetDisabled } = useFormControl(form);
  return { ...field, disabled: field.disabled || fieldsetDisabled };
}
