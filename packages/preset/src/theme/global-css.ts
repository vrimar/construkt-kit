export const globalCss = {
  html: {
    colorPalette: "brand",
    height: "100%",
    width: "100%",
  },
  body: {
    height: "100%",
    width: "100%",
    overflow: "hidden",
    fontFamily: "body",
    background: "canvas",
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
