import { treeViewAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { checkboxControlBase, checkboxControlCheckedState } from "./checkbox-control";
import { controlText } from "./control-size";

export const treeView = defineSlotRecipe({
  className: "tree-view",
  slots: [...treeViewAnatomy.keys(), "dropIndicator"],
  staticCss: [{ size: ["sm", "md"] }],
  base: {
    root: {
      colorPalette: "neutral",
      width: "full",
      display: "flex",
      flexDirection: "column",
    },
    tree: {
      display: "flex",
      flexDirection: "column",
      outline: "none",
      "--tree-padding-inline": "spacing.2",
      "--tree-indent": "spacing.5",
      _icon: {
        boxSize: "var(--tree-icon-size)",
      },
    },
    label: {
      fontWeight: "medium",
      ...controlText("sm"),
    },
    branch: {
      position: "relative",
    },
    branchControl: {
      display: "flex",
      alignItems: "center",
      gap: "1",
      width: "full",
      minWidth: "0",
      position: "relative",
      rounded: "sm",
      cursor: "pointer",
      userSelect: "none",
      ps: "calc(var(--tree-padding-inline) + ((var(--depth) - 1) * var(--tree-indent)))",
      transition: "colors",
      _hover: {
        bg: "bg.subtle",
      },
      _selected: {
        bg: "bg.emphasized",
      },
      focusVisibleRing: "inside",
      focusRingColor: "border.emphasized",
      _disabled: {
        layerStyle: "disabled",
      },
      "&[data-dragging]": {
        opacity: "0.4",
      },
    },
    branchIndicator: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      width: "var(--tree-icon-size)",
      height: "var(--tree-icon-size)",
      transition: "rotate 0.2s",
      transformOrigin: "center",
      color: "fg.subtle",
      _open: {
        rotate: "90deg",
      },
      _icon: {
        width: "1em",
        height: "1em",
      },
    },
    branchText: {
      display: "inline-flex",
      alignItems: "center",
      flex: "1",
      minWidth: "0",
      truncate: true,
    },
    branchContent: {
      position: "relative",
    },
    branchTrigger: {},
    branchIndentGuide: {
      position: "absolute",
      top: "0",
      bottom: "0",
      start:
        "calc(var(--tree-padding-inline) + ((var(--depth) - 1) * var(--tree-indent)) + (var(--tree-icon-size) * 0.5))",
      width: "1px",
      bg: "border",
    },
    item: {
      display: "flex",
      alignItems: "center",
      gap: "1",
      width: "full",
      minWidth: "0",
      position: "relative",
      rounded: "sm",
      cursor: "pointer",
      userSelect: "none",
      ps: "calc(var(--tree-padding-inline) + ((var(--depth) - 1) * var(--tree-indent)))",
      transition: "colors",
      _hover: {
        bg: "bg.subtle",
      },
      _selected: {
        bg: "bg.emphasized",
      },
      focusVisibleRing: "inside",
      focusRingColor: "border.emphasized",
      _disabled: {
        layerStyle: "disabled",
      },
      "&[data-dragging]": {
        opacity: "0.4",
      },
    },
    itemIndicator: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      width: "var(--tree-icon-size)",
      height: "var(--tree-icon-size)",
      color: "fg.subtle",
      _icon: {
        width: "1em",
        height: "1em",
      },
    },
    itemText: {
      display: "inline-flex",
      alignItems: "center",
      flex: "1",
      minWidth: "0",
      truncate: true,
    },
    nodeCheckbox: {
      ...checkboxControlBase,
      bg: "bg",
      borderColor: "border.emphasized",
      borderRadius: "xs",
      transition: "backgrounds, border-color, colors",
      _checked: checkboxControlCheckedState,
      _indeterminate: checkboxControlCheckedState,
    },
    dropIndicator: {
      colorPalette: "blue",
      position: "absolute",
      insetInline: "0",
      height: "2px",
      bg: "colorPalette.solid.bg",
      borderRadius: "full",
      pointerEvents: "none",
      zIndex: "1",
      // leading dot at the indented start of the line
      _before: {
        content: '""',
        position: "absolute",
        insetBlockStart: "50%",
        insetInlineStart: "0",
        boxSize: "1.5",
        transform: "translate(-50%, -50%)",
        borderRadius: "full",
        bg: "colorPalette.solid.bg",
      },
      // make-child: outline the whole row instead of a line
      "&[data-instruction='make-child']": {
        insetBlock: "0",
        height: "auto",
        bg: "transparent",
        borderWidth: "2px",
        borderColor: "colorPalette.solid.bg",
        borderRadius: "sm",
        _before: { display: "none" },
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      sm: {
        tree: {
          "--tree-icon-size": "sizes.3",
          "--tree-indent": "spacing.4",
          ...controlText("xs"),
        },
        branchControl: {
          py: "0.5",
          pe: "1.5",
        },
        item: {
          py: "0.5",
          pe: "1.5",
        },
        nodeCheckbox: {
          boxSize: "3",
          _icon: { boxSize: "2" },
        },
      },
      md: {
        tree: {
          "--tree-icon-size": "sizes.3.5",
          ...controlText("sm"),
        },
        branchControl: {
          py: "1",
          pe: "2",
        },
        item: {
          py: "1",
          pe: "2",
        },
        nodeCheckbox: {
          boxSize: "4",
          _icon: { boxSize: "3" },
        },
      },
    },
  },
});
