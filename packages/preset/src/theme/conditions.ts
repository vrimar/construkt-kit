export const conditions = {
  extend: {
    light: ":where(:root, .light) &",
    invalid: "&:is(:user-invalid, [data-invalid], [aria-invalid=true])",
    hover: {
      "@media (hover: hover)": {
        // `:where` keeps hover below every state selector, since Panda emits media rules last.
        "&:where(:not(:disabled, [data-disabled])):where(:hover, [data-hover])": "@slot",
      },
    },
    active: "&:where(:not(:disabled, [data-disabled])):is(:active, [data-active])",
    checked:
      "&:is(:checked, [data-checked], [data-state=checked], [aria-checked=true], [data-state=indeterminate])",
    on: "&:is([data-state=on])",
    pinned: "&:is([data-pinned])",
  },
} as const;
