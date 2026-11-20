import { defineKeyframes } from "@pandacss/dev";

export const keyframes = defineKeyframes({
  // base
  spin: {
    to: { transform: "rotate(360deg)" },
  },
  ping: {
    "75%, 100%": { transform: "scale(2)", opacity: "0" },
  },
  pulse: {
    "50%": { opacity: ".5" },
  },
  bounce: {
    "0%, 100%": {
      transform: "translateY(-25%)",
      animationTimingFunction: "cubic-bezier(0.8,0,1,1)",
    },
    "50%": {
      transform: "none",
      animationTimingFunction: "cubic-bezier(0,0,0.2,1)",
    },
  },
  // collapse
  "expand-height": {
    from: { height: "0" },
    to: { height: "var(--collapsible-height)" },
  },
  "collapse-height": {
    from: { height: "var(--collapsible-height)" },
    to: { height: "0" },
  },
  // fade
  "fade-in": {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },
  "fade-out": {
    from: { opacity: "1" },
    to: { opacity: "0" },
  },
  "swipe-fade-out": {
    from: { opacity: "calc(1 - var(--drawer-swipe-progress, 0))" },
    to: { opacity: "0" },
  },
  // slide from (full)
  "slide-from-left-full": {
    from: { translate: "-100% 0" },
    to: { translate: "0 0" },
  },
  "slide-from-right-full": {
    from: { translate: "100% 0" },
    to: { translate: "0 0" },
  },
  "slide-from-top-full": {
    from: { translate: "0 -100%" },
    to: { translate: "0 0" },
  },
  "slide-from-bottom-full": {
    from: { translate: "0 100%" },
    to: { translate: "0 0" },
  },
  // slide to (full)
  "slide-to-left-full": {
    from: { translate: "0 0" },
    to: { translate: "-100% 0" },
  },
  "slide-to-right-full": {
    from: { translate: "0 0" },
    to: { translate: "100% 0" },
  },
  "slide-to-top-full": {
    from: { translate: "0 0" },
    to: { translate: "0 -100%" },
  },
  "slide-to-bottom-full": {
    from: { translate: "0 0" },
    to: { translate: "0 100%" },
  },
  // slide from
  "slide-from-top": {
    "0%": { translate: "0 -0.5rem" },
    to: { translate: "0" },
  },
  "slide-from-bottom": {
    "0%": { translate: "0 0.5rem" },
    to: { translate: "0" },
  },
  "slide-from-left": {
    "0%": { translate: "-0.5rem 0" },
    to: { translate: "0" },
  },
  "slide-from-right": {
    "0%": { translate: "0.5rem 0" },
    to: { translate: "0" },
  },
  // slide to
  "slide-to-top": {
    "0%": { translate: "0" },
    to: { translate: "0 -0.5rem" },
  },
  "slide-to-bottom": {
    "0%": { translate: "0" },
    to: { translate: "0 0.5rem" },
  },
  "slide-to-left": {
    "0%": { translate: "0" },
    to: { translate: "-0.5rem 0" },
  },
  "slide-to-right": {
    "0%": { translate: "0" },
    to: { translate: "0.5rem 0" },
  },
  // scale
  "scale-in": {
    from: { scale: "0.95" },
    to: { scale: "1" },
  },
  "scale-out": {
    from: { scale: "1" },
    to: { scale: "0.95" },
  },
  "bg-position": {
    from: {
      backgroundPosition: "var(--animate-from, 1rem) 0",
    },
    to: {
      backgroundPosition: "var(--animate-to, 0) 0",
    },
  },
  position: {
    from: {
      insetInlineStart: "var(--animate-from-x)",
      insetBlockStart: "var(--animate-from-y)",
    },
    to: {
      insetInlineStart: "var(--animate-to-x)",
      insetBlockStart: "var(--animate-to-y)",
    },
  },
  fresh: {
    "0%, 35%": { backgroundColor: "colorPalette.subtle.bg" },
  },
  changed: {
    "0%, 25%": {
      borderColor: "colorPalette.solid.bg",
      backgroundColor: "colorPalette.surface.bg",
      boxShadow: "0 0 0 3px {colors.colorPalette.subtle.bg}",
    },
  },
  flash: {
    from: {
      backgroundColor: "colorPalette.subtle.bg",
      boxShadow: "inset 0 0 0 2px {colors.colorPalette.solid.bg}",
    },
  },
  spot: {
    "0%, 35%": {
      backgroundColor: "colorPalette.subtle.bg",
      boxShadow:
        "calc(-1 * var(--spot-bleed, 0.75rem)) 0 0 {colors.colorPalette.subtle.bg}, var(--spot-bleed, 0.75rem) 0 0 {colors.colorPalette.subtle.bg}",
    },
  },
  ring: {
    "0%, 100%": { rotate: "0deg" },
    "15%": { rotate: "14deg" },
    "30%": { rotate: "-12deg" },
    "45%": { rotate: "8deg" },
    "60%": { rotate: "-5deg" },
    "75%": { rotate: "2deg" },
  },
  blink: {
    "0%, 100%": { opacity: "0.25" },
    "50%": { opacity: "1" },
  },
});
