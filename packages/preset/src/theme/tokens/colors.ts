import { defineTokens } from "@pandacss/dev";

const current = { value: "currentColor" };
const transparent = { value: "rgb(0 0 0 / 0)" };

const black = defineTokens.colors({
  DEFAULT: { value: "#000000" },
  a1: { value: "rgba(0, 0, 0, 0.05)" },
  a2: { value: "rgba(0, 0, 0, 0.1)" },
  a3: { value: "rgba(0, 0, 0, 0.15)" },
  a4: { value: "rgba(0, 0, 0, 0.2)" },
  a5: { value: "rgba(0, 0, 0, 0.3)" },
  a6: { value: "rgba(0, 0, 0, 0.4)" },
  a7: { value: "rgba(0, 0, 0, 0.5)" },
  a8: { value: "rgba(0, 0, 0, 0.6)" },
  a9: { value: "rgba(0, 0, 0, 0.7)" },
  a10: { value: "rgba(0, 0, 0, 0.8)" },
  a11: { value: "rgba(0, 0, 0, 0.9)" },
  a12: { value: "rgba(0, 0, 0, 0.95)" },
});

const white = defineTokens.colors({
  DEFAULT: { value: "#ffffff" },
  a1: { value: "rgba(255, 255, 255, 0.05)" },
  a2: { value: "rgba(255, 255, 255, 0.1)" },
  a3: { value: "rgba(255, 255, 255, 0.15)" },
  a4: { value: "rgba(255, 255, 255, 0.2)" },
  a5: { value: "rgba(255, 255, 255, 0.3)" },
  a6: { value: "rgba(255, 255, 255, 0.4)" },
  a7: { value: "rgba(255, 255, 255, 0.5)" },
  a8: { value: "rgba(255, 255, 255, 0.6)" },
  a9: { value: "rgba(255, 255, 255, 0.7)" },
  a10: { value: "rgba(255, 255, 255, 0.8)" },
  a11: { value: "rgba(255, 255, 255, 0.9)" },
  a12: { value: "rgba(255, 255, 255, 0.95)" },
});

const brand = defineTokens.colors({
  50: { value: "#f0f6ff" },
  100: { value: "#dbe8ff" },
  200: { value: "#bdd4ff" },
  300: { value: "#7faaff" },
  400: { value: "#5b92ff" },
  500: { value: "#3778ff" },
  600: { value: "#2f67db" },
  700: { value: "#2757b8" },
  800: { value: "#1f4794" },
  900: { value: "#1c3a7a" },
  950: { value: "#122550" },
});

const gray = defineTokens.colors({
  50: { value: "#f9fafb" },
  100: { value: "#f3f4f6" },
  200: { value: "#e5e7eb" },
  300: { value: "#d1d5db" },
  400: { value: "#9ca3af" },
  500: { value: "#6b7280" },
  600: { value: "#4b5563" },
  700: { value: "#374151" },
  800: { value: "#1f2937" },
  900: { value: "#111827" },
  950: { value: "#030712" },
});

const slate = defineTokens.colors({
  50: { value: "#f8fafc" },
  100: { value: "#f1f5f9" },
  200: { value: "#e2e8f0" },
  300: { value: "#cbd5e1" },
  400: { value: "#94a3b8" },
  500: { value: "#64748b" },
  600: { value: "#475569" },
  700: { value: "#334155" },
  800: { value: "#1e293b" },
  900: { value: "#0f172a" },
  950: { value: "#020617" },
});

const blue = defineTokens.colors({
  50: { value: "#eff6ff" },
  100: { value: "#dbeafe" },
  200: { value: "#bfdbfe" },
  300: { value: "#93c5fd" },
  400: { value: "#60a5fa" },
  500: { value: "#3b82f6" },
  600: { value: "#2563eb" },
  700: { value: "#1d4ed8" },
  800: { value: "#1e40af" },
  900: { value: "#1e3a8a" },
  950: { value: "#172554" },
});

