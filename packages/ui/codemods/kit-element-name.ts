import type {
  Collection,
  JSCodeshift,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
} from "jscodeshift";

const KIT = "@construkt-kit/ui";

type JSXName = JSXIdentifier | JSXMemberExpression | JSXNamespacedName;

export function kitElementName(j: JSCodeshift, root: Collection): (name: JSXName) => string | null {
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
