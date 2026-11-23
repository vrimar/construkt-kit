import type { JSXAttribute, JSXElement, JSXText } from "jscodeshift";

import { attributeName, isLayoutWhitespace, type JSXChild, kitTransform, selfClose } from "./jsx";

export const parser = "tsx";

const MODALS = ["Dialog", "Drawer", "Sheet"];

const SHEET_HEADER_PROPS: Record<string, string> = {
  startElement: "headerStart",
  endElement: "headerEnd",
};

/**
 * Moves a plain modal header to its root: `<Dialog.Root><Dialog.Content><Dialog.Header>` holding
 * only a `Dialog.Title` and an optional `Dialog.Description` becomes `<Dialog.Root title=…
 * description=…>`, the same for `Drawer` and `Sheet`. A `Sheet.Header`'s `startElement` and
 * `endElement` move to `Sheet.Content`'s `headerStart` and `headerEnd`. The root's `aria-label`
 * goes, as the title names it. A plain header whose root is in another component is left as it is
 * and reported with its line. Only elements imported from `@construkt-kit/ui`, under any name, are
 * rewritten.
 */
export default kitTransform(({ j, root, kitName, report }) => {
  const elementName = (element: JSXElement) => kitName(element.openingElement.name);

  let changed = false;
  const moved = new Set<JSXElement>();

  root.find(j.JSXElement).forEach((path) => {
    const modal = MODALS.find((name) => elementName(path.node) === `${name}.Root`);
    if (!modal) return;
    const rootAttributes = path.node.openingElement.attributes ?? [];
    if (rootAttributes.some((attribute) => attributeName(attribute) === "title")) return;

    const content = elementChildren(path.node).filter(
      (child) => elementName(child) === `${modal}.Content`,
    );
    if (content.length !== 1) return;
    const [contentElement] = content as [JSXElement];
    const header = elementChildren(contentElement).find(
      (child) => elementName(child) === `${modal}.Header`,
    );
    if (!header) return;
    const plain = plainHeader(header, modal);
    if (!plain) return;

    const attributes: JSXAttribute[] = [j.jsxAttribute(j.jsxIdentifier("title"), plain.title)];
    if (plain.description) {
      attributes.push(j.jsxAttribute(j.jsxIdentifier("description"), plain.description));
    }
    path.node.openingElement.attributes = [
      ...rootAttributes.filter((attribute) => attributeName(attribute) !== "aria-label"),
      ...attributes,
    ];
    for (const attribute of header.openingElement.attributes ?? []) {
      if (attribute.type !== "JSXAttribute" || typeof attribute.name.name !== "string") continue;
      attribute.name = j.jsxIdentifier(
        SHEET_HEADER_PROPS[attribute.name.name] ?? attribute.name.name,
      );
      contentElement.openingElement.attributes = [
        ...(contentElement.openingElement.attributes ?? []),
        attribute,
      ];
    }
    contentElement.children = withoutChild(contentElement.children ?? [], header);
    if (!contentElement.children.some(isMeaningful)) selfClose(contentElement);
    moved.add(header);
    changed = true;
  });

  root.find(j.JSXElement).forEach((path) => {
    const modal = MODALS.find((name) => elementName(path.node) === `${name}.Header`);
    if (!modal || moved.has(path.node)) return;
    if (plainHeader(path.node, modal)) {
      report(
        path,
        `this ${modal}.Header only holds a title; give it to ${modal}.Root as \`title\``,
      );
    }
  });

  return changed;

  function plainHeader(header: JSXElement, modal: string) {
    const headerAttributes = header.openingElement.attributes ?? [];
    const allowed = modal === "Sheet" ? Object.keys(SHEET_HEADER_PROPS) : [];
    if (headerAttributes.some((attribute) => !allowed.includes(attributeName(attribute) ?? ""))) {
      return null;
    }
    const children = (header.children ?? []).filter(isMeaningful);
    const [title, description, ...rest] = children;
    if (rest.length > 0 || !isBare(title, `${modal}.Title`)) return null;
    if (description && !isBare(description, `${modal}.Description`)) return null;
    return {
      title: labelValue(title as JSXElement),
      description: description ? labelValue(description as JSXElement) : null,
    };
  }

  function labelValue(element: JSXElement) {
    const children = (element.children ?? []).filter(isMeaningful);
    const [only] = children;
    if (children.length === 1 && only?.type === "JSXText" && fitsAttributeString(only)) {
      return j.stringLiteral(only.value.replace(/[ \t\r\n]+/g, " ").replace(/^ | $/g, ""));
    }
    if (children.length === 1 && only?.type === "JSXExpressionContainer") {
      if (only.expression.type !== "JSXEmptyExpression")
        return j.jsxExpressionContainer(only.expression);
    }
    const asWritten = children.map((child) =>
      child.type === "JSXText" ? j.jsxText(rawText(child)) : child,
    );
    return j.jsxExpressionContainer(
      j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), asWritten),
    );
  }

  function isBare(child: JSXChild | undefined, name: string): boolean {
    return (
      child?.type === "JSXElement" &&
      elementName(child) === name &&
      (child.openingElement.attributes ?? []).length === 0
    );
  }
});

const rawText = (text: JSXText) =>
  (text as JSXText & { extra?: { raw?: string } }).extra?.raw ?? text.value;

const fitsAttributeString = (text: JSXText) =>
  rawText(text) === text.value && !/[&"{}<>\\]/.test(text.value);

const isMeaningful = (child: JSXChild) => !isLayoutWhitespace(child);

function withoutChild(children: JSXChild[], removed: JSXElement): JSXChild[] {
  const index = children.indexOf(removed);
  const next = children[index + 1];
  const drop = next && isLayoutWhitespace(next) ? 2 : 1;
  return [...children.slice(0, index), ...children.slice(index + drop)];
}

function elementChildren(element: JSXElement): JSXElement[] {
  return (element.children ?? []).filter(
    (child): child is JSXElement => child.type === "JSXElement",
  );
}
