import type { GlobalStyleObject } from "@pandacss/types";

import { MEASURE, STICKY_TOP } from "./recipe";

const FLOW = "p, ul, ol, pre, blockquote, table, hr";

const markdown = (tags: string) =>
  `:where(${tags
    .split(", ")
    .map((tag) => `${tag}:not([class])`)
    .join(", ")})`;

/**
 * Prose rules for markdown inside `[data-docs-prose]`. They live in the `base` cascade layer, so
 * any recipe or style prop of a component placed in a page wins over them, and block rules skip
 * elements with a class, which markdown never gives: those belong to components.
 */
export const proseGlobalCss: GlobalStyleObject = {
  "[data-docs-prose]": {
    "& > :first-child": { marginTop: "0" },
    [`& :where(*) > ${markdown(FLOW)}:first-child`]: { marginTop: "0" },
    [`& :where(*) > ${markdown(FLOW)}:last-child`]: { marginBottom: "0" },
    "& > :where(h2)": {
      marginTop: "10",
      marginBottom: "3",
      fontSize: "2xl",
      lineHeight: "2rem",
      fontWeight: "semibold",
    },
    "& > :where(h3)": {
      marginTop: "8",
      marginBottom: "2",
      fontSize: "lg",
      lineHeight: "1.75rem",
      fontWeight: "semibold",
    },
    "& > :where(h4)": { marginTop: "6", marginBottom: "2", fontWeight: "semibold" },
    "& > :where(h2, h3, h4)": {
      maxWidth: MEASURE,
      scrollMarginTop: `calc(${STICKY_TOP} + 1rem)`,
    },
    [`& ${markdown("p, ul, ol, blockquote")}`]: { maxWidth: MEASURE },
    [`& ${markdown("p")}`]: { marginBlock: "4" },
    [`& ${markdown("ul, ol")}`]: { marginBlock: "4", paddingInlineStart: "6" },
    [`& ${markdown("ul")}`]: { listStyleType: "disc" },
    [`& ${markdown("ol")}`]: { listStyleType: "decimal" },
    [`& ${markdown("li")}`]: { marginBlock: "1.5" },
    [`& ${markdown("li")}::marker`]: { color: "fg.subtle" },
    "& :where(a)": {
      color: "colorPalette.plain.fg",
      textDecoration: "underline",
      textUnderlineOffset: "2px",
    },
    "& :where(strong)": { fontWeight: "semibold" },
    "& :where(code:not(pre > code))": {
      fontFamily: "mono",
      fontSize: "0.875em",
      paddingInline: "1",
      paddingBlock: "0.5",
      borderRadius: "sm",
      bg: "bg.muted",
    },
    "& :where(pre)": {
      marginBlock: "5",
      padding: "4",
      overflowX: "auto",
      borderRadius: "md",
      bg: "bg.subtle",
      borderWidth: "1px",
      borderColor: "border",
      fontSize: "sm",
      lineHeight: "1.6",
    },
    [`& ${markdown("blockquote")}`]: {
      marginBlock: "5",
      paddingInlineStart: "4",
      borderInlineStartWidth: "3px",
      borderInlineStartColor: "border.emphasized",
      color: "fg.muted",
    },
    [`& ${markdown("hr")}`]: { marginBlock: "8", borderTopWidth: "1px", borderColor: "border" },
    [`& ${markdown("table")}`]: {
      width: "100%",
      marginBlock: "5",
      borderCollapse: "collapse",
      fontSize: "sm",
      display: "block",
      overflowX: "auto",
    },
    [`& ${markdown("th, td")}`]: {
      paddingInline: "3",
      paddingBlock: "2",
      borderBottomWidth: "1px",
      borderColor: "border",
      textAlign: "start",
      verticalAlign: "top",
    },
    [`& ${markdown("th")}`]: { fontWeight: "semibold", color: "fg.muted", bg: "bg.subtle" },
    "& :where(img)": { maxWidth: "100%", height: "auto", borderRadius: "md" },
    "& :where(kbd)": {
      fontFamily: "mono",
      fontSize: "0.8em",
      paddingInline: "1.5",
      borderWidth: "1px",
      borderColor: "border",
      borderBottomWidth: "2px",
      borderRadius: "sm",
      bg: "bg.subtle",
    },
  },
};
