import { isCssProperty } from "./styled-system/jsx/is-valid-prop.js";

const PASCAL_CASE = /^[A-Z]/;
const PROPS_TYPE = /Props$/;
const STYLE_PROPS = new Set(["colorPalette"]);
const UTILITY_TYPES = new Set(["Omit", "Pick", "Partial", "Readonly", "Required"]);
const COMBINATORS = new Set(["TSIntersectionType", "TSUnionType", "TSParenthesizedType"]);
const FUNCTIONS = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);

function propName(key) {
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal" && typeof key.value === "string") return key.value;
  return null;
}

function componentName(fn) {
  if (fn.id) return fn.id.name;
  let node = fn.parent;
  while (node.type === "CallExpression") node = node.parent;
  return node.type === "VariableDeclarator" && node.id.type === "Identifier" ? node.id.name : null;
}

function isComponentParam(annotation) {
  let param = annotation.parent;
  if (param.parent.type === "AssignmentPattern") param = param.parent;
  const fn = param.parent;
  return (
    FUNCTIONS.has(fn.type) && fn.params[0] === param && PASCAL_CASE.test(componentName(fn) ?? "")
  );
}

const isUtilityName = (name) => typeof name === "string" && UTILITY_TYPES.has(name);
const isUtilityType = (node) =>
  node.type === "TSTypeReference" && isUtilityName(node.typeName.name);

function typeOwner(node) {
  let owner = node.parent;
  while (
    COMBINATORS.has(owner.type) ||
    isUtilityType(owner) ||
    (owner.type === "TSTypeParameterInstantiation" && isUtilityType(owner.parent))
  ) {
    owner = owner.parent;
  }
  return owner;
}

function referencedTypes(type) {
  if (type.type === "TSParenthesizedType") return referencedTypes(type.typeAnnotation);
  if (COMBINATORS.has(type.type)) return type.types.flatMap(referencedTypes);
  if (type.type !== "TSTypeReference" || type.typeName.type !== "Identifier") return [];
  if (!isUtilityType(type)) return [type.typeName.name];
  return type.typeArguments ? referencedTypes(type.typeArguments.params[0]) : [];
}

function heritageTypes({ expression, typeArguments }) {
  if (expression.type !== "Identifier") return [];
  if (!isUtilityName(expression.name)) return [expression.name];
  return typeArguments ? referencedTypes(typeArguments.params[0]) : [];
}

const noStylePropName = {
  meta: {
    type: "problem",
    messages: {
      styleProp:
        '"{{name}}" is a Panda style prop: Panda extracts it as CSS from every PascalCase JSX element in consuming apps. Rename the prop.',
    },
  },
  create(context) {
    const references = new Map();
    const componentTypes = new Set();
    const members = [];

    const declare = (name, refs) =>
      references.set(name, [...(references.get(name) ?? []), ...refs]);
    const report = (key, name) =>
      context.report({ node: key, messageId: "styleProp", data: { name } });

    return {
      TSInterfaceDeclaration(node) {
        declare(node.id.name, node.extends.flatMap(heritageTypes));
      },
      TSTypeAliasDeclaration(node) {
        declare(node.id.name, referencedTypes(node.typeAnnotation));
      },
      TSTypeAnnotation(node) {
        if (!isComponentParam(node)) return;
        for (const name of referencedTypes(node.typeAnnotation)) componentTypes.add(name);
      },
      TSPropertySignature(node) {
        const name = node.computed ? null : propName(node.key);
        if (!name || STYLE_PROPS.has(name) || !isCssProperty(name)) return;
        const owner =
          node.parent.type === "TSInterfaceBody" ? node.parent.parent : typeOwner(node.parent);
        if (owner.type === "TSTypeAnnotation") {
          if (isComponentParam(owner)) report(node.key, name);
        } else if (
          owner.type === "TSInterfaceDeclaration" ||
          owner.type === "TSTypeAliasDeclaration"
        ) {
          members.push({ key: node.key, name, owner: owner.id.name });
        }
      },
      "Program:exit"() {
        const propsTypes = new Set();
        const visit = (name) => {
          if (propsTypes.has(name) || !references.has(name)) return;
          propsTypes.add(name);
          for (const ref of references.get(name)) visit(ref);
        };
        for (const name of references.keys()) if (PROPS_TYPE.test(name)) visit(name);
        for (const name of componentTypes) visit(name);
        for (const { key, name, owner } of members) if (propsTypes.has(owner)) report(key, name);
      },
    };
  },
};

export default { meta: { name: "construkt" }, rules: { "no-style-prop-name": noStylePropName } };
