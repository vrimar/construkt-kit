import { defineSlotRecipe } from "@pandacss/dev";

import { controlH, controlIcon } from "./control-size";

export const inputGroup = defineSlotRecipe({
  className: "input-group",
  slots: ["root", "element"],
  jsx: ["InputGroup", "SearchInput", "PasswordInput", "FormFileUpload"],
  base: {
    root: {
      position: "relative",
      width: "full",
    },
    element: {
      alignItems: "center",
      color: "fg.muted",
      display: "flex",
      height: "full",
      justifyContent: "center",
      position: "absolute",
      zIndex: "2",
      _icon: {
        color: "fg.subtle",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      "2xs": {
        element: { minW: controlH("2xs"), _icon: { boxSize: controlIcon("2xs") } },
        root: {
          "& > :is(input, button):not(:first-child)": { ps: `${controlH("2xs")}!` },
          "& > :is(input, button):not(:last-child)": { pe: `${controlH("2xs")}!` },
        },
      },
      xs: {
        element: { minW: controlH("xs"), _icon: { boxSize: controlIcon("xs") } },
        root: {
          "& > :is(input, button):not(:first-child)": { ps: `${controlH("xs")}!` },
          "& > :is(input, button):not(:last-child)": { pe: `${controlH("xs")}!` },
        },
      },
      sm: {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: `${controlH("sm")}!` },
          "& > :is(input, button):not(:last-child)": { pe: `${controlH("sm")}!` },
        },
        element: { minW: controlH("sm"), _icon: { boxSize: controlIcon("sm") } },
      },
      md: {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: `${controlH("md")}!` },
          "& > :is(input, button):not(:last-child)": { pe: `${controlH("md")}!` },
        },
        element: { minW: controlH("md"), _icon: { boxSize: controlIcon("md") } },
      },
      lg: {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: `${controlH("lg")}!` },
          "& > :is(input, button):not(:last-child)": { pe: `${controlH("lg")}!` },
        },
        element: { minW: controlH("lg"), _icon: { boxSize: controlIcon("lg") } },
      },
      xl: {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: `${controlH("xl")}!` },
          "& > :is(input, button):not(:last-child)": { pe: `${controlH("xl")}!` },
        },
        element: { minW: controlH("xl"), _icon: { boxSize: controlIcon("xl") } },
      },
      "2xl": {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: `${controlH("2xl")}!` },
          "& > :is(input, button):not(:last-child)": { pe: `${controlH("2xl")}!` },
        },
        element: { minW: controlH("2xl"), _icon: { boxSize: controlIcon("2xl") } },
      },
    },
  },
});
