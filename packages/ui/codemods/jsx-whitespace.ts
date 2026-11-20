import type { JSXElement } from "jscodeshift";

type Child = NonNullable<JSXElement["children"]>[number];

export const isLayoutWhitespace = (child: Child): boolean =>
  child.type === "JSXText" && /^[ \t\r\n]*$/.test(child.value);
