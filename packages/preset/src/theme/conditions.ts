export const conditions = {
  extend: {
    light: ":root &, .light &",
    invalid: "&:is(:user-invalid, [data-invalid], [aria-invalid=true])",
    hover: "&:not(:disabled):hover",
    active: "&:not(:disabled):active",
    checked:
      "&:is(:checked, [data-checked], [data-state=checked], [aria-checked=true], [data-state=indeterminate])",
    on: "&:is([data-state=on])",
    pinned: "&:is([data-pinned])",
    // Only use Ark UI's data attribute (not CSS :focus-visible) to avoid
    // browsers showing the ring on mouse/touch click for form controls.
    _focusVisible: "&[data-focus-visible]",
  },
} as const;
