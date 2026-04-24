import { colorPickerAnatomy } from "@ark-ui/react/anatomy";
import { defineSlotRecipe } from "@pandacss/dev";

export const colorPicker = defineSlotRecipe({
  className: "color-picker",
  slots: colorPickerAnatomy.extendWith("valueSwatch").keys(),
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5",
    },
    label: {
      color: "fg",
      fontWeight: "medium",
      textStyle: "sm",
    },
    control: {
      display: "flex",
      flexDirection: "row",
      gap: "2",
    },
    trigger: {
      display: "grid",
      placeItems: "center",
      width: "10",
      height: "10",
      minWidth: "10",
      p: "0",
      bg: "bg",
      borderWidth: "1px",
      borderColor: "neutral.outline.border",
      borderRadius: "md",
      cursor: "pointer",
      overflow: "hidden",
      flexShrink: "0",
      outline: "none",
      _focusVisible: {
        focusVisibleRing: "inside",
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
    content: {
      layerStyle: "floating.surface",
      display: "flex",
      flexDirection: "column",
      gap: "3",
      maxWidth: "sm",
      p: "4",
      zIndex: "popover",
      _open: {
        animation: "fadeIn 0.25s ease-out",
      },
      _closed: {
        animation: "fadeOut 0.2s ease-out",
      },
      _hidden: {
        display: "none",
      },
    },
    area: {
      height: "36",
      borderRadius: "md",
      overflow: "hidden",
    },
    areaThumb: {
      borderRadius: "full",
      height: "2.5",
      width: "2.5",
      boxShadow: "white 0px 0px 0px 2px, black 0px 0px 2px 1px",
      outline: "none",
    },
    areaBackground: {
      height: "full",
    },
    channelInput: {
      appearance: "none",
      width: "full",
      minWidth: "0",
      height: "10",
      px: "3",
      borderWidth: "1px",
      borderColor: "neutral.outline.border",
      borderRadius: "md",
      bg: "bg",
      color: "fg",
      outline: "0",
      _focusVisible: {
        focusVisibleRing: "inside",
      },
      _disabled: {
        layerStyle: "disabled",
      },
    },
    channelSlider: {
      position: "relative",
      borderRadius: "md",
    },
    channelSliderTrack: {
      height: "3",
      borderRadius: "md",
    },
    swatchGroup: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "2",
      background: "colorPalette.surface.bg",
    },
    swatch: {
      height: "6",
      width: "6",
      borderRadius: "md",
      boxShadow:
        "0 0 0 1px var(--colors-border-emphasized), 0 0 0 2px var(--colors-bg-default) inset",
    },
    channelSliderThumb: {
      borderRadius: "full",
      height: "2.5",
      width: "2.5",
      boxShadow: "white 0px 0px 0px 2px, black 0px 0px 2px 1px",
      transform: "translate(-50%, -50%)",
      outline: "none",
    },
    transparencyGrid: {
      gridArea: "1 / 1",
      width: "full",
      height: "full",
      borderRadius: "inherit",
    },
    valueSwatch: {
      gridArea: "1 / 1",
      display: "block",
      width: "full",
      height: "full",
      borderRadius: "inherit",
      zIndex: "1",
    },
  },
});
