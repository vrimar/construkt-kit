import { defineSlotRecipe } from "@pandacss/dev";

export const loadingOverlay = defineSlotRecipe({
  className: "loading-overlay",
  slots: ["root", "content", "tip"],
  base: {
    root: {
      position: "absolute",
      inset: "0",
      zIndex: "overlay",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      opacity: "0",
      visibility: "hidden",
      pointerEvents: "none",
      transition:
        "opacity .3s ease-in-out, visibility 0s ease-in-out .3s, background .3s ease-in-out",
      _loading: {
        opacity: "1",
        visibility: "visible",
        pointerEvents: "auto",
        transition: "opacity .3s ease-in-out, background .3s ease-in-out",
      },
    },
    content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6",
      color: "brand.fg",
      userSelect: "none",
    },
  },
  defaultVariants: {
    size: "xl",
    backdrop: true,
    relative: false,
  },
  variants: {
    size: {
      inherit: {},
      xs: { tip: { fontSize: "xs" } },
      sm: { tip: { fontSize: "xs" } },
      md: { tip: { fontSize: "sm" } },
      lg: { tip: { fontSize: "sm" } },
      xl: { tip: { fontSize: "md" } },
      "2xl": { tip: { fontSize: "lg" } },
    },
    backdrop: {
      true: { root: { bg: "bg/75" } },
      false: {},
    },
    relative: {
      true: { root: { position: "relative", minHeight: { base: "240px", md: "400px" } } },
      false: {},
    },
  },
});
