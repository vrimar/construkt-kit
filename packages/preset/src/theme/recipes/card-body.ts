import { type ControlSize, controlGap, controlPx, controlText } from "./control-size";

export const cardBody = {
  display: "flex",
  alignItems: "center",
  flex: "1",
  "&[data-indicator-placement=end]": {
    justifyContent: "flex-end",
  },
};

export const cardContent = {
  display: "flex",
  flexDirection: "column",
  gap: "1",
  flex: "1",
};

export const cardDescription = {
  color: "fg.muted",
};

export const cardAddon = {
  borderTopWidth: "1px",
  borderColor: "border",
};

export type CardSize = "sm" | "md" | "lg";

const CARD_TIERS: Record<CardSize, { inset: ControlSize; text: ControlSize; addonPy: string }> = {
  sm: { inset: "md", text: "xs", addonPy: controlGap("md") },
  md: { inset: "xl", text: "sm", addonPy: controlGap("2xl") },
  lg: { inset: "2xl", text: "lg", addonPy: "4" },
};

export const cardTier = (size: CardSize) => {
  const { inset, text, addonPy } = CARD_TIERS[size];
  return {
    body: { p: controlPx(inset) },
    text: controlText(text),
    addon: { px: controlPx(inset), py: addonPy },
  };
};
