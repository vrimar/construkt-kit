/** A boolean presence attribute's value: present while `condition` holds. */
export const dataAttr = (condition: boolean | undefined): "" | undefined =>
  condition ? "" : undefined;

/** `data-open` while `open`, `data-closed` otherwise. */
export const openStateAttributes = (open: boolean): { "data-open": "" } | { "data-closed": "" } =>
  open ? { "data-open": "" } : { "data-closed": "" };

export type CheckedState = boolean | "indeterminate";

export const checkedStateAttributes = (checked: CheckedState) => ({
  "data-checked": dataAttr(checked === true),
  "data-unchecked": dataAttr(checked === false),
  "data-indeterminate": dataAttr(checked === "indeterminate"),
});

export interface FieldStateFlags {
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
}

/** The field-state attributes of the flags given; a flag left out leaves its attribute off. */
export const fieldStateAttributes = (state: FieldStateFlags) => ({
  "data-disabled": dataAttr(state.disabled),
  "data-invalid": dataAttr(state.invalid),
  "data-read-only": dataAttr(state.readOnly),
  "data-required": dataAttr(state.required),
});
