import { treeViewAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

import { checkboxControlBase, checkboxControlCheckedState } from "./checkbox-control";
import { controlText } from "./control-size";

const clampedRow = {
  alignItems: "flex-start",
  "& > :where(svg)": { marginBlock: "calc((1lh - var(--tree-icon-size)) / 2)" },
};

const clampedText = {
  lineClamp: "2",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
};

export const treeView = defineSlotRecipe({
  className: "tree-view",
  slots: [...treeViewAnatomy.keys(), "dropIndicator", "nodeActions", "branchCount"],
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
      bg: "var(--tree-row-bg)",
      transition: "colors",
      _hover: {
        "--tree-row-bg": "colors.bg.subtle",
      },
      _selected: {
        "--tree-row-bg": "colors.bg.emphasized",
      },
      focusVisibleRing: "inside",
      focusRingColor: "border.emphasized",
      _disabled: {
        layerStyle: "disabled",
      },
      "&[data-dragging]": {
        opacity: "0.4",
      },
      _loading: {
        cursor: "progress",
        _disabled: {
          cursor: "not-allowed",
        },
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
      "[data-loading] > &": {
        _icon: {
          display: "none",
        },
        _after: {
          content: '""',
          boxSize: "0.75em",
          borderWidth: "1.5px",
          borderStyle: "solid",
          borderColor: "currentColor",
          borderBottomColor: "transparent",
          borderInlineStartColor: "transparent",
          borderRadius: "full",
          animation: "spin",
        },
      },
    },
    branchText: {
      display: "block",
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
      pointerEvents: "none",
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
      bg: "var(--tree-row-bg)",
      transition: "colors",
      _hover: {
        "--tree-row-bg": "colors.bg.subtle",
      },
      _selected: {
        "--tree-row-bg": "colors.bg.emphasized",
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
      display: "block",
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
      insetInlineStart:
        "calc(var(--tree-padding-inline) + (var(--drop-level, 0) * var(--tree-indent)))",
      insetInlineEnd: "0",
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
      "&[data-instruction='reorder-above']": {
        insetBlockStart: "0",
        transform: "translateY(-50%)",
      },
      "&[data-instruction='reorder-below']": {
        insetBlockEnd: "0",
        transform: "translateY(50%)",
      },
      "&[data-instruction='reparent']": {
        insetBlockEnd: "0",
        transform: "translateY(50%)",
      },
      // make-child: outline the whole row instead of a line
      "&[data-instruction='make-child']": {
        insetInlineStart: "0",
        insetBlock: "0",
        height: "auto",
        bg: "transparent",
        borderWidth: "2px",
        borderColor: "colorPalette.solid.bg",
        borderRadius: "sm",
        _before: { display: "none" },
      },
    },
    nodeActions: {
      flexShrink: "0",
    },
    nodeRenameInput: {
      flex: "1",
      minWidth: "0",
      font: "inherit",
      color: "fg",
      bg: "bg",
      px: "1",
      borderWidth: "1px",
      borderColor: "border.emphasized",
      borderRadius: "sm",
      outline: "none",
      _focusVisible: { borderColor: "colorPalette.solid.bg" },
    },
    branchCount: {
      flexShrink: "0",
      marginInlineStart: "auto",
      color: "fg.muted",
      fontVariantNumeric: "tabular-nums",
    },
  },
  defaultVariants: {
    size: "md",
    actionsVisibility: "always",
  },
  variants: {
    actionsVisibility: {
      always: {},
      hover: {
        nodeActions: {
          position: "absolute",
          insetBlock: "0",
          insetInlineEnd: "0",
          display: "flex",
          alignItems: "center",
          paddingInlineEnd: "inherit",
          borderRadius: "inherit",
          bg: "var(--tree-row-bg, var(--surface-bg, {colors.bg}))",
          transitionProperty: "opacity",
          transitionDuration: "fast",
          transitionTimingFunction: "default",
          _before: {
            content: '""',
            position: "absolute",
            insetBlock: "0",
            insetInlineEnd: "100%",
            width: "4",
            backgroundImage:
              "linear-gradient(to right, transparent, var(--tree-row-bg, var(--surface-bg, {colors.bg})))",
            pointerEvents: "none",
          },
          _rtl: {
            _before: {
              backgroundImage:
                "linear-gradient(to left, transparent, var(--tree-row-bg, var(--surface-bg, {colors.bg})))",
            },
          },
          _unrevealed: {
            opacity: "0",
          },
        },
      },
    },
    stickyBranches: {
      true: {
        branchControl: {
          position: "sticky",
          top: "var(--tree-sticky-offset, 0)",
          zIndex: "calc(var(--depth) + 1)",
          bg: "var(--tree-row-bg, var(--surface-bg, {colors.bg}))",
        },
      },
    },
    clampText: {
      true: {
        branchControl: clampedRow,
        item: clampedRow,
        branchIndicator: { height: "1lh" },
        itemIndicator: { height: "1lh" },
        nodeCheckbox: { marginBlock: "calc((1lh - var(--tree-checkbox-size)) / 2)" },
        branchText: clampedText,
        itemText: clampedText,
      },
    },
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
          "--tree-checkbox-size": "sizes.3",
          boxSize: "var(--tree-checkbox-size)",
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
          "--tree-checkbox-size": "sizes.4",
          boxSize: "var(--tree-checkbox-size)",
          _icon: { boxSize: "3" },
        },
      },
    },
  },
});
