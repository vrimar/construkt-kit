import type {
  API,
  ASTPath,
  FileInfo,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
} from "jscodeshift";

import { isLayoutWhitespace } from "./jsx-whitespace";
import { kitElementName } from "./kit-element-name";

export const parser = "tsx";

/**
 * Rewrites `<Part asChild><Child {...childProps}>{content}</Child></Part>` to
 * `<Part render={<Child {...childProps} />}>{content}</Part>`, and an expression child, such as
 * `{children}` or a ternary of two elements, to `render={…}`. Only elements imported from
 * `@construkt-kit/ui`, under any name, are rewritten; others, such as Ark's or Radix's, keep
 * `asChild`. A dynamic `asChild={…}`, or any other child, is left as it is and reported with its
 * file and line.
 */
export default function asChildToRender(file: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(file.source);
  const kitName = kitElementName(j, root);

  let changed = false;
  const report = (path: ASTPath<JSXElement>, why: string) =>
    api.report(`line ${path.node.loc?.start.line ?? "?"}: ${why}; rewrite it by hand`);

  for (const path of root.find(j.JSXElement).paths().reverse()) {
    const opening = path.node.openingElement;
    const attributes = opening.attributes ?? [];
    const index = attributes.findIndex(
      (attribute) => attribute.type === "JSXAttribute" && attribute.name.name === "asChild",
    );
    if (index === -1 || kitName(opening.name) === null) continue;

    const value = (attributes[index] as JSXAttribute).value;
    const literal =
      value == null
        ? true
        : value.type === "JSXExpressionContainer" && value.expression.type === "BooleanLiteral"
          ? value.expression.value
          : undefined;
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
      path.node.children = [];
      opening.selfClosing = true;
      path.node.closingElement = null;
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
    if (!renderFunction) {
      child.children = [];
      child.openingElement.selfClosing = true;
      child.closingElement = null;
    }
    attributes.splice(
      index,
      1,
      j.jsxAttribute(j.jsxIdentifier("render"), j.jsxExpressionContainer(child)),
    );

    if (meaningful.length && !renderFunction) {
      path.node.children = content;
    } else {
      path.node.children = [];
      opening.selfClosing = true;
      path.node.closingElement = null;
    }
    changed = true;
  }

  return changed ? root.toSource() : file.source;
}

function isElementExpression(expression: JSXExpressionContainer["expression"]): boolean {
  if (expression.type === "Identifier" || expression.type === "MemberExpression") return true;
  return (
    expression.type === "ConditionalExpression" &&
    [expression.consequent, expression.alternate].every(
      (branch) => branch.type === "JSXElement" || isElementExpression(branch),
    )
  );
}
