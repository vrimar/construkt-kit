import { defineSlotRecipe } from "@pandacss/dev";

export const hotkeyInput = defineSlotRecipe({
  className: "hotkey-input",
  slots: ["root", "control", "error"],
  base: {
    root: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "1",
    },
    control: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "24",
      height: "6",
      px: "2",
      borderWidth: "1px",
      borderColor: "border.control",
      borderRadius: "md",
      bg: "bg",
      color: "fg",
      fontFamily: "mono",
      fontFeatureSettings: "normal",
      fontWeight: "medium",
      textStyle: "xs",
      whiteSpace: "nowrap",
      cursor: "pointer",
      userSelect: "none",
      outline: "0",
      transition: "common",
      _hover: {
        borderColor: "border.emphasized",
      },
      _focusVisible: {
        focusVisibleRing: "outside",
      },
      _disabled: {
        layerStyle: "disabled",
      },
      "&[data-recording]": {
        borderColor: "colorPalette.solid.bg",
        boxShadowColor: "colorPalette.subtle.bg",
        boxShadow: "0 0 0 3px var(--shadow-color)",
        color: "colorPalette.plain.fg",
        fontFamily: "body",
        fontFeatureSettings: "var(--font-body-features)",
      },
    },
    error: {
      textStyle: "xs",
      color: "fg.error",
      textAlign: "end",
    },
  },
});
