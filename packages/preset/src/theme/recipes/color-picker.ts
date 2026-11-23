import { defineSlotRecipe } from "@pandacss/dev";
import type { GlobalVarsDefinition } from "@pandacss/types";

import { controlH } from "./control-size";
import { fieldLabel } from "./field";
import { pickerParts } from "./floating";
import { input } from "./input";

const perElement = { syntax: "*", inherits: false } as const;

/** The colors and gradients a color picker writes on its parts for the recipe to paint. */
export const colorPickerGlobalVars: GlobalVarsDefinition = {
  "--color-picker-value": { syntax: "*", inherits: true },
  "--color-picker-color": perElement,
  "--color-picker-area-bg": perElement,
  "--color-picker-area-gradient": perElement,
  "--color-picker-area-mask": perElement,
  "--color-picker-track-bg": perElement,
  "--color-picker-grid-size": perElement,
};

const thumb = {
  position: "absolute",
  borderRadius: "full",
  height: { base: "2.5", _pointerCoarse: "5" },
  width: { base: "2.5", _pointerCoarse: "5" },
  boxShadow: "{colors.white} 0px 0px 0px 2px, {colors.black} 0px 0px 2px 1px",
  transform: "translate(-50%, -50%)",
  forcedColorAdjust: "none",
  background: "var(--color-picker-color)",
  outline: "none",
  focusVisibleRing: "outside",
} as const;

export const colorPicker = defineSlotRecipe({
  className: "color-picker",
  slots: [
    "root",
    "label",
    "control",
    "trigger",
    "positioner",
    "content",
    "area",
    "areaThumb",
    "valueText",
    "areaBackground",
    "channelSlider",
    "channelSliderLabel",
    "channelSliderTrack",
    "channelSliderThumb",
    "channelSliderValueText",
    "channelInput",
    "transparencyGrid",
    "swatchGroup",
    "swatchTrigger",
    "swatchIndicator",
    "swatch",
    "eyeDropperTrigger",
    "formatTrigger",
    "formatSelect",
    "view",
    "valueSwatch",
  ],
  base: {
    root: pickerParts.root,
    label: fieldLabel,
    control: pickerParts.control,
    trigger: {
      position: "relative",
      display: "grid",
      placeItems: "center",
      width: controlH("md"),
      height: controlH("md"),
      minWidth: controlH("md"),
      p: "0",
      bg: "bg",
      borderWidth: "1px",
      borderColor: "border.control",
      borderRadius: "md",
      cursor: "pointer",
      overflow: "hidden",
      flexShrink: "0",
      outline: "none",
      focusVisibleRing: "inside",
      _disabled: {
        layerStyle: "disabled",
      },
    },
    positioner: pickerParts.positioner,
    content: {
      ...pickerParts.content,
      maxWidth: "sm",
      outline: "0",
      _dragging: {
        userSelect: "none",
      },
    },
    area: {
      position: "relative",
      height: "36",
      borderRadius: "md",
      overflow: "hidden",
      touchAction: "none",
      forcedColorAdjust: "none",
      background: "var(--color-picker-area-bg, none)",
    },
    areaThumb: {
      ...thumb,
      touchAction: "none",
    },
    areaBackground: {
      position: "relative",
      height: "full",
      touchAction: "none",
      forcedColorAdjust: "none",
      background: "var(--color-picker-area-gradient)",
      maskImage: "var(--color-picker-area-mask, none)",
    },
    channelInput: {
      ...input.base,
      ...input.variants.variant.outline,
      ...input.variants.size.md,
      MozAppearance: "textfield",
      minW: "0",
    },
    channelSlider: {
      position: "relative",
      borderRadius: "md",
      touchAction: "none",
      _vertical: {
        width: "fit-content",
      },
    },
    channelSliderLabel: {
      userSelect: "none",
    },
    channelSliderTrack: {
      position: "relative",
      height: "3",
      borderRadius: "md",
      forcedColorAdjust: "none",
      backgroundImage: "var(--color-picker-track-bg)",
      _vertical: {
        width: "3",
        height: "36",
      },
    },
    swatchGroup: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "2",
      background: "colorPalette.surface.bg",
    },
    swatchTrigger: {
      position: "relative",
    },
    swatch: {
      position: "relative",
      height: "6",
      width: "6",
      borderRadius: "md",
      background: "var(--color-picker-color)",
      boxShadow: "0 0 0 1px {colors.border.emphasized}, 0 0 0 2px {colors.bg} inset",
    },
    channelSliderThumb: thumb,
    transparencyGrid: {
      position: "absolute",
      inset: "0",
      zIndex: "auto",
      gridArea: "1 / 1",
      width: "full",
      height: "full",
      borderRadius: "inherit",
      pointerEvents: "none",
      backgroundColor: "white",
      backgroundImage:
        "conic-gradient({colors.black.a1} 0 25%, transparent 0 50%, {colors.black.a1} 0 75%, transparent 0)",
      backgroundSize: "var(--color-picker-grid-size, 12px) var(--color-picker-grid-size, 12px)",
    },
    valueSwatch: {
      position: "relative",
      gridArea: "1 / 1",
      display: "block",
      width: "full",
      height: "full",
      borderRadius: "inherit",
      zIndex: "1",
      background: "var(--color-picker-color)",
    },
  },
});
