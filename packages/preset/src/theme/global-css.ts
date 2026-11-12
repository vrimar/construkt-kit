// No font or row-height knobs here: text never scales, and coarse pointers keep their 44px rows.
const density = {
  compact: {
    "--control-base-h": "sizes.8",
    "--control-base-px": "spacing.2.5",
    "--control-base-gap": "spacing.1.5",
    "--control-base-py": "spacing.1",
    "--surface-scale": "0.75",
  },
  default: {
    "--control-base-h": "sizes.9",
    "--control-base-px": "spacing.3",
    "--control-base-gap": "spacing.2",
    "--control-base-py": "0.4375rem",
    "--surface-scale": "1",
  },
  relaxed: {
    "--control-base-h": "sizes.10",
    "--control-base-px": "spacing.3.5",
    "--control-base-gap": "spacing.2.5",
    "--control-base-py": "spacing.2.5",
    "--surface-scale": "1.25",
  },
};

export const globalCss = {
  // color-scheme sits on root-matching selectors (the `.dark` class is on <html>), not the `_dark` condition.
  ":where(:root, .light)": { colorScheme: "light" },
  ".dark": { colorScheme: "dark" },
  // Both resolve at the declaring element, so a nested scope would inherit the outer scheme's values.
  ":where(.light, .dark)": { colorPalette: "brand", color: "fg" },
  html: {
    colorPalette: "brand",
    height: "100%",
    width: "100%",
    // Control-size knobs. Override on :root or any container to rescale the control surface at
    // runtime; must stay on :root/html (not "*") so scoped overrides cascade to descendants.
    ...density.default,
    "--control-step": "sizes.1",
    "--control-base-icon": "sizes.4",
    "--control-base-box": "sizes.4.5",
    "--control-base-font": "fontSizes.sm",
    "--control-input-font-min": "0px",
    "--visual-scale": "1",
    "@media (pointer: coarse)": {
      "--control-base-row-h": "sizes.11",
      // iOS zooms into any focused input whose text is under 16px.
      "--control-input-font-min": "1rem",
    },
  },
  ...Object.fromEntries(
    Object.entries(density).map(([mode, knobs]) => [`[data-density=${mode}]`, knobs]),
  ),
  "a, button, input, label, select, summary, textarea, [role=button]": {
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
  },
  body: {
    height: "100%",
    width: "100%",
    overflow: "hidden",
    fontFamily: "body",
    background: "bg",
    color: "fg",
  },
  ".App": {
    height: "100%",
    width: "100%",
  },
  "*": {
    "--global-color-border": "colors.border",
    "--global-color-placeholder": "colors.fg.subtle",
    "--global-color-selection": "colors.colorPalette.subtle.bg",
    "--global-color-focus-ring": "colors.colorPalette.solid.bg",
  },
};
