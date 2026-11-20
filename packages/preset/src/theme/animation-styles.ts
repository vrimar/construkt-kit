import { defineAnimationStyles } from "@pandacss/dev";

import { withFade } from "./recipes/overlay-motion";

const stillWhenReduced = { _motionReduce: { animationName: "none" } } as const;

const highlight = (name: string, duration: string) => ({
  value: {
    animationName: name,
    animationDuration: duration,
    animationTimingFunction: "ease-out",
    ...stillWhenReduced,
  },
});

export const animationStyles = defineAnimationStyles({
  "slide-fade-in": {
    value: {
      transformOrigin: "var(--transform-origin)",
      _sideTop: withFade("slide-from-bottom", "fade-in"),
      _sideBottom: withFade("slide-from-top", "fade-in"),
      _sideLeft: withFade("slide-from-right", "fade-in"),
      _sideRight: withFade("slide-from-left", "fade-in"),
    },
  },
  "slide-fade-out": {
    value: {
      transformOrigin: "var(--transform-origin)",
      _sideTop: withFade("slide-to-bottom", "fade-out"),
      _sideBottom: withFade("slide-to-top", "fade-out"),
      _sideLeft: withFade("slide-to-right", "fade-out"),
      _sideRight: withFade("slide-to-left", "fade-out"),
    },
  },
  "scale-fade-in": {
    value: {
      transformOrigin: "var(--transform-origin)",
      ...withFade("scale-in", "fade-in"),
    },
  },
  "scale-fade-out": {
    value: {
      transformOrigin: "var(--transform-origin)",
      ...withFade("scale-out", "fade-out"),
    },
  },
  fresh: highlight("fresh", "0.9s"),
  changed: highlight("changed", "0.9s"),
  flash: highlight("flash", "1.2s"),
  spot: highlight("spot", "1.8s"),
  ring: {
    value: {
      animationName: "ring",
      animationDuration: "0.9s",
      animationTimingFunction: "ease",
      transformOrigin: "top",
      ...stillWhenReduced,
    },
  },
  blink: {
    value: {
      animationName: "blink",
      animationDuration: "1s",
      animationIterationCount: "infinite",
      ...stillWhenReduced,
    },
  },
});
