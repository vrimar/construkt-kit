export const globalCss = {
  // color-scheme sits on root-matching selectors (the `.dark` class is on <html>), not the `_dark` condition.
  ":where(:root, .light)": { colorScheme: "light" },
  ".dark": { colorScheme: "dark" },
  html: {
    colorPalette: "brand",
    height: "100%",
    width: "100%",
    // Control-size knobs. Override on :root or any container to rescale the control surface at
    // runtime; must stay on :root/html (not "*") so scoped overrides cascade to descendants.
    "--control-base-h": "sizes.9",
    "--control-step": "sizes.1",
    "--control-base-px": "spacing.3",
    "--control-base-gap": "spacing.2",
    "--control-base-icon": "sizes.4",
    "--control-base-box": "sizes.4.5",
    "--control-base-font": "fontSizes.sm",
    "--control-input-font-min": "0px",
    // Proportional density knobs for container/overlay padding and graphical element sizes.
    "--surface-scale": "1",
    "--visual-scale": "1",
    "@media (pointer: coarse)": {
      "--control-base-h": "sizes.11",
      "--control-base-row-h": "sizes.11",
      // iOS zooms into any focused input whose text is under 16px.
      "--control-input-font-min": "1rem",
    },
  },
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
