import { defineSlotRecipe } from "@pandacss/dev";

import {
  type ControlSize,
  controlHCompact,
  controlPx,
  controlPxCompact,
  controlIcon,
  controlText,
  dropdownItemGroupLabel,
} from "./control-size";
import { dropdownTier, optionListSlots } from "./dropdown";
import { fieldLabel } from "./field";
import { floatingPositioner } from "./floating";
import { input, inputSlotVariants } from "./input";

type ComboboxSize = "xs" | "sm" | "md" | "lg" | "xl";

const tier = (size: ComboboxSize, { pe, caption }: { pe: string; caption: ControlSize }) => ({
  ...dropdownTier(size),
  input: { ...input.variants.size[size], pe },
  itemGroupLabel: { ...dropdownItemGroupLabel(size), ...controlText(caption) },
  indicatorGroup: { px: controlPx(size), _icon: { boxSize: controlIcon(size) } },
  empty: { px: controlPxCompact(size), minH: controlHCompact(size) },
});

export const combobox = defineSlotRecipe({
  className: "combobox",
  slots: [
    "root",
    "clearTrigger",
    "content",
    "control",
    "input",
    "item",
    "itemGroup",
    "itemGroupLabel",
    "itemIndicator",
    "itemText",
    "label",
    "list",
    "positioner",
    "trigger",
    "empty",
    "indicatorGroup",
  ],
  base: {
    ...optionListSlots,
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
      width: "full",
    },
    label: fieldLabel,
    input: {
      ...input.base,
      truncate: true,
    },
    control: {
      position: "relative",
    },
    positioner: floatingPositioner,
    content: {
      layerStyle: "dropdown.surface",
      display: "flex",
      flexDirection: "column",
      maxH: "min(var(--available-height), {sizes.96})",
      minWidth: "max(var(--anchor-width), {sizes.40})",
      outline: "0",
      overflowY: "auto",
      _empty: {
        "&:not(:has([data-slot=empty]))": { opacity: 0 },
      },
    },
    indicatorGroup: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "1",
      pos: "absolute",
      insetEnd: "0",
      top: "0",
      bottom: "0",
    },
    trigger: {
      color: "fg.subtle",
    },
    clearTrigger: {
      color: "fg.muted",
    },
    empty: {
      display: "flex",
      alignItems: "center",
      color: "fg.subtle",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: inputSlotVariants("input", ["outline", "surface", "subtle"]),
    size: {
      xs: tier("xs", { pe: "12", caption: "2xs" }),
      sm: tier("sm", { pe: "14", caption: "xs" }),
      md: tier("md", { pe: "14", caption: "xs" }),
      lg: tier("lg", { pe: "16", caption: "sm" }),
      xl: tier("xl", { pe: "16", caption: "sm" }),
    },
  },
});
