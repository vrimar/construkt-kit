import type { PaletteKey } from "./generate";

export const NEUTRAL: PaletteKey = { key: "#475569" };

export const PALETTES = {
  brand: { key: "#3778ff" },
  red: { key: "#ef4444", hueShift: { tint: -8, shade: 2 } },
  orange: { key: "#f97316", hueShift: { tint: 27, shade: -12 } },
  yellow: { key: "#eab308", hueShift: { tint: 17, shade: -32 } },
  green: { key: "#22c55e", hueShift: { tint: 6, shade: 3 }, tints: 0.7 },
  teal: { key: "#14b8a6", hueShift: { tint: -2, shade: 8 }, tints: 0.7 },
  cyan: { key: "#06b6d4", hueShift: { tint: -14, shade: 12 } },
  blue: { key: "#3b82f6", hueShift: { tint: -5, shade: 6 } },
  purple: { key: "#a855f7", hueShift: { tint: 3, shade: 1 } },
  pink: { key: "#ec4899", hueShift: { tint: -11, shade: 10 } },
} satisfies Record<string, PaletteKey>;

export type PaletteName = keyof typeof PALETTES;

export const STATUS = {
  danger: "red",
  warning: "orange",
  success: "green",
  info: "blue",
} as const satisfies Record<string, PaletteName>;
