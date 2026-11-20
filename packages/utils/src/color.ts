/** A color space a `Color` is held in. */
export type ColorFormat = "rgba" | "hsla" | "hsba";

/** A string form a color can be written in; `css` is `rgba` for RGB colors and `hsla` otherwise. */
export type ColorStringFormat =
  | "hex"
  | "hexa"
  | "rgb"
  | "rgba"
  | "hsl"
  | "hsla"
  | "hsb"
  | "hsba"
  | "css";

export type ColorChannel =
  | "hue"
  | "saturation"
  | "brightness"
  | "lightness"
  | "red"
  | "green"
  | "blue"
  | "alpha";

export interface RgbColor {
  readonly format: "rgba";
  /** 0–255 */
  readonly red: number;
  /** 0–255 */
  readonly green: number;
  /** 0–255 */
  readonly blue: number;
  /** 0–1 */
  readonly alpha: number;
}

export interface HslColor {
  readonly format: "hsla";
  /** 0–360 */
  readonly hue: number;
  /** 0–100 */
  readonly saturation: number;
  /** 0–100 */
  readonly lightness: number;
  /** 0–1 */
  readonly alpha: number;
}

export interface HsbColor {
  readonly format: "hsba";
  /** 0–360 */
  readonly hue: number;
  /** 0–100 */
  readonly saturation: number;
  /** 0–100 */
  readonly brightness: number;
  /** 0–1 */
  readonly alpha: number;
}

/** An immutable color in one of three spaces; every function returns a new one. */
export type Color = RgbColor | HslColor | HsbColor;

export interface ColorChannelRange {
  minValue: number;
  maxValue: number;
  /** The step of an increment or decrement. */
  step: number;
  /** The step of a Page Up or Page Down. */
  pageSize: number;
}

export interface Color2DAxes {
  xChannel?: ColorChannel | undefined;
  yChannel?: ColorChannel | undefined;
}

export interface ColorAxes {
  xChannel: ColorChannel;
  yChannel: ColorChannel;
  zChannel: ColorChannel;
}

type ColorChannels = readonly [ColorChannel, ColorChannel, ColorChannel];

const CHANNELS: Record<ColorFormat, ColorChannels> = {
  rgba: ["red", "green", "blue"],
  hsla: ["hue", "saturation", "lightness"],
  hsba: ["hue", "saturation", "brightness"],
};

const nan = (value: number) => (Number.isNaN(value) ? 0 : value);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(nan(value), min), max);
const mod = (value: number, modulus: number) => ((value % modulus) + modulus) % modulus;
const toFixedNumber = (value: number, digits: number) => {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
};

const roundToStepPrecision = (value: number, step: number) => {
  const text = step.toString();
  const point = text.indexOf(".");
  const precision = point >= 0 ? text.length - point : 0;
  if (precision === 0) return value;
  const power = 10 ** precision;
  return Math.round(value * power) / power;
};

const snapToStep = (value: number, min: number, max: number, step: number) => {
  const remainder = (value - min) % step;
  let snapped =
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder;
  snapped = roundToStepPrecision(snapped, step);
  if (snapped < min) {
    snapped = min;
  } else if (snapped > max) {
    const steps = Math.floor((max - min) / step);
    const largest = min + steps * step;
    snapped = steps <= 0 || largest < min ? max : largest;
  }
  return roundToStepPrecision(snapped, step);
};

