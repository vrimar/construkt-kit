import { defineRecipe } from "@pandacss/dev";

export const skeleton = defineRecipe({
  className: "skeleton",
  jsx: ["Skeleton", "SkeletonCircle", "SkeletonText"],
  base: {
    // Overlapping variants resolve here: Panda 2 emits variant rules in usage-dependent order.
    borderRadius: "var(--skeleton-circle-radius, var(--skeleton-radius))",
    bgColor: "var(--skeleton-loaded-bg, var(--skeleton-bg))",
    backgroundImage: "var(--skeleton-loaded-bg-image, var(--skeleton-bg-image))",
    "--skeleton-radius": "initial",
    "--skeleton-circle-radius": "initial",
    "--skeleton-bg": "initial",
    "--skeleton-bg-image": "initial",
    "--skeleton-loaded-bg": "initial",
    "--skeleton-loaded-bg-image": "initial",
  },

  defaultVariants: {
    animation: "pulse",
    loading: true,
  },

  variants: {
    loading: {
      true: {
        "--skeleton-radius": "{radii.md}",
        boxShadow: "none",
        backgroundClip: "padding-box",
        cursor: "default",
        color: "transparent",
        pointerEvents: "none",
        userSelect: "none",
        flexShrink: "0",
        "&::before, &::after, *": {
          visibility: "hidden",
        },
      },
      false: {
        "--skeleton-loaded-bg": "transparent",
        "--skeleton-loaded-bg-image": "none",
        animation: "fade-in var(--fade-duration, 0.1s) ease-out !important",
      },
    },

    circle: {
      true: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        "--skeleton-circle-radius": "{radii.full}",
      },
    },

    animation: {
      pulse: {
        "--skeleton-bg": "{colors.neutral.subtle.bg.active}",
        animation: "pulse",
        animationDuration: "var(--duration, 1.2s)",
      },
      shine: {
        "--animate-from": "200%",
        "--animate-to": "-200%",
        "--start-color": "colors.neutral.subtle.bg",
        "--end-color": "colors.neutral.subtle.bg.active",
        "--skeleton-bg-image":
          "linear-gradient(270deg,var(--start-color),var(--end-color),var(--end-color),var(--start-color))",
        backgroundSize: "400% 100%",
        animation: "bg-position var(--duration, 5s) ease-in-out infinite",
      },
      none: {
        animation: "none",
      },
    },
  },
});
