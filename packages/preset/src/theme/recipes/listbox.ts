import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import {
  type ControlSize,
  controlGap,
  controlPxCompact,
  controlText,
  dropdownItemGroupLabel,
} from "./control-size";
import { DROPDOWN_CONTENT_P, dropdownTier, optionListSlots, tintedRow } from "./dropdown";
import { fieldLabel } from "./field";

/** A popover body reads the inset to pull a listbox flush with its edges. */
export const listboxGlobalVars: GlobalVarsDefinition = {
  "--listbox-text-inset": { syntax: "*", inherits: true },
};

const tier = (
  size: ControlSize,
  { text, caption, hint }: Record<"text" | "caption" | "hint", ControlSize>,
) => ({
  ...dropdownTier(size, text),
  root: {
    "--listbox-text-inset": `calc({spacing.${DROPDOWN_CONTENT_P}} + ${controlPxCompact(size)})`,
  },
  itemHint: { ...controlText(hint), ps: controlGap(size) },
  itemGroupLabel: { ...dropdownItemGroupLabel(size), ...controlText(caption) },
});

export const listbox = defineSlotRecipe({
  className: "listbox",
  slots: [
    "label",
    "input",
    "item",
    "itemText",
    "itemIndicator",
    "itemGroup",
    "itemGroupLabel",
    "content",
    "root",
    "valueText",
    "empty",
    "itemHint",
    "itemActions",
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
    content: {
      background: "neutral.surface.bg",
      display: "flex",
      flexDirection: "column",
      maxH: "96",
      minH: "0",
      outline: 0,
    },
    itemHint: {
      color: "fg.subtle",
      display: "inline-flex",
      alignItems: "center",
      flexShrink: "0",
      whiteSpace: "nowrap",
    },
    itemActions: {
      display: "inline-flex",
      alignItems: "center",
      gap: "1",
      flexShrink: "0",
      transition: "opacity 0.12s ease-out",
    },
    valueText: {
      fontWeight: "normal",
      color: "colorPalette.plain.fg",
    },
  },
  defaultVariants: {
    size: "md",
    actionsVisibility: "hover",
    actionsPosition: "inline",
    indicatorPosition: "end",
    selection: "check",
  },
  variants: {
    selection: {
      check: {},
      tint: {
        item: { _selected: tintedRow },
        itemIndicator: { display: "none" },
      },
    },
    // Selected-item indicator placement. `start` reserves a constant logical-start gutter and
    // pins the indicator into it (absolute → out of flow), so rows stay aligned and text never
    // shifts when the indicator hides on selection change.
    indicatorPosition: {
      end: {},
      start: {
        item: { position: "relative" },
        itemText: { marginInlineStart: "6" },
        itemIndicator: {
          position: "absolute",
          insetInlineStart: "1",
          top: "0",
          bottom: "0",
        },
      },
      none: {
        itemIndicator: { display: "none" },
      },
    },
    actionsVisibility: {
      always: {},
      hover: {
        itemActions: { _unrevealed: { opacity: "0" } },
      },
    },
    actionsPosition: {
      inline: {},
      overlay: {
        item: { position: "relative" },
        itemActions: {
          position: "absolute",
          insetInlineEnd: "1",
          top: "50%",
          translate: "0 -50%",
          px: "0.5",
          borderRadius: "sm",
          bg: "neutral.surface.bg",
          boxShadow: "sm",
        },
      },
    },
    size: {
      xs: tier("xs", { text: "2xs", caption: "2xs", hint: "2xs" }),
      sm: tier("sm", { text: "xs", caption: "xs", hint: "2xs" }),
      md: tier("md", { text: "sm", caption: "xs", hint: "xs" }),
      lg: tier("lg", { text: "md", caption: "sm", hint: "xs" }),
    },
  },
});
