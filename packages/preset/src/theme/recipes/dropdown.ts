import {
  type ControlSize,
  controlText,
  dropdownItem,
  dropdownItemGroupSpacing,
} from "./control-size";

export const DROPDOWN_CONTENT_P = "1";

export const dropdownItemBase = {
  alignItems: "center",
  borderRadius: "sm",
  cursor: "pointer",
  display: "flex",
  minWidth: "0",
  outline: "0",
  userSelect: "none",
  _hover: { bg: "bg.hover" },
  _highlighted: { bg: "bg.hover" },
  _selected: { color: "colorPalette.plain.fg" },
  _disabled: { layerStyle: "disabled" },
} as const;

export const tintedRow = {
  bg: "colorPalette.subtle.bg",
  _hover: { bg: "colorPalette.subtle.bg.hover" },
  _highlighted: { bg: "colorPalette.subtle.bg.hover" },
} as const;

export const dropdownItemIndicator = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  color: "colorPalette.plain.fg",
  _unchecked: { visibility: "hidden" },
} as const;

export const dropdownGroupLabelText = {
  color: "fg.subtle",
  fontWeight: "semibold",
  letterSpacing: "wider",
  textTransform: "uppercase",
} as const;

export const optionListSlots = {
  item: { ...dropdownItemBase, justifyContent: "space-between" },
  itemText: {
    flex: "1",
    minWidth: "0",
    truncate: true,
    fontWeight: "medium",
  },
  itemIndicator: dropdownItemIndicator,
  itemGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: "0",
    ...dropdownItemGroupSpacing,
  },
  itemGroupLabel: {
    ...dropdownGroupLabelText,
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    justifyContent: "center",
    _after: {
      content: '""',
      width: "100%",
      height: "1px",
      bg: "border.muted",
    },
  },
} as const;

export const dropdownTier = (size: ControlSize, text: ControlSize = size) => {
  const gap = size === "xl" ? "1" : "0.5";
  return {
    content: { p: DROPDOWN_CONTENT_P, gap, ...controlText(text) },
    item: dropdownItem(size),
    itemGroup: { gap },
  };
};
