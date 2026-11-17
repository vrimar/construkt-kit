export type Rgb = [number, number, number];
export type Oklch = [l: number, c: number, h: number];

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
}

function rgbToHex(rgb: Rgb): string {
  return `#${rgb
    .map((v) =>
      Math.round(Math.min(1, Math.max(0, v)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function linearToOklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinear([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function oklchToLinear([L, C, h]: Oklch): Rgb {
  const r = (h * Math.PI) / 180;
  return oklabToLinear([L, C * Math.cos(r), C * Math.sin(r)]);
}

export function hexToOklch(hex: string): Oklch {
  const [L, a, b] = linearToOklab(hexToRgb(hex).map(toLinear) as Rgb);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return [L, Math.hypot(a, b), h < 0 ? h + 360 : h];
}

const EPS = 1e-7;
const inGamut = (lin: Rgb) => lin.every((v) => v >= -EPS && v <= 1 + EPS);

export function maxChroma(L: number, h: number, C = 0.4): number {
  if (inGamut(oklchToLinear([L, C, h]))) return C;
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinear([L, mid, h]))) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function oklchToHex([L, C, h]: Oklch): string {
  const lin = oklchToLinear([L, maxChroma(L, h, C), h]);
  return rgbToHex(lin.map((v) => fromLinear(Math.min(1, Math.max(0, v)))) as Rgb);
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const alphaOf = (hex: string) => (hex.length === 9 ? Number.parseInt(hex.slice(7), 16) / 255 : 1);

export function composite(overlay: string, under: string): string {
  const alpha = alphaOf(overlay);
  const below = hexToRgb(under);
  return rgbToHex(hexToRgb(overlay).map((v, i) => v * alpha + below[i] * (1 - alpha)) as Rgb);
}

export function withAlpha(hex: string, alpha: number): string {
  const a8 = Math.ceil(Math.min(1, Math.max(0, alpha)) * 255);
  return `${hex.slice(0, 7)}${a8.toString(16).padStart(2, "0")}`;
}