const red = defineTokens.colors({
  50: { value: "#fef2f2" },
  100: { value: "#fee2e2" },
  200: { value: "#fecaca" },
  300: { value: "#fca5a5" },
  400: { value: "#f87171" },
  500: { value: "#ef4444" },
  600: { value: "#dc2626" },
  700: { value: "#b91c1c" },
  800: { value: "#991b1b" },
  900: { value: "#7f1d1d" },
  950: { value: "#450a0a" },
});

const green = defineTokens.colors({
  50: { value: "#f0fdf4" },
  100: { value: "#dcfce7" },
  200: { value: "#bbf7d0" },
  300: { value: "#86efac" },
  400: { value: "#4ade80" },
  500: { value: "#22c55e" },
  600: { value: "#16a34a" },
  700: { value: "#15803d" },
  800: { value: "#166534" },
  900: { value: "#14532d" },
  950: { value: "#052e16" },
});

const orange = defineTokens.colors({
  50: { value: "#fff7ed" },
  100: { value: "#ffedd5" },
  200: { value: "#fed7aa" },
  300: { value: "#fdba74" },
  400: { value: "#fb923c" },
  500: { value: "#f97316" },
  600: { value: "#ea580c" },
  700: { value: "#c2410c" },
  800: { value: "#9a3412" },
  900: { value: "#7c2d12" },
  950: { value: "#431407" },
});

const yellow = defineTokens.colors({
  50: { value: "#fefce8" },
  100: { value: "#fef9c3" },
  200: { value: "#fef08a" },
  300: { value: "#fde047" },
  400: { value: "#facc15" },
  500: { value: "#eab308" },
  600: { value: "#ca8a04" },
  700: { value: "#a16207" },
  800: { value: "#854d0e" },
  900: { value: "#713f12" },
  950: { value: "#422006" },
});

const purple = defineTokens.colors({
  50: { value: "#faf5ff" },
  100: { value: "#f3e8ff" },
  200: { value: "#e9d5ff" },
  300: { value: "#d8b4fe" },
  400: { value: "#c084fc" },
  500: { value: "#a855f7" },
  600: { value: "#9333ea" },
  700: { value: "#7e22ce" },
  800: { value: "#6b21a8" },
  900: { value: "#581c87" },
  950: { value: "#3b0764" },
});

const teal = defineTokens.colors({
  50: { value: "#f0fdfa" },
  100: { value: "#ccfbf1" },
  200: { value: "#99f6e4" },
  300: { value: "#5eead4" },
  400: { value: "#2dd4bf" },
  500: { value: "#14b8a6" },
  600: { value: "#0d9488" },
  700: { value: "#0f766e" },
  800: { value: "#115e59" },
  900: { value: "#134e4a" },
  950: { value: "#042f2e" },
});

const cyan = defineTokens.colors({
  50: { value: "#ecfeff" },
  100: { value: "#cffafe" },
  200: { value: "#a5f3fc" },
  300: { value: "#67e8f9" },
  400: { value: "#22d3ee" },
  500: { value: "#06b6d4" },
  600: { value: "#0891b2" },
  700: { value: "#0e7490" },
  800: { value: "#155e75" },
  900: { value: "#164e63" },
  950: { value: "#083344" },
});

const pink = defineTokens.colors({
  50: { value: "#fdf2f8" },
  100: { value: "#fce7f3" },
  200: { value: "#fbcfe8" },
  300: { value: "#f9a8d4" },
  400: { value: "#f472b6" },
  500: { value: "#ec4899" },
  600: { value: "#db2777" },
  700: { value: "#be185d" },
  800: { value: "#9d174d" },
  900: { value: "#831843" },
  950: { value: "#500724" },
});

export const colors = {
  current,
  transparent,
  black,
  white,
  brand,
  gray,
  slate,
  blue,
  red,
  green,
  orange,
  yellow,
  purple,
  teal,
  cyan,
  pink,
};
