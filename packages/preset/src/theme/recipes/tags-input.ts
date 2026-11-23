import { defineSlotRecipe } from "@pandacss/dev";

import { type ControlSize, controlH, controlInputFont, controlText } from "./control-size";
import { fieldLabel } from "./field";
import { insetRingWithin, invalidRing } from "./input";

const controlRings = {
  ...insetRingWithin,
  _invalid: invalidRing,
};

interface TagsInputTier {
  item: { height: string; px: string };
  icon: string;
  gap: string;
  deleteTrigger: { boxSize: string; me: string };
}

const tier = (size: ControlSize, { item, icon, gap, deleteTrigger }: TagsInputTier) => ({
  root: {
    "--tags-input-height": controlH(size),
    "--tags-input-item-height": item.height,
    "--tags-input-item-px": item.px,
    _icon: { boxSize: icon },
    ...controlText(size),
  },
  input: { fontSize: controlInputFont(size) },
  itemInput: { fontSize: controlInputFont(size) },
  control: { gap },
  itemDeleteTrigger: deleteTrigger,
});

export const tagsInput = defineSlotRecipe({
  className: "tags-input",
  slots: [
    "root",
    "label",
    "control",
    "input",
    "clearTrigger",
    "item",
    "itemPreview",
    "itemInput",
    "itemText",
    "itemDeleteTrigger",
  ],
  base: {
    root: {
      "--tags-input-px": "spacing.1.5",
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
      width: "full",
    },
    label: fieldLabel,
    control: {
      "--input-height": "var(--tags-input-height)",

      minH: "var(--tags-input-height)",
      px: "var(--tags-input-px)",

      alignItems: "center",
      borderRadius: "md",
      display: "flex",
      flexWrap: "wrap",
      pos: "relative",
      transitionDuration: "normal",
      transitionProperty: "border-color, box-shadow",

      _disabled: {
        opacity: "0.5",
      },
    },
    clearTrigger: {
      boxSize: "calc(var(--tags-input-item-height) / 1.5)",

      alignItems: "center",
      borderRadius: "sm",
      color: "fg.muted",
      display: "flex",
      focusRingWidth: "2px",
      focusVisibleRing: "inside",
      justifyContent: "center",
      cursor: { base: "pointer", _disabled: "initial" },
      _icon: {
        boxSize: "5",
      },
    },
    input: {
      px: "calc(var(--tags-input-item-px) / 1.25)",
      height: "var(--tags-input-item-height)",

      flex: "1",
      minWidth: "20",
      outline: "none",
      _readOnly: {
        display: "none",
      },
    },
    itemInput: {
      px: "var(--tags-input-item-px)",
      height: "var(--tags-input-item-height)",
      lineHeight: "1",
      minWidth: "2ch",
      outline: "none",
      verticalAlign: "middle",
    },
    item: {
      // A disabled control already dims its tags; dimming them again would compound.
      "&[data-disabled]:not([data-disabled] *)": {
        layerStyle: "disabled",
      },
    },
    itemDeleteTrigger: {
      display: "flex",
      borderRadius: "sm",
      alignItems: "center",
      justifyContent: "center",
      cursor: { base: "pointer", _disabled: "inherit" },
      _hover: {
        bg: "colorPalette.plain.bg.hover",
      },
    },
    itemPreview: {
      height: "var(--tags-input-item-height)",
      px: "var(--tags-input-item-px)",
      gap: "1",

      alignItems: "center",
      borderRadius: "sm",
      display: "inline-flex",
      userSelect: "none",
    },
    itemText: {
      lineClamp: "1",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {
        control: {
          borderWidth: "1px",
          borderColor: "border.control",
          ...controlRings,
        },
        itemPreview: {
          bg: "colorPalette.subtle.bg",
          color: "colorPalette.subtle.fg",
          _highlighted: {
            bg: "colorPalette.subtle.bg.hover",
          },
        },
      },
      subtle: {
        control: {
          bg: "neutral.subtle.bg",
          color: "neutral.subtle.fg",
          borderWidth: "1px",
          borderColor: "transparent",
          ...controlRings,
        },
        itemPreview: {
          bg: "neutral.surface.bg",
          borderWidth: "1px",
          _highlighted: {
            bg: "neutral.surface.bg.hover",
            borderColor: "neutral.surface.border.hover",
          },
        },
      },
      surface: {
        control: {
          bg: "neutral.surface.bg",
          borderWidth: "1px",
          borderColor: "border.control",
          ...controlRings,
        },
        itemPreview: {
          bg: "colorPalette.subtle.bg",
          color: "colorPalette.subtle.fg",
          _highlighted: {
            bg: "colorPalette.subtle.bg.hover",
          },
        },
      },
    },
    size: {
      xs: tier("xs", {
        item: { height: "sizes.4.5", px: "spacing.1" },
        icon: "3",
        gap: "1",
        deleteTrigger: { boxSize: "3.5", me: "-1px" },
      }),
      sm: tier("sm", {
        item: { height: "sizes.5", px: "spacing.1.5" },
        icon: "3.5",
        gap: "1",
        deleteTrigger: { boxSize: "4", me: "-0.5" },
      }),
      md: tier("md", {
        item: { height: "sizes.6", px: "spacing.2" },
        icon: "3.5",
        gap: "1.5",
        deleteTrigger: { boxSize: "4.5", me: "-1" },
      }),
      lg: tier("lg", {
        item: { height: "sizes.7", px: "spacing.2.5" },
        icon: "4",
        gap: "1.5",
        deleteTrigger: { boxSize: "5", me: "-1.5" },
      }),
    },
  },
});
