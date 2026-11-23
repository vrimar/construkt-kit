import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { anchoredHitArea, controlText, surface } from "./control-size";
import { floatingPositioner } from "./floating";
import { initialValues } from "./initial-values";

const perToast = { syntax: "<length>", inherits: false, initialValue: "0px" } as const;

export const toastGlobalVars: GlobalVarsDefinition = {
  "--toast-index": { syntax: "<integer>", inherits: false, initialValue: "0" },
  "--toast-offset-y": perToast,
  "--toast-height": perToast,
  "--toast-swipe-movement-x": perToast,
  "--toast-swipe-movement-y": perToast,
  "--toast-frontmost-height": { syntax: "<length>", inherits: true, initialValue: "0px" },
};

export const toast = defineSlotRecipe({
  className: "toast",
  slots: ["group", "root", "indicator", "title", "description", "actionTrigger", "closeTrigger"],
  base: {
    group: {
      ...floatingPositioner,
      "--toast-gap": "{spacing.4}",
      "--toast-frontmost-height": "0px",
      position: "fixed",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      width: "auto",
      height: "auto",
      top: "max(env(safe-area-inset-top, 0px), {sizes.20})",
      insetInlineStart: { mdDown: "4" },
      insetInlineEnd: {
        base: "calc(env(safe-area-inset-right, 0px) + {spacing.10})",
        mdDown: "calc(env(safe-area-inset-right, 0px) + {spacing.4})",
      },
    },
    root: {
      ...initialValues(toastGlobalVars, [
        "--toast-index",
        "--toast-offset-y",
        "--toast-height",
        "--toast-swipe-movement-x",
        "--toast-swipe-movement-y",
      ]),
      "--toast-x": "0px",
      "--toast-rest-y": "0px",
      "--toast-exit-y": "calc(var(--toast-rest-y) - 100%)",
      "--toast-y": "var(--toast-exit-y)",
      alignItems: "start",
      background: "bg",
      borderRadius: "lg",
      boxShadow: "lg",
      display: "flex",
      gap: surface("1rem"),
      // Don't force 384px on mobile — `width: full` + the group's inset size it instead.
      minWidth: { base: "0", md: "sm" },
      opacity: "0",
      overflowWrap: "anywhere",
      p: surface("1rem"),
      pointerEvents: "none",
      position: "absolute",
      top: "0",
      touchAction: "none",
      transitionDuration: "slow",
      transitionProperty: "translate, scale, opacity, height",
      transitionTimingFunction: "default",
      translate:
        "calc(var(--toast-x) + var(--toast-swipe-movement-x)) calc(var(--toast-y) + var(--toast-swipe-movement-y))",
      width: "full",
      zIndex: "calc(var(--toast-index) * -1)",
      _icon: {
        flexShrink: "0",
      },
      // Keeps the pointer over the stack across the gap above a toast and while one leaves.
      _before: {
        content: '""',
        position: "absolute",
        inset: "0",
        scale: "1 2",
        pointerEvents: "none",
      },
      _after: {
        content: '""',
        position: "absolute",
        insetInlineStart: "0",
        bottom: "100%",
        width: "100%",
        height: "calc(var(--toast-gap) + 2px)",
      },
      _open: {
        "--toast-y": "var(--toast-rest-y)",
        opacity: "1",
        pointerEvents: "auto",
        _startingStyle: { "--toast-y": "var(--toast-exit-y)", opacity: "0" },
      },
      _closed: {
        _before: { pointerEvents: "auto" },
        _first: {
          _before: { height: "calc(var(--toast-height) + 80%)" },
        },
      },
      _expanded: {
        "--toast-rest-y": "calc(var(--toast-offset-y) + var(--toast-index) * var(--toast-gap))",
        height: "var(--toast-height)",
      },
      _collapsed: {
        _notFirst: {
          "--toast-rest-y": "calc(var(--toast-index) * var(--toast-gap))",
          "--toast-exit-y": "-40%",
          height: "var(--toast-frontmost-height)",
          scale: "calc(1 - var(--toast-index) * 0.05)",
        },
      },
      _swiping: {
        transitionDuration: "0s",
        willChange: "translate",
      },
      _swipeUp: {
        "--toast-y": "calc(var(--toast-rest-y) - 100%)",
      },
      _swipeRight: {
        "--toast-x": "100%",
        "--toast-y": "var(--toast-rest-y)",
      },
      _swipeLeft: {
        "--toast-x": "-100%",
        "--toast-y": "var(--toast-rest-y)",
      },
    },
    indicator: {},
    title: {
      color: "fg",
      fontWeight: "medium",
      ...controlText("sm"),
    },
    description: {
      color: "fg.muted",
      ...controlText("sm"),
    },
    actionTrigger: {
      color: "colorPalette.plain.fg",
      cursor: "pointer",
      fontWeight: "medium",
      ...controlText("sm"),
    },
    closeTrigger: {
      position: "absolute",
      top: "2",
      insetEnd: "2",
      ...anchoredHitArea,
    },
  },
  defaultVariants: {
    status: "info",
  },
  variants: {
    status: {
      info: { indicator: { color: "info" } },
      success: { indicator: { color: "success" } },
      warning: { indicator: { color: "warning" } },
      error: { indicator: { color: "danger" } },
      loading: {},
    },
  },
});
