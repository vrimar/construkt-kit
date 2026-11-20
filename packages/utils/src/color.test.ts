import { describe, expect, it } from "vitest";

import {
  type Color,
  convertColor,
  formatColor,
  getColorChannelPercentValue,
  incrementColorChannel,
  parseColor,
  setColorChannelValue,
} from "./color";

describe("color conversion", () => {
  it.each(["#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF", "#6699CC", "#336633"])(
    "round-trips %s through HSB and HSL",
    (hex) => {
      const rgb = parseColor(hex);
      expect(formatColor(convertColor(convertColor(rgb, "hsba"), "rgba"), "hex")).toBe(hex);
      expect(formatColor(convertColor(convertColor(rgb, "hsla"), "rgba"), "hex")).toBe(hex);
    },
  );

  it("writes an HSB color's css string in a syntax CSS accepts", () => {
    expect(formatColor(parseColor("hsb(0, 0%, 100%)"), "css")).toBe("hsla(0, 0%, 100%, 1)");
  });
});

describe("parseColor", () => {
  it("expands short hex and reads its last byte as alpha", () => {
    const color = parseColor("#1238");
    expect(formatColor(color, "hexa")).toBe("#11223388");
    expect(color).toMatchObject({ red: 17, green: 34, blue: 51, alpha: 136 / 255 });
  });

  it("wraps hue into 0–360 instead of clamping it", () => {
    expect(parseColor("hsl(380, 50%, 50%)")).toMatchObject({ hue: 20 });
    expect(parseColor("hsb(-30, 50%, 50%)")).toMatchObject({ hue: 330 });
  });

  it("reads a keyword in any case, around whitespace", () => {
    expect(formatColor(parseColor(" LightGray "), "hex")).toBe("#D3D3D3");
  });

  it("reads rgb() percentages", () => {
    expect(parseColor("rgba(100%, 0%, 50%, 50%)")).toMatchObject({
      red: 255,
      green: 0,
      blue: 127.5,
      alpha: 0.5,
    });
  });

  it.each(["rgb(abc, 0, 0)", "rgb(255, 0, 0,)", "hsl(12x5, 50%, 50%)", "hsb(0, 0%, 0%) 1"])(
    "throws for %s",
    (text) => {
      expect(() => parseColor(text)).toThrow();
    },
  );
});

describe("formatColor", () => {
  it("rounds fractional channels to whole hex bytes", () => {
    expect(formatColor({ format: "rgba", red: 10.5, green: 0, blue: 127.5, alpha: 1 }, "hex")).toBe(
      "#0B0080",
    );
  });
});

describe("channels", () => {
  const red: Color = parseColor("#FF0000");

  it("clamps a set value to the channel's range", () => {
    expect(setColorChannelValue(red, "green", 300)).toMatchObject({ green: 255 });
    expect(setColorChannelValue(red, "alpha", -1)).toMatchObject({ alpha: 0 });
  });

  it("snaps percentages and steps to the channel's step precision", () => {
    expect(getColorChannelPercentValue(red, "alpha", 0.333)).toBe(0.33);
    expect(
      incrementColorChannel(setColorChannelValue(red, "alpha", 0.7), "alpha", 0.1),
    ).toMatchObject({ alpha: 0.8 });
  });
});
