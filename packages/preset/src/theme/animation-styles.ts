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
      "&[data-placement^=top]": withFade("slide-from-bottom", "fade-in"),
      "&[data-placement^=bottom]": withFade("slide-from-top", "fade-in"),
      "&[data-placement^=left]": withFade("slide-from-right", "fade-in"),
      "&[data-placement^=right]": withFade("slide-from-left", "fade-in"),
    },
  },
  "slide-fade-out": {
    value: {
      transformOrigin: "var(--transform-origin)",
      "&[data-placement^=top]": withFade("slide-to-bottom", "fade-out"),
      "&[data-placement^=bottom]": withFade("slide-to-top", "fade-out"),
      "&[data-placement^=left]": withFade("slide-to-right", "fade-out"),
      "&[data-placement^=right]": withFade("slide-to-left", "fade-out"),
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