const HEX_COLOR = /^#[\da-f]+$/i;
const RGB_COLOR = /^rgba?\((.*)\)$/;
const HEX_DIGIT = /[^#]/gi;
const RGB_PART = /^([-+]?(?:\d+(?:\.\d+)?|\.\d+))(%?)$/;
const HSL_COLOR =
  /^(?:hsl\(([-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?%\s*,\s*[-+]?\d+(?:\.\d+)?%)\)|hsla\(([-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?%\s*,\s*[-+]?\d+(?:\.\d+)?%\s*,\s*[-+]?\d(?:\.\d+)?)\))$/;
const HSB_COLOR =
  /^(?:hsb\(([-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?%\s*,\s*[-+]?\d+(?:\.\d+)?%)\)|hsba\(([-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?%\s*,\s*[-+]?\d+(?:\.\d+)?%\s*,\s*[-+]?\d(?:\.\d+)?)\))$/;

const NAMED_COLORS =
  "aliceblue:f0f8ff,antiquewhite:faebd7,aqua:00ffff,aquamarine:7fffd4,azure:f0ffff,beige:f5f5dc,bisque:ffe4c4,black:000000,blanchedalmond:ffebcd,blue:0000ff,blueviolet:8a2be2,brown:a52a2a,burlywood:deb887,cadetblue:5f9ea0,chartreuse:7fff00,chocolate:d2691e,coral:ff7f50,cornflowerblue:6495ed,cornsilk:fff8dc,crimson:dc143c,cyan:00ffff,darkblue:00008b,darkcyan:008b8b,darkgoldenrod:b8860b,darkgray:a9a9a9,darkgreen:006400,darkkhaki:bdb76b,darkmagenta:8b008b,darkolivegreen:556b2f,darkorange:ff8c00,darkorchid:9932cc,darkred:8b0000,darksalmon:e9967a,darkseagreen:8fbc8f,darkslateblue:483d8b,darkslategray:2f4f4f,darkturquoise:00ced1,darkviolet:9400d3,deeppink:ff1493,deepskyblue:00bfff,dimgray:696969,dodgerblue:1e90ff,firebrick:b22222,floralwhite:fffaf0,forestgreen:228b22,fuchsia:ff00ff,gainsboro:dcdcdc,ghostwhite:f8f8ff,gold:ffd700,goldenrod:daa520,gray:808080,green:008000,greenyellow:adff2f,honeydew:f0fff0,hotpink:ff69b4,indianred:cd5c5c,indigo:4b0082,ivory:fffff0,khaki:f0e68c,lavender:e6e6fa,lavenderblush:fff0f5,lawngreen:7cfc00,lemonchiffon:fffacd,lightblue:add8e6,lightcoral:f08080,lightcyan:e0ffff,lightgoldenrodyellow:fafad2,lightgray:d3d3d3,lightgreen:90ee90,lightpink:ffb6c1,lightsalmon:ffa07a,lightseagreen:20b2aa,lightskyblue:87cefa,lightslategray:778899,lightsteelblue:b0c4de,lightyellow:ffffe0,lime:00ff00,limegreen:32cd32,linen:faf0e6,magenta:ff00ff,maroon:800000,mediumaquamarine:66cdaa,mediumblue:0000cd,mediumorchid:ba55d3,mediumpurple:9370db,mediumseagreen:3cb371,mediumslateblue:7b68ee,mediumspringgreen:00fa9a,mediumturquoise:48d1cc,mediumvioletred:c71585,midnightblue:191970,mintcream:f5fffa,mistyrose:ffe4e1,moccasin:ffe4b5,navajowhite:ffdead,navy:000080,oldlace:fdf5e6,olive:808000,olivedrab:6b8e23,orange:ffa500,orangered:ff4500,orchid:da70d6,palegoldenrod:eee8aa,palegreen:98fb98,paleturquoise:afeeee,palevioletred:db7093,papayawhip:ffefd5,peachpuff:ffdab9,peru:cd853f,pink:ffc0cb,plum:dda0dd,powderblue:b0e0e6,purple:800080,rebeccapurple:663399,red:ff0000,rosybrown:bc8f8f,royalblue:4169e1,saddlebrown:8b4513,salmon:fa8072,sandybrown:f4a460,seagreen:2e8b57,seashell:fff5ee,sienna:a0522d,silver:c0c0c0,skyblue:87ceeb,slateblue:6a5acd,slategray:708090,snow:fffafa,springgreen:00ff7f,steelblue:4682b4,tan:d2b48c,teal:008080,thistle:d8bfd8,tomato:ff6347,turquoise:40e0d0,violet:ee82ee,wheat:f5deb3,white:ffffff,whitesmoke:f5f5f5,yellow:ffff00,yellowgreen:9acd32";

const namedColors = /* @__PURE__ */ (() => {
  const map = new Map<string, string>();
  for (const entry of NAMED_COLORS.split(",")) {
    const [key, hex] = entry.split(":");
    map.set(key, `#${hex}`);
    if (key.includes("gray")) map.set(key.replace("gray", "grey"), `#${hex}`);
  }
  return map;
})();

function parseRgbPart(part: string, max: number): number | undefined {
  const match = part.trim().match(RGB_PART);
  if (!match) return undefined;
  const number = Number(match[1]);
  return clamp(match[2] ? (number / 100) * max : number, 0, max);
}

function parseRgb(value: string): RgbColor | undefined {
  let channels: (number | undefined)[] = [];
  if (HEX_COLOR.test(value) && [4, 5, 7, 9].includes(value.length)) {
    const digits = (value.length < 6 ? value.replace(HEX_DIGIT, "$&$&") : value).slice(1).split("");
    while (digits.length > 0) channels.push(Number.parseInt(digits.splice(0, 2).join(""), 16));
    channels[3] = channels[3] === undefined ? undefined : channels[3] / 255;
  }
  const match = value.match(RGB_COLOR);
  if (match?.[1]) {
    const parts = match[1].split(",");
    if (parts.length > 4) return undefined;
    channels = parts.map((part, index) => parseRgbPart(part, index < 3 ? 255 : 1));
    if (channels.includes(undefined)) return undefined;
  }
  if (channels.length < 3) return undefined;
  const [red, green, blue, alpha] = channels as number[];
  return { format: "rgba", red, green, blue, alpha: alpha ?? 1 };
}

function parseHueColor(
  value: string,
  pattern: RegExp,
): [number, number, number, number] | undefined {
  const match = value.match(pattern);
  if (!match) return undefined;
  const [hue, saturation, third, alpha] = (match[1] ?? match[2])
    .split(",")
    .map((part) => Number(part.trim().replace("%", "")));
  return [mod(hue, 360), clamp(saturation, 0, 100), clamp(third, 0, 100), clamp(alpha ?? 1, 0, 1)];
}

function parseHsb(value: string): HsbColor | undefined {
  const parts = parseHueColor(value, HSB_COLOR);
  if (!parts) return undefined;
  const [hue, saturation, brightness, alpha] = parts;
  return { format: "hsba", hue, saturation, brightness, alpha };
}

function parseHsl(value: string): HslColor | undefined {
  const parts = parseHueColor(value, HSL_COLOR);
  if (!parts) return undefined;
  const [hue, saturation, lightness, alpha] = parts;
  return { format: "hsla", hue, saturation, lightness, alpha };
}

/**
 * Parses a color keyword, `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()` (with numbers
 * or percentages), `hsl()`, `hsla()`, `hsb()` or `hsba()`, keeping the space it is written in.
 * Throws when it can't.
 */
export function parseColor(value: string): Color {
  const text = value.trim();
  const named = namedColors.get(text.toLowerCase());
  if (named) return parseColor(named);
  const color = parseRgb(text) ?? parseHsb(text) ?? parseHsl(text);
  if (!color) throw new Error(`Invalid color value: ${value}`);
  return color;
}

function rgbToHsb({ red: r, green: g, blue: b, alpha }: RgbColor): HsbColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const min = Math.min(red, green, blue);
  const brightness = Math.max(red, green, blue);
  const chroma = brightness - min;
  const saturation = brightness === 0 ? 0 : chroma / brightness;
  let hue = 0;
  if (chroma !== 0) {
    if (brightness === red) hue = (green - blue) / chroma + (green < blue ? 6 : 0);
    else if (brightness === green) hue = (blue - red) / chroma + 2;
    else hue = (red - green) / chroma + 4;
    hue /= 6;
  }
  return {
    format: "hsba",
    hue: toFixedNumber(hue * 360, 2),
    saturation: toFixedNumber(saturation * 100, 2),
    brightness: toFixedNumber(brightness * 100, 2),
    alpha: toFixedNumber(alpha, 2),
  };
}

function rgbToHsl({ red: r, green: g, blue: b, alpha }: RgbColor): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const min = Math.min(red, green, blue);
  const max = Math.max(red, green, blue);
  const lightness = (max + min) / 2;
  const chroma = max - min;
  let hue = 0;
  let saturation = 0;
  if (chroma !== 0) {
    saturation = chroma / (lightness < 0.5 ? max + min : 2 - max - min);
    if (max === red) hue = (green - blue) / chroma + (green < blue ? 6 : 0);
    else if (max === green) hue = (blue - red) / chroma + 2;
    else hue = (red - green) / chroma + 4;
    hue /= 6;
  }
  return {
    format: "hsla",
    hue: toFixedNumber(hue * 360, 2),
    saturation: toFixedNumber(saturation * 100, 2),
    lightness: toFixedNumber(lightness * 100, 2),
    alpha: toFixedNumber(alpha, 2),
  };
}

function hslToHsb({ hue, saturation: s, lightness: l, alpha }: HslColor): HsbColor {
  const lightness = l / 100;
  const brightness = lightness + (s / 100) * Math.min(lightness, 1 - lightness);
  const saturation = brightness === 0 ? 0 : 2 * (1 - lightness / brightness);
  return {
    format: "hsba",
    hue: toFixedNumber(hue, 2),
    saturation: toFixedNumber(saturation * 100, 2),
    brightness: toFixedNumber(brightness * 100, 2),
    alpha: toFixedNumber(alpha, 2),
  };
}

function hslToRgb({ hue, saturation: s, lightness: l, alpha }: HslColor): RgbColor {
  const saturation = s / 100;
  const lightness = l / 100;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    return lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    format: "rgba",
    red: Math.round(channel(0) * 255),
    green: Math.round(channel(8) * 255),
    blue: Math.round(channel(4) * 255),
    alpha: toFixedNumber(alpha, 2),
  };
}

function hsbToHsl({ hue, saturation: s, brightness: b, alpha }: HsbColor): HslColor {
  const brightness = b / 100;
  const lightness = brightness * (1 - s / 100 / 2);
  const saturation =
    lightness === 0 || lightness === 1
      ? 0
      : (brightness - lightness) / Math.min(lightness, 1 - lightness);
  return {
    format: "hsla",
    hue: toFixedNumber(hue, 2),
    saturation: toFixedNumber(saturation * 100, 2),
    lightness: toFixedNumber(lightness * 100, 2),
    alpha: toFixedNumber(alpha, 2),
  };
}

function hsbToRgb({ hue, saturation: s, brightness: b, alpha }: HsbColor): RgbColor {
  const saturation = s / 100;
  const brightness = b / 100;
  const channel = (n: number) => {
    const k = (n + hue / 60) % 6;
    return brightness - saturation * brightness * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  return {
    format: "rgba",
    red: Math.round(channel(5) * 255),
    green: Math.round(channel(3) * 255),
    blue: Math.round(channel(1) * 255),
    alpha: toFixedNumber(alpha, 2),
  };
}

function toRgb(color: Color): RgbColor {
  if (color.format === "rgba") return color;
  return color.format === "hsla" ? hslToRgb(color) : hsbToRgb(color);
}

function toHsl(color: Color): HslColor {
  if (color.format === "hsla") return color;
  return color.format === "rgba" ? rgbToHsl(color) : hsbToHsl(color);
}

function toHsb(color: Color): HsbColor {
  if (color.format === "hsba") return color;
  return color.format === "rgba" ? rgbToHsb(color) : hslToHsb(color);
}

/** The color in `format`'s space; the same object when it is already in it. */
export function convertColor(color: Color, format: "rgba"): RgbColor;
export function convertColor(color: Color, format: "hsla"): HslColor;
export function convertColor(color: Color, format: "hsba"): HsbColor;
export function convertColor(color: Color, format: ColorFormat): Color;
export function convertColor(color: Color, format: ColorFormat): Color {
  if (format === "rgba") return toRgb(color);
  return format === "hsla" ? toHsl(color) : toHsb(color);
}

const hexByte = (value: number) => Math.round(value).toString(16).padStart(2, "0");

const writeHsl = ({ hue, saturation, lightness }: HslColor) =>
  `${hue}, ${toFixedNumber(saturation, 2)}%, ${toFixedNumber(lightness, 2)}%`;

const writeHsb = ({ hue, saturation, brightness }: HsbColor) =>
  `${hue}, ${toFixedNumber(saturation, 2)}%, ${toFixedNumber(brightness, 2)}%`;

/** Writes the color as a string, converting it to `format`'s space when needed. @default "css" */
export function formatColor(color: Color, format: ColorStringFormat = "css"): string {
  switch (format) {
    case "hex":
    case "hexa": {
      const { red, green, blue, alpha } = toRgb(color);
      const bytes = hexByte(red) + hexByte(green) + hexByte(blue);
      const alphaByte = format === "hexa" ? hexByte(Math.round(alpha * 255)) : "";
      return `#${(bytes + alphaByte).toUpperCase()}`;
    }
    case "rgb": {
      const { red, green, blue } = toRgb(color);
      return `rgb(${red}, ${green}, ${blue})`;
    }
    case "rgba": {
      const { red, green, blue, alpha } = toRgb(color);
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
    case "hsl":
      return `hsl(${writeHsl(toHsl(color))})`;
    case "hsla": {
      const hsl = toHsl(color);
      return `hsla(${writeHsl(hsl)}, ${hsl.alpha})`;
    }
    case "hsb":
      return `hsb(${writeHsb(toHsb(color))})`;
    case "hsba": {
      const hsb = toHsb(color);
      return `hsba(${writeHsb(hsb)}, ${hsb.alpha})`;
    }
    case "css":
      return formatColor(color, color.format === "rgba" ? "rgba" : "hsla");
  }
}

/** The three channels of the color's space, without alpha. */
export function getColorChannels(color: Color): ColorChannels {
  return CHANNELS[color.format];
}

function hasChannel(color: Color, channel: ColorChannel) {
  return channel === "alpha" || CHANNELS[color.format].includes(channel);
}

/** A channel's value. Throws for a channel the color's space doesn't have. */
export function getColorChannelValue(color: Color, channel: ColorChannel): number {
  if (!hasChannel(color, channel)) throw new Error(`Unsupported color channel: ${channel}`);
  return (color as unknown as Record<ColorChannel, number>)[channel];
}

/** A channel's bounds and steps in the color's space. Throws for a channel it doesn't have. */
export function getColorChannelRange(color: Color, channel: ColorChannel): ColorChannelRange {
  if (!hasChannel(color, channel)) throw new Error(`Unknown color channel: ${channel}`);
  switch (channel) {
    case "red":
    case "green":
    case "blue":
      return { minValue: 0, maxValue: 255, step: 1, pageSize: 17 };
    case "alpha":
      return { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 };
    case "hue":
      return { minValue: 0, maxValue: 360, step: 1, pageSize: 15 };
    default:
      return { minValue: 0, maxValue: 100, step: 1, pageSize: 10 };
  }
}

/** The color with a channel set, clamped to its range. Throws for a channel it doesn't have. */
export function setColorChannelValue<C extends Color>(
  color: C,
  channel: ColorChannel,
  value: number,
): C {
  const { minValue, maxValue } = getColorChannelRange(color, channel);
  return { ...color, [channel]: clamp(value, minValue, maxValue) };
}

/** Where a channel's value, or `value`, sits in its range, from 0 to 1. */
export function getColorChannelValuePercent(
  color: Color,
  channel: ColorChannel,
  value?: number,
): number {
  const { minValue, maxValue } = getColorChannelRange(color, channel);
  return (nan(value ?? getColorChannelValue(color, channel)) - minValue) / (maxValue - minValue);
}

/** The channel value at `percent` (0 to 1) of its range, snapped to its step. */
export function getColorChannelPercentValue(
  color: Color,
  channel: ColorChannel,
  percent: number,
): number {
  const { minValue, maxValue, step } = getColorChannelRange(color, channel);
  const raw = percent * (maxValue - minValue) + minValue;
  const rounded = Math.round((nan(raw) - minValue) / step) * step + minValue;
  return snapToStep(clamp(rounded, minValue, maxValue), minValue, maxValue, step);
}

/** The color with a channel moved by `stepSize`, clamped and snapped to the channel's step. */
export function incrementColorChannel<C extends Color>(
  color: C,
  channel: ColorChannel,
  stepSize: number,
): C {
  const { minValue, maxValue, step } = getColorChannelRange(color, channel);
  const value = snapToStep(
    clamp(getColorChannelValue(color, channel) + stepSize, minValue, maxValue),
    minValue,
    maxValue,
    step,
  );
  return setColorChannelValue(color, channel, value);
}

export function decrementColorChannel<C extends Color>(
  color: C,
  channel: ColorChannel,
  stepSize: number,
): C {
  return incrementColorChannel(color, channel, -stepSize);
}

const CHANNEL_FORMATS: Record<ColorChannel, Intl.NumberFormatOptions> = {
  red: { style: "decimal" },
  green: { style: "decimal" },
  blue: { style: "decimal" },
  hue: { style: "unit", unit: "degree", unitDisplay: "narrow" },
  saturation: { style: "percent" },
  lightness: { style: "percent" },
  brightness: { style: "percent" },
  alpha: { style: "percent" },
};

/** A channel's value written for `locale`: degrees for hue, percentages for the rest but RGB. */
export function formatColorChannelValue(
  color: Color,
  channel: ColorChannel,
  locale: string,
): string {
  let value = getColorChannelValue(color, channel);
  if (channel === "saturation" || channel === "lightness" || channel === "brightness") value /= 100;
  return new Intl.NumberFormat(locale, CHANNEL_FORMATS[channel]).format(value);
}

/** The x, y and remaining z channel of the color's space, filling in whichever of x and y is missing. */
export function getColorAxes(color: Color, { xChannel, yChannel }: Color2DAxes): ColorAxes {
  const channels = getColorChannels(color);
  const x = xChannel ?? channels.find((channel) => channel !== yChannel);
  const y = yChannel ?? channels.find((channel) => channel !== x);
  const z = channels.find((channel) => channel !== x && channel !== y);
  return { xChannel: x as ColorChannel, yChannel: y as ColorChannel, zChannel: z as ColorChannel };
}

/** Whether two colors are in the same space with the same channel values. */
export function isColorEqual(a: Color, b: Color): boolean {
  if (a.format !== b.format || a.alpha !== b.alpha) return false;
  return CHANNELS[a.format].every(
    (channel) => getColorChannelValue(a, channel) === getColorChannelValue(b, channel),
  );
}
