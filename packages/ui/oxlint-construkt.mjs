import { isCssProperty } from "./styled-system/jsx/is-valid-prop.js";

const PASCAL_CASE = /^[A-Z]/;
const PROPS_TYPE = /Props$/;
const STYLE_PROPS = new Set(["colorPalette"]);
const COMPONENT_TYPES = new Set(["FC", "FunctionComponent", "ComponentType"]);
const UTILITY_TYPES = new Set([
  "Omit",
  "Pick",
  "Partial",
  "Readonly",
  "Required",
  "PropsWithChildren",
  "WithRef",
  ...COMPONENT_TYPES,
]);
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

const typeReferenceName = ({ typeName }) =>
  typeName.type === "TSQualifiedName" ? typeName.right.name : typeName.name;

function isComponentVariable(annotation) {
  const id = annotation.parent;
  const type = annotation.typeAnnotation;
  return (
    id.type === "Identifier" &&
    id.parent.type === "VariableDeclarator" &&
    PASCAL_CASE.test(id.name) &&
    type.type === "TSTypeReference" &&
    COMPONENT_TYPES.has(typeReferenceName(type))
  );
}

const isComponentAnnotation = (annotation) =>
  isComponentParam(annotation) || isComponentVariable(annotation);

const heritageName = ({ expression }) =>
  expression.type === "MemberExpression" ? expression.property.name : expression.name;

const isUtilityName = (name) => typeof name === "string" && UTILITY_TYPES.has(name);
const isUtilityType = (node) =>
  (node.type === "TSTypeReference" && isUtilityName(typeReferenceName(node))) ||
  (node.type === "TSInterfaceHeritage" && isUtilityName(heritageName(node)));

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
  if (type.type !== "TSTypeReference") return [];
  if (isUtilityType(type)) {
    return type.typeArguments ? referencedTypes(type.typeArguments.params[0]) : [];
  }
  return type.typeName.type === "Identifier" ? [type.typeName.name] : [];
}

function heritageTypes(heritage) {
  const { expression, typeArguments } = heritage;
  if (isUtilityType(heritage)) {
    return typeArguments ? referencedTypes(typeArguments.params[0]) : [];
  }
  return expression.type === "Identifier" ? [expression.name] : [];
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

    const checkMember = (node) => {
      const name = node.computed ? null : propName(node.key);
      if (!name || STYLE_PROPS.has(name) || !isCssProperty(name)) return;
      const owner =
        node.parent.type === "TSInterfaceBody" ? node.parent.parent : typeOwner(node.parent);
      if (owner.type === "TSTypeAnnotation") {
        if (isComponentAnnotation(owner)) report(node.key, name);
      } else if (
        owner.type === "TSInterfaceDeclaration" ||
        owner.type === "TSTypeAliasDeclaration"
      ) {
        members.push({ key: node.key, name, owner: owner.id.name });
      }
    };

    return {
      TSInterfaceDeclaration(node) {
        declare(node.id.name, node.extends.flatMap(heritageTypes));
      },
      TSTypeAliasDeclaration(node) {
        declare(node.id.name, referencedTypes(node.typeAnnotation));
      },
      TSTypeAnnotation(node) {
        if (!isComponentAnnotation(node)) return;
        for (const name of referencedTypes(node.typeAnnotation)) componentTypes.add(name);
      },
      TSPropertySignature: checkMember,
      TSMethodSignature: checkMember,
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
