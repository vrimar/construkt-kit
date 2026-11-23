import type { RecipeConfig } from "@pandacss/types";

import { type ControlSize, controlH, controlInputText, controlPx } from "./control-size";

export const invalidRing = {
  focusRingColor: "border.error",
  borderColor: "border.error",
} as const;

const insetRingStyle = {
  borderColor: "var(--focus-ring-color)",
  boxShadow: "inset 0 0 0 1px var(--focus-ring-color)",
} as const;

export const insetRing = {
  // "none" still defines --focus-ring-color, which focusRingColor feeds.
  focusVisibleRing: "none",
  _focusVisible: insetRingStyle,
} as const;

export const insetRingWithin = {
  focusVisibleRing: "none",
  _focusWithin: insetRingStyle,
} as const;

const tier = (size: ControlSize) => ({
  ...controlInputText(size),
  "--input-px": controlPx(size),
  "--input-height": controlH(size),
});

export const input = {
  className: "input",
  base: {
    appearance: "none",
    borderRadius: "md",
    height: "var(--input-height)",
    minHeight: "var(--input-height)",
    px: "var(--input-flushed-px, var(--input-px))",
    "--input-flushed-px": "initial",
    minW: "var(--input-height)",
    outline: "0",
    position: "relative",
    textAlign: "start",
    transition: "common",
    width: "100%",
    _disabled: {
      layerStyle: "disabled",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
  variants: {
    variant: {
      outline: {
        borderWidth: "1px",
        borderColor: "border.control",
        ...insetRing,
        _invalid: invalidRing,
      },
      surface: {
        bg: "neutral.surface.bg",
        borderWidth: "1px",
        borderColor: "border.control",
        ...insetRing,
        _invalid: invalidRing,
      },
      subtle: {
        borderWidth: "1px",
        borderColor: "transparent",
        bg: "neutral.subtle.bg",
        color: "neutral.subtle.fg",
        ...insetRing,
        _invalid: invalidRing,
      },
      flushed: {
        borderBottomWidth: "1px",
        borderBottomColor: "border.control",
        borderRadius: "0",
        color: "fg",
        "--input-flushed-px": "0",
        _invalid: {
          borderColor: "border.error",
        },
        _focusVisible: {
          borderColor: "colorPalette.solid.bg",
          boxShadowColor: "colorPalette.solid.bg",
          boxShadow: "0 1px 0 0 var(--shadow-color)",
          _invalid: {
            borderColor: "border.error",
            boxShadowColor: "border.error",
          },
        },
      },
      colored: {
        borderWidth: "1px",
        borderColor: "colorPalette.outline.border",
        ...insetRing,
        focusRingColor: "colorPalette.solid.bg",
        _invalid: invalidRing,
      },
      plain: {
        focusVisibleRing: "none",
        _invalid: {
          focusRingColor: "border.error",
        },
      },
    },
    size: {
      "2xs": tier("2xs"),
      xs: tier("xs"),
      sm: tier("sm"),
      md: tier("md"),
      lg: tier("lg"),
      xl: tier("xl"),
      "2xl": tier("2xl"),
    },
  },
} satisfies RecipeConfig;

type InputStyles = typeof input.variants;

const each = <K extends string, V>(keys: readonly K[], value: (key: K) => V) =>
  Object.fromEntries(keys.map((key) => [key, value(key)])) as Record<K, V>;

export const inputSlotVariants = <S extends string, N extends keyof InputStyles["variant"]>(
  slot: S,
  names: readonly N[],
) =>
  each(
    names,
    (name) => ({ [slot]: input.variants.variant[name] }) as Record<S, InputStyles["variant"][N]>,
  );

export const inputSlotSizes = <S extends string, N extends keyof InputStyles["size"]>(
  slot: S,
  names: readonly N[],
) =>
  each(
    names,
    (name) => ({ [slot]: input.variants.size[name] }) as Record<S, InputStyles["size"][N]>,
  );
