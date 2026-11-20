export const conditions = {
  extend: {
    dark: ".dark &:not(:where(.dark .light *)), :where(.dark .light) .dark &",
    light: ":where(:root, .light) &",
    invalid: "&:is(:user-invalid, [data-invalid], [aria-invalid=true])",
    hover: {
      "@media (hover: hover)": {
        // `:where` keeps hover below every state selector, since Panda emits media rules last.
        "&:where(:not(:disabled, [data-disabled])):where(:hover, [data-hover])": "@slot",
      },
    },
    unrevealed: {
      "@media (hover: hover)": {
        "[data-reveal-group]:not(:hover, :focus-within, [data-highlighted], [data-dragging], :has([aria-haspopup][aria-expanded=true])) &":
          "@slot",
      },
    },
    active: "&:where(:not(:disabled, [data-disabled])):is(:active, [data-active])",
    checked:
      "&:is(:checked, [data-checked], [data-state=checked], [aria-checked=true], [data-state=indeterminate])",
    unchecked: "&:is([data-unchecked], [data-state=unchecked])",
    // Panda's own matches `:read-only`, which every element that isn't an editable field matches.
    readOnly: "&:is([readonly], [data-read-only], [aria-readonly=true])",
    half: "&:is([data-half])",
    on: "&:is([data-pressed])",
    afterChecked: "[data-checked] + &",
    afterPressed: "[data-pressed] + &",
    filled: "&:is([data-filled])",
    pinned: "&:is([data-pinned])",
    pinnedLeft: "&:is([data-pinned=left])",
    overflowX: "&:is([data-overflow-x])",
    overflowY: "&:is([data-overflow-y])",
    atTop: "&:is([data-at-top])",
    atBottom: "&:is([data-at-bottom])",
    atLeft: "&:is([data-at-left])",
    atRight: "&:is([data-at-right])",
    scrolling: "&:is([data-scrolling])",
    collapsed: "&:is([data-collapsed])",
    notFirst: "&:not(:first-child)",
    swiping: "&:is([data-swiping])",
    startingStyle: "&:is([data-starting-style])",
    swipeUp: "&[data-swipe-direction=up]",
    swipeRight: "&[data-swipe-direction=right]",
    swipeLeft: "&[data-swipe-direction=left]",
    sideTop: "&[data-side=top]",
    sideRight: "&[data-side=right]",
    sideBottom: "&[data-side=bottom]",
    sideLeft: "&[data-side=left]",
  },
} as const;
