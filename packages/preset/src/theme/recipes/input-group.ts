import { defineSlotRecipe } from "@pandacss/dev";

import { type ControlSize, controlH, controlIcon } from "./control-size";

const tier = (size: ControlSize) => ({
  root: {
    "& > :is(input, button):not(:first-child)": { ps: `${controlH(size)}!` },
    "& > :is(input, button):not(:last-child)": { pe: `${controlH(size)}!` },
  },
  element: { minW: controlH(size), _icon: { boxSize: controlIcon(size) } },
});

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
      "2xs": tier("2xs"),
      xs: tier("xs"),
      sm: tier("sm"),
      md: tier("md"),
      lg: tier("lg"),
      xl: tier("xl"),
      "2xl": tier("2xl"),
    },
  },
});
