import { defineGlobalFontface } from "@pandacss/dev";

const latinUnicodeRange =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

export const globalFontface = defineGlobalFontface({
  "Inter Variable": [
    {
      src: 'url("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2") format("woff2-variations")',
      fontStyle: "normal",
      fontDisplay: "swap",
      fontWeight: "100 900",
      unicodeRange: latinUnicodeRange,
    },
    {
      src: 'url("@fontsource-variable/inter/files/inter-latin-wght-italic.woff2") format("woff2-variations")',
      fontStyle: "italic",
      fontDisplay: "swap",
      fontWeight: "100 900",
      unicodeRange: latinUnicodeRange,
    },
  ],
});
