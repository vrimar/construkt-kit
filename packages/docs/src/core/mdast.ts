import { toString as mdastToString } from "mdast-util-to-string";

import type { MdNode } from "./types";

export const isElement = (node: MdNode, names?: readonly string[]) =>
  (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
  (!names || names.includes(node.name ?? ""));

/** Every MDX element in the tree, or every one named `names`, in document order. */
export const findElements = (node: MdNode, names?: readonly string[], found: MdNode[] = []) => {
  if (isElement(node, names)) found.push(node);
  for (const child of node.children ?? []) findElements(child, names, found);
  return found;
};

export const isEmptyExpression = (node: MdNode) =>
  (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") &&
  (node.data?.estree as { body?: unknown[] } | undefined)?.body?.length === 0;

const attributeValue = (node: MdNode, name: string) =>
  node.attributes?.find(
    (attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === name,
  )?.value;

export const hasAttribute = (node: MdNode, name: string) =>
  node.attributes?.some(
    (attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === name,
  ) ?? false;

/** An attribute written as a string: `id="project-menu"`. */
export const literalAttribute = (node: MdNode, name: string) => {
  const value = attributeValue(node, name);
  return typeof value === "string" ? value : undefined;
};

/** An attribute written as an integer literal expression: `id={1088001}`. */
export const integerAttribute = (node: MdNode, name: string) => {
  const value = attributeValue(node, name);
  const expression =
    typeof value === "object" && value !== null && "value" in value ? value.value : undefined;

  return typeof expression === "string" && /^\d+$/.test(expression.trim())
    ? Number(expression)
    : undefined;
};

interface EstreeNode {
  type: string;
  body?: EstreeNode[];
  expression?: EstreeNode;
  properties?: EstreeNode[];
  key?: EstreeNode;
  value?: EstreeNode | string | number | boolean | null;
  name?: string;
}

/** An attribute written as an object literal of plain values: `search={{ name: "Gate", map: 1038 }}`. */
export const objectAttribute = (node: MdNode, name: string) => {
  const value = attributeValue(node, name) as { data?: { estree?: EstreeNode } } | undefined;
  const expression = value?.data?.estree?.body?.[0]?.expression;
  if (expression?.type !== "ObjectExpression") return undefined;

  const entries = (expression.properties ?? []).map((property) =>
    property.key?.type === "Identifier" &&
    typeof property.value === "object" &&
    property.value?.type === "Literal"
      ? ([property.key.name ?? "", property.value.value] as const)
      : undefined,
  );

  return entries.every((entry) => entry !== undefined)
    ? (Object.fromEntries(entries) as Record<string, unknown>)
    : undefined;
};

const SEPARATED = new Set([
  "paragraph",
  "heading",
  "list",
  "listItem",
  "blockquote",
  "code",
  "table",
  "tableRow",
  "tableCell",
  "mdxJsxFlowElement",
]);

/**
 * Plain text of a node. Blocks, list items and table cells keep a space between them, so
 * neither words nor sentences run together.
 */
export const textOf = (
  node: MdNode,
  elementText?: (node: MdNode) => string | undefined,
): string => {
  if (node.type === "mdxjsEsm" || node.type === "yaml" || isEmptyExpression(node)) return "";
  if (node.type === "break") return " ";

  const custom = isElement(node) ? elementText?.(node) : undefined;
  if (custom !== undefined) return custom;
  if (!node.children) return mdastToString(node);

  const separated = node.children.some((child) => SEPARATED.has(child.type));
  return node.children.map((child) => textOf(child, elementText)).join(separated ? " " : "");
};
