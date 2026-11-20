import {
  type Color,
  type ColorChannel,
  type ColorChannelRange,
  type ColorFormat,
  convertColor,
  formatColor,
  getColorAxes,
  getColorChannelRange,
  getColorChannelValue,
  parseColor,
  setColorChannelValue,
} from "@construkt-kit/utils";

export type ExtendedColorChannel = ColorChannel | "hex" | "css";

export type Orientation = "horizontal" | "vertical";

export interface AreaGradient {
  /** The area's own background, under its gradient layer. */
  base: string | undefined;
  gradient: string;
  mask: string | undefined;
}

const hslAt = (alpha: number) =>
  [0, 60, 120, 180, 240, 300, 359].map((hue) => `hsla(${hue},100%,50%,${alpha})`).join(",");

/** The two layers that paint every color of the area's x and y channels at its z channel's value. */
export function getAreaGradient(
  color: Color,
  axes: { xChannel: ColorChannel; yChannel: ColorChannel },
  dir: "ltr" | "rtl",
): AreaGradient {
  const { xChannel } = axes;
  const { zChannel } = getColorAxes(color, axes);
  const zValue = getColorChannelValue(color, zChannel);
  const { minValue: zMin, maxValue: zMax } = getColorChannelRange(color, zChannel);
  const sides: [string, string] = ["top", dir === "rtl" ? "left" : "right"];
  const alpha = (zValue - zMin) / (zMax - zMin);
  const hsl = color.format === "hsla";

  const rgbLayers = (flipped: boolean, from: (a: number, b: number) => string): AreaGradient => ({
    base: `linear-gradient(to ${sides[Number(flipped)]},${from(0, 0)},${from(255, 0)})`,
    gradient: `linear-gradient(to ${sides[Number(flipped)]},${from(0, 255)},${from(255, 255)})`,
    mask: `linear-gradient(to ${sides[Number(!flipped)]}, transparent, #000)`,
  });
  const layers = (flipped: boolean, build: (to: (cross: boolean) => string) => string[]) => ({
    base: undefined,
    gradient: build((cross) => sides[Number(cross ? !flipped : flipped)]).join(","),
    mask: undefined,
  });

  switch (zChannel) {
    case "red":
      return rgbLayers(xChannel === "green", (a, b) => `rgb(${zValue},${a},${b})`);
    case "green":
      return rgbLayers(xChannel === "red", (a, b) => `rgb(${a},${zValue},${b})`);
    case "blue":
      return rgbLayers(xChannel === "red", (a, b) => `rgb(${a},${b},${zValue})`);
    case "hue":
      return layers(xChannel !== "saturation", (to) =>
        hsl
          ? [
              `linear-gradient(to ${to(false)}, hsla(0,0%,0%,1) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,1) 100%)`,
              `linear-gradient(to ${to(true)},hsl(0,0%,50%),hsla(0,0%,50%,0))`,
              `hsl(${zValue}, 100%, 50%)`,
            ]
          : [
              `linear-gradient(to ${to(false)},hsl(0,0%,0%),hsla(0,0%,0%,0))`,
              `linear-gradient(to ${to(true)},hsl(0,0%,100%),hsla(0,0%,100%,0))`,
              `hsl(${zValue}, 100%, 50%)`,
            ],
      );
    case "saturation":
      return layers(xChannel === "hue", (to) =>
        hsl
          ? [
              `linear-gradient(to ${to(true)}, hsla(0,0%,0%,${alpha}) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,${alpha}) 100%)`,
              `linear-gradient(to ${to(false)},${hslAt(alpha)})`,
              "hsl(0, 0%, 50%)",
            ]
          : [
              `linear-gradient(to ${to(true)},hsla(0,0%,0%,${alpha}),hsla(0,0%,0%,0))`,
              `linear-gradient(to ${to(false)},${hslAt(alpha)})`,
              `linear-gradient(to ${to(true)},hsl(0,0%,0%),hsl(0,0%,100%))`,
            ],
      );
    case "brightness":
      return layers(xChannel === "hue", (to) => [
        `linear-gradient(to ${to(true)},hsla(0,0%,100%,${alpha}),hsla(0,0%,100%,0))`,
        `linear-gradient(to ${to(false)},${hslAt(alpha)})`,
        "#000",
      ]);
    case "lightness":
      return layers(xChannel === "hue", (to) => [
        `linear-gradient(to ${to(true)},hsl(0,0%,${zValue}%),hsla(0,0%,${zValue}%,0))`,
        `linear-gradient(to ${to(false)},${[0, 60, 120, 180, 240, 300, 360]
          .map((hue) => `hsl(${hue},100%,${zValue}%)`)
          .join(",")})`,
      ]);
    default:
      throw new Error(`Unknown color channel: ${zChannel}`);
  }
}

