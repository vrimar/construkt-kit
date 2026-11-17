import type { ResolvedColorMode } from "./ColorModeProvider";

const RGB = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;

const toHex = (color: string) => {
  const match = RGB.exec(color);
  if (!match || (match[4] !== undefined && Number(match[4]) < 1)) return color;
  const channels = match.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0"));
  return `#${channels.join("")}`;
};

/**
 * Resolves a CSS colour, such as a token's `var(--colors-brand-solid-bg)`, against the page's
 * styles in `colorScheme`, whatever scheme the page is in. Returns `#rrggbb` for an opaque
 * colour, else the computed CSS colour. For output that can't read CSS variables, such as
 * exported images and documents. Browser only.
 */
export function resolveColor(color: string, colorScheme: ResolvedColorMode): string {
  const probe = document.createElement("span");
  probe.className = colorScheme;
  probe.hidden = true;
  probe.style.color = color;
  document.body.append(probe);
  try {
    return toHex(getComputedStyle(probe).color);
  } finally {
    probe.remove();
  }
}
