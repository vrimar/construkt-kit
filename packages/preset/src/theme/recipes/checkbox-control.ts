import { choiceControlBase } from "./choice-control";
import { type ControlSize, controlBox } from "./control-size";

export const checkboxControlBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  borderWidth: "1px",
  cursor: "pointer",
} as const;

export const checkboxControl = {
  ...checkboxControlBase,
  ...choiceControlBase,
  cursor: "inherit",
  borderRadius: "sm",
  _icon: {
    boxSize: "full",
  },
} as const;

export const checkboxControlSize = (size: ControlSize) => ({
  boxSize: controlBox(size),
  _icon: { boxSize: `calc(${controlBox(size)} - 0.375rem)` },
});
