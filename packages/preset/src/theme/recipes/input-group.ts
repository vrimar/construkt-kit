import { defineSlotRecipe } from "@pandacss/dev";

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
        element: { minW: "7", _icon: { boxSize: "3.5" } },
        root: {
          "& > :is(input, button):not(:first-child)": { ps: "6!" },
          "& > :is(input, button):not(:last-child)": { pe: "6!" },
        },
      },
      xs: {
        element: { minW: "8", _icon: { boxSize: "4" } },
        root: {
          "& > :is(input, button):not(:first-child)": { ps: "7!" },
          "& > :is(input, button):not(:last-child)": { pe: "7!" },
        },
      },
      sm: {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: "8!" },
          "& > :is(input, button):not(:last-child)": { pe: "8!" },
        },
        element: { minW: "9", _icon: { boxSize: "4.5" } },
      },
      md: {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: "9!" },
          "& > :is(input, button):not(:last-child)": { pe: "9!" },
        },
        element: { minW: "10", _icon: { boxSize: "5" } },
      },
      lg: {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: "10!" },
          "& > :is(input, button):not(:last-child)": { pe: "10!" },
        },
        element: { minW: "11", _icon: { boxSize: "5" } },
      },
      xl: {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: "11!" },
          "& > :is(input, button):not(:last-child)": { pe: "11!" },
        },
        element: { minW: "11", _icon: { boxSize: "5.5" } },
      },
      "2xl": {
        root: {
          "& > :is(input, button):not(:first-child)": { ps: "12!" },
          "& > :is(input, button):not(:last-child)": { pe: "12!" },
        },
        element: { minW: "12", _icon: { boxSize: "6" } },
      },
    },
  },
});