/** The gradient a channel slider's track shows across the channel's range. */
export function getSliderBackground(
  color: Color,
  channel: ColorChannel,
  orientation: Orientation,
  dir: "ltr" | "rtl",
): string {
  const to = orientation === "vertical" ? "top" : dir === "ltr" ? "right" : "left";
  const { minValue, maxValue } = getColorChannelRange(color, channel);
  const at = (value: number) => formatColor(setColorChannelValue(color, channel, value), "css");
  switch (channel) {
    case "hue":
      return `linear-gradient(to ${to}, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)`;
    case "lightness":
      return `linear-gradient(to ${to}, ${at(minValue)}, ${at((maxValue - minValue) / 2)}, ${at(maxValue)})`;
    default:
      return `linear-gradient(to ${to}, ${at(minValue)}, ${at(maxValue)})`;
  }
}

/** The color a channel slider's thumb shows: the pure hue, or the color without transparency. */
export function getChannelDisplayColor(color: Color, channel: ColorChannel): Color {
  switch (channel) {
    case "hue":
      return parseColor(`hsl(${getColorChannelValue(color, "hue")}, 100%, 50%)`);
    case "alpha":
      return color;
    default:
      return setColorChannelValue(color, "alpha", 1);
  }
}

/** The space a channel input reads its channel from in a picker showing `format`. */
export const getChannelSpace = (format: ColorFormat, channel: ColorChannel): ColorFormat => {
  switch (channel) {
    case "hue":
    case "saturation":
      return format === "hsla" ? "hsla" : "hsba";
    case "lightness":
      return "hsla";
    case "brightness":
      return "hsba";
    case "red":
    case "green":
    case "blue":
      return "rgba";
    default:
      return format;
  }
};

/** The text a channel input shows for the color in a picker showing `format`. */
export function getChannelInputValue(
  color: Color,
  channel: ExtendedColorChannel,
  format: ColorFormat,
): string {
  if (channel === "hex") return formatColor(color, "hex");
  if (channel === "css") return formatColor(color, "css");
  return getColorChannelValue(
    convertColor(color, getChannelSpace(format, channel)),
    channel,
  ).toString();
}

/** A numeric channel input's bounds in a picker showing `format`; none for the css input. */
export function getChannelInputRange(
  color: Color,
  channel: ExtendedColorChannel,
  format: ColorFormat,
): ColorChannelRange | undefined {
  if (channel === "hex") return { minValue: 0, maxValue: 0xffffff, step: 1, pageSize: 10 };
  if (channel === "css") return undefined;
  return getColorChannelRange(convertColor(color, getChannelSpace(format, channel)), channel);
}

const HEX_DIGITS = /^[0-9a-fA-F]{3,8}$/;

/** `value` with a leading `#` when it is bare hex digits. */
export const prefixHex = (value: string): string =>
  value.startsWith("#") || !HEX_DIGITS.test(value) ? value : `#${value}`;

const FORMATS: ColorFormat[] = ["hsba", "hsla", "rgba"];

export const getNextFormat = (format: ColorFormat): ColorFormat =>
  FORMATS[FORMATS.indexOf(format) + 1] ?? FORMATS[0];

export const isColorFormat = (value: string): value is ColorFormat =>
  (FORMATS as string[]).includes(value);
