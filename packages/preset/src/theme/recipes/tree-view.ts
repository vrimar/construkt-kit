import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { onSurface } from "../layer-styles";
import { checkboxControlBase } from "./checkbox-control";
import { solidCheckedFill } from "./choice-control";
import { controlText } from "./control-size";
import { dropIndicator, dropLine, dropOnto } from "./drop-indicator";

/** Variables the tree sets on its rows and drop line, and the sticky offset an app may set. */
export const treeViewGlobalVars: GlobalVarsDefinition = {
  "--tree-depth": { syntax: "*", inherits: true },
  "--tree-drop-level": { syntax: "*", inherits: false },
  "--tree-sticky-offset": { syntax: "*", inherits: true },
};

const clampedRow = {
  alignItems: "flex-start",
  "& > :where(svg)": { marginBlock: "calc((1lh - var(--tree-icon-size)) / 2)" },
};

const clampedText = {
  lineClamp: "2",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
};

const row = {
  display: "flex",
  alignItems: "center",
  gap: "1",
  width: "full",
  minWidth: "0",
  position: "relative",
  rounded: "sm",
  cursor: "pointer",
  userSelect: "none",
  ps: "calc(var(--tree-padding-inline) + ((var(--tree-depth) - 1) * var(--tree-indent)))",
  bg: "var(--tree-row-bg)",
  _hover: {
    "--tree-row-bg": "colors.bg.hover",
  },
  _selected: {
    "--tree-row-bg": "colors.bg.emphasized",
  },
  // Rows have no border, so a ring at offset 0 falls outside them and a scrolling list clips it.
  focusVisibleRing: "inside",
  _focusVisible: { outlineOffset: "-1px" },
  _disabled: {
    layerStyle: "disabled",
  },
  _dragging: {
    opacity: "0.4",
  },
} as const;

const rowPadding = (py: string, pe: string) => ({
  branchControl: { py, pe },
  item: { py, pe },
});

const rowBg = onSurface("--tree-row-bg");

export const treeView = defineSlotRecipe({
  className: "tree-view",
  slots: [
    "branch",
    "branchContent",
    "branchControl",
    "branchIndentGuide",
    "branchIndicator",
    "branchText",
    "branchTrigger",
    "item",
    "itemIndicator",
    "itemText",
    "label",
    "nodeCheckbox",
    "nodeRenameInput",
    "root",
    "tree",
    "dropIndicator",
    "nodeActions",
    "nodeContent",
    "branchCount",
  ],
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
      ...row,
      _loading: {
        cursor: "progress",
        _disabled: {
          cursor: "not-allowed",
        },
      },
      _pinned: {
        "--tree-row-bg": onSurface(),
        borderBottomWidth: "1px",
        borderColor: "border",
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
      _expanded: {
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
        "calc(var(--tree-padding-inline) + ((var(--tree-depth) - 1) * var(--tree-indent)) + (var(--tree-icon-size) * 0.5))",
      width: "1px",
      bg: "border.muted",
      pointerEvents: "none",
    },
    item: row,
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
      borderColor: "border.control",
      borderRadius: "xs",
      transition: "backgrounds, border-color, colors",
      _checked: solidCheckedFill,
      _indeterminate: solidCheckedFill,
    },
    dropIndicator: {
      ...dropIndicator,
      ...dropLine,
      insetInlineStart:
        "calc(var(--tree-padding-inline) + (var(--tree-drop-level, 0) * var(--tree-indent)))",
      insetInlineEnd: "0",
      height: "2px",
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
        ...dropOnto,
        insetInlineStart: "0",
        insetBlock: "0",
        height: "auto",
        bg: "transparent",
        borderRadius: "sm",
        _before: { display: "none" },
      },
    },
    nodeActions: {
      flexShrink: "0",
    },
    nodeContent: {
      display: "flex",
      alignItems: "center",
      flex: "1",
      minWidth: "0",
      "& > *": { minWidth: "0" },
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
          bg: rowBg,
          transitionProperty: "opacity",
          transitionDuration: "fast",
          transitionTimingFunction: "default",
          _before: {
            content: '""',
            position: "absolute",
            insetBlock: "0",
            insetInlineEnd: "100%",
            width: "4",
            backgroundImage: `linear-gradient(to right, transparent, ${rowBg})`,
            pointerEvents: "none",
          },
          _rtl: {
            _before: {
              backgroundImage: `linear-gradient(to left, transparent, ${rowBg})`,
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
          zIndex: "calc(var(--tree-depth) + 1)",
          bg: rowBg,
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
        ...rowPadding("0.5", "1.5"),
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
        ...rowPadding("1", "2"),
        nodeCheckbox: {
          "--tree-checkbox-size": "sizes.4",
          boxSize: "var(--tree-checkbox-size)",
          _icon: { boxSize: "3" },
        },
      },
    },
  },
});
