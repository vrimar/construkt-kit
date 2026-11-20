/** A boolean presence attribute's value: present while `condition` holds. */
export const dataAttr = (condition: boolean | undefined): "" | undefined =>
  condition ? "" : undefined;

/** `data-open` while `open`, `data-closed` otherwise. */
export const openStateAttributes = (open: boolean): { "data-open": "" } | { "data-closed": "" } =>
  open ? { "data-open": "" } : { "data-closed": "" };
