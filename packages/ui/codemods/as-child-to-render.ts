import type { JSXExpressionContainer } from "jscodeshift";

import { findAttribute, isLayoutWhitespace, kitTransform, literalBoolean, selfClose } from "./jsx";

export const parser = "tsx";

/**
 * Rewrites `<Part asChild><Child {...childProps}>{content}</Child></Part>` to
 * `<Part render={<Child {...childProps} />}>{content}</Part>`, and an expression child, such as
 * `{children}` or a ternary of two elements, to `render={…}`. Only elements imported from
 * `@construkt-kit/ui`, under any name, are rewritten; others, such as Ark's or Radix's, keep
 * `asChild`. A dynamic `asChild={…}`, or any other child, is left as it is and reported with its
 * file and line.
 */
export default kitTransform(({ j, root, kitName, report }) => {
  let changed = false;

  for (const path of root.find(j.JSXElement).paths().reverse()) {
    const opening = path.node.openingElement;
    const attributes = opening.attributes ?? [];
    const asChild = findAttribute(attributes, "asChild");
    if (!asChild || kitName(opening.name) === null) continue;
    const index = attributes.indexOf(asChild);

    const literal = literalBoolean(asChild);
    if (literal === undefined) {
      report(path, "asChild has a dynamic value");
      continue;
    }
    if (!literal) {
      attributes.splice(index, 1);
      changed = true;
      continue;
    }

    const children = (path.node.children ?? []).filter((child) => !isLayoutWhitespace(child));
    const [child] = children;
    if (children.length === 1 && child?.type === "JSXExpressionContainer") {
      const { expression } = child;
      if (!isElementExpression(expression)) {
        report(path, "asChild needs a single element child");
        continue;
      }
      attributes.splice(
        index,
        1,
        j.jsxAttribute(j.jsxIdentifier("render"), j.jsxExpressionContainer(expression)),
      );
      selfClose(path.node);
      changed = true;
      continue;
    }
    if (children.length !== 1 || child?.type !== "JSXElement") {
      report(path, "asChild needs a single element child");
      continue;
    }

    const content = child.children ?? [];
    const meaningful = content.filter((node) => !isLayoutWhitespace(node));
    const renderFunction =
      meaningful.length === 1 &&
      meaningful[0]?.type === "JSXExpressionContainer" &&
      (meaningful[0].expression.type === "ArrowFunctionExpression" ||
        meaningful[0].expression.type === "FunctionExpression");
    if (!renderFunction) selfClose(child);
    attributes.splice(
      index,
      1,
      j.jsxAttribute(j.jsxIdentifier("render"), j.jsxExpressionContainer(child)),
    );

    if (meaningful.length && !renderFunction) path.node.children = content;
    else selfClose(path.node);
    changed = true;
  }

  return changed;
});

function isElementExpression(expression: JSXExpressionContainer["expression"]): boolean {
  if (expression.type === "Identifier" || expression.type === "MemberExpression") return true;
  return (
    expression.type === "ConditionalExpression" &&
    [expression.consequent, expression.alternate].every(
      (branch) => branch.type === "JSXElement" || isElementExpression(branch),
    )
  );
}
