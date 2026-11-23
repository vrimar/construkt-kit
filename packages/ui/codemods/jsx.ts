import type {
  API,
  ASTPath,
  Collection,
  FileInfo,
  JSCodeshift,
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXSpreadAttribute,
  Node,
} from "jscodeshift";

const KIT = "@construkt-kit/ui";

type JSXName = JSXIdentifier | JSXMemberExpression | JSXNamespacedName;

export type JSXChild = NonNullable<JSXElement["children"]>[number];

export type Attribute = JSXAttribute | JSXSpreadAttribute;

export interface KitTransformContext {
  j: JSCodeshift;
  root: Collection;
  kitName: (name: JSXName) => string | null;
  report: <N extends Node>(path: ASTPath<N>, why: string) => void;
}

export function kitTransform(
  rewrite: (context: KitTransformContext) => boolean,
): (file: FileInfo, api: API) => string {
  return (file, api) => {
    const j = api.jscodeshift;
    const root = j(file.source);
    const changed = rewrite({
      j,
      root,
      kitName: kitElementName(j, root),
      report: (path, why) =>
        api.report(`line ${path.node.loc?.start.line ?? "?"}: ${why}; rewrite it by hand`),
    });
    return changed ? root.toSource() : file.source;
  };
}

function kitElementName(j: JSCodeshift, root: Collection): (name: JSXName) => string | null {
  const imported = new Map<string, string | null>();
  root.find(j.ImportDeclaration, { source: { value: KIT } }).forEach((path) => {
    for (const specifier of path.node.specifiers ?? []) {
      const local = specifier.local?.name;
      if (typeof local !== "string") continue;
      if (specifier.type === "ImportNamespaceSpecifier") imported.set(local, null);
      else if (specifier.type === "ImportSpecifier" && specifier.imported.type === "Identifier") {
        imported.set(local, specifier.imported.name);
      }
    }
  });

  return (name) => {
    const [local, ...members] = nameParts(name);
    if (local === undefined || !imported.has(local)) return null;
    const exported = imported.get(local);
    const parts = exported == null ? members : [exported, ...members];
    return parts.length > 0 ? parts.join(".") : null;
  };
}

function nameParts(name: JSXName): string[] {
  if (name.type === "JSXIdentifier") return [name.name];
  if (name.type === "JSXMemberExpression") return [...nameParts(name.object), name.property.name];
  return [];
}

export const isLayoutWhitespace = (child: JSXChild): boolean =>
  child.type === "JSXText" && /^[ \t\r\n]*$/.test(child.value);

export function attributeName(attribute: Attribute): string | undefined {
  return attribute.type === "JSXAttribute" && typeof attribute.name.name === "string"
    ? attribute.name.name
    : undefined;
}

export const findAttribute = (attributes: Attribute[], name: string) =>
  attributes.find((attribute): attribute is JSXAttribute => attributeName(attribute) === name);

export function literalBoolean(attribute: JSXAttribute): boolean | undefined {
  const { value } = attribute;
  if (value == null) return true;
  return value.type === "JSXExpressionContainer" && value.expression.type === "BooleanLiteral"
    ? value.expression.value
    : undefined;
}

export function selfClose(element: JSXElement): void {
  element.children = [];
  element.openingElement.selfClosing = true;
  element.closingElement = null;
}
