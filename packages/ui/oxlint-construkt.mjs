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

function isComponentElement(name) {
  if (name.type === "JSXMemberExpression") return true;
  return name.type === "JSXIdentifier" && PASCAL_CASE.test(name.name);
}

const isStyleAttribute = (name) =>
  name === "css" || name.endsWith("Css") || (!STYLE_PROPS.has(name) && isCssProperty(name));

function literalKeys(node) {
  switch (node.type) {
    case "ObjectExpression":
      return node.properties.flatMap((property) => {
        if (property.type === "SpreadElement") return literalKeys(property.argument);
        return property.computed ? [] : [property.key];
      });
    case "ConditionalExpression":
      return [...literalKeys(node.consequent), ...literalKeys(node.alternate)];
    case "LogicalExpression":
      return [...literalKeys(node.left), ...literalKeys(node.right)];
    case "ParenthesizedExpression":
    case "TSAsExpression":
    case "TSSatisfiesExpression":
    case "TSNonNullExpression":
      return literalKeys(node.expression);
    default:
      return [];
  }
}

const noLiteralStyleProps = {
  meta: {
    type: "problem",
    messages: {
      styleProp:
        '"{{name}}" styles through Panda, and no Panda build extracts this package\'s source, so it ships a class with no CSS. Style through the recipe, inline geometry or CSS variables.',
    },
  },
  create(context) {
    const check = (node, name) => {
      if (name !== null && isStyleAttribute(name)) {
        context.report({ node, messageId: "styleProp", data: { name } });
      }
    };

    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || !isComponentElement(node.parent.name)) return;
        check(node.name, node.name.name);
      },
      JSXSpreadAttribute(node) {
        if (!isComponentElement(node.parent.name)) return;
        for (const key of literalKeys(node.argument)) check(key, propName(key));
      },
    };
  },
};

function keyOf(property) {
  return property.type === "Property" && !property.computed ? propName(property.key) : null;
}

function findProperty(object, name) {
  if (object?.type !== "ObjectExpression") return null;
  return object.properties.find((property) => keyOf(property) === name) ?? null;
}

const storyNoPlay = {
  meta: {
    type: "problem",
    messages: {
      play: "Stories hold states only. Drive interactions from a behaviour spec (`*.spec.ts`) that uses real input.",
    },
  },
  create(context) {
    return {
      Property(node) {
        if (keyOf(node) === "play") context.report({ node: node.key, messageId: "play" });
      },
    };
  },
};

function isNamedRuleDisable(element) {
  if (element?.type !== "ObjectExpression" || element.properties.length !== 2) return false;
  const id = findProperty(element, "id");
  const enabled = findProperty(element, "enabled");
  return (
    id?.value.type === "Literal" &&
    typeof id.value.value === "string" &&
    enabled?.value.type === "Literal" &&
    enabled.value.value === false
  );
}

function isAllowedA11y(value) {
  if (value.type !== "ObjectExpression" || value.properties.length !== 1) return false;
  const config = findProperty(value, "config");
  if (config?.value.type !== "ObjectExpression" || config.value.properties.length !== 1)
    return false;
  const rules = findProperty(config.value, "rules");
  return rules?.value.type === "ArrayExpression" && rules.value.elements.every(isNamedRuleDisable);
}

const storyA11yOptOut = {
  meta: {
    type: "problem",
    messages: {
      shape:
        'The only accessibility opt-out is `parameters: { a11y: { config: { rules: [{ id: "<axe rule>", enabled: false }] } } }` for a confirmed false positive.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (keyOf(node) !== "a11y") return;
        const owner = node.parent.parent;
        const inParameters = owner?.type === "Property" && keyOf(owner) === "parameters";
        if (!inParameters || !isAllowedA11y(node.value)) {
          context.report({ node: node.key, messageId: "shape" });
        }
      },
    };
  },
};

function hasTag(object, tag) {
  const tags = findProperty(object, "tags");
  return (
    tags?.value.type === "ArrayExpression" &&
    tags.value.elements.some((element) => element?.type === "Literal" && element.value === tag)
  );
}

const storyViewportTag = {
  meta: {
    type: "problem",
    messages: {
      tag: 'A story that fixes a phone viewport must also be tagged "phone-only", so the desktop run skips it.',
    },
  },
  create(context) {
    return {
      ObjectExpression(node) {
        const globals = findProperty(node, "globals");
        const viewport = findProperty(globals?.value, "viewport");
        const value = findProperty(viewport?.value, "value");
        if (value?.value.type !== "Literal" || !/^mobile/.test(String(value.value.value))) return;
        if (!hasTag(node, "phone-only")) context.report({ node: globals.key, messageId: "tag" });
      },
    };
  },
};

const SPEC_ACTIONS = new Set([
  "press",
  "click",
  "dblclick",
  "tap",
  "fill",
  "type",
  "hover",
  "check",
  "uncheck",
  "selectOption",
  "dragTo",
  "resizeTo",
]);

function calleeName(callee) {
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && !callee.computed) return callee.property.name;
  return null;
}

function rootIdentifier(node) {
  let current = node;
  while (current.type === "MemberExpression" || current.type === "CallExpression") {
    current = current.type === "MemberExpression" ? current.object : current.callee;
  }
  return current.type === "Identifier" ? current.name : null;
}

const specAsserts = {
  meta: {
    type: "problem",
    messages: {
      assert:
        "A behaviour spec must act on the page (press, type, resize…) and then assert with expect.",
    },
  },
  create(context) {
    const tests = [];
    return {
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "test") {
          const body = node.arguments.at(-1);
          if (body && FUNCTIONS.has(body.type))
            tests.push({ node, body, actions: [], expects: [] });
          return;
        }
        const owner = tests.findLast(
          ({ body }) => node.range[0] >= body.range[0] && node.range[1] <= body.range[1],
        );
        if (!owner) return;
        if (SPEC_ACTIONS.has(calleeName(node.callee)) && rootIdentifier(node.callee) !== "expect") {
          owner.actions.push(node.range[0]);
        }
        if (rootIdentifier(node.callee) === "expect") owner.expects.push(node.range[0]);
      },
      "Program:exit"() {
        for (const { node, actions, expects } of tests) {
          const firstAction = Math.min(...actions);
          if (!expects.some((position) => position > firstAction)) {
            context.report({ node: node.callee, messageId: "assert" });
          }
        }
      },
    };
  },
};

const SCREENSHOT_OPTIONS = new Set([
  "mask",
  "maxDiffPixels",
  "maxDiffPixelRatio",
  "threshold",
  "clip",
]);

const specScreenshotViaGallery = {
  meta: {
    type: "problem",
    messages: {
      matcher:
        "Compare screenshots through `gallery.expectScreenshot(name)`, which applies the suite's fixed options.",
      option:
        '"{{name}}" loosens or narrows a screenshot comparison; the suite compares whole pages exactly.',
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        const name = node.computed ? null : node.property.name;
        if (name === "toHaveScreenshot" || name === "toMatchSnapshot") {
          context.report({ node: node.property, messageId: "matcher" });
        }
      },
      Property(node) {
        const name = keyOf(node);
        if (SCREENSHOT_OPTIONS.has(name))
          context.report({ node: node.key, messageId: "option", data: { name } });
      },
    };
  },
};

export default {
  meta: { name: "construkt" },
  rules: {
    "no-literal-style-props": noLiteralStyleProps,
    "no-style-prop-name": noStylePropName,
    "spec-asserts": specAsserts,
    "spec-screenshot-via-gallery": specScreenshotViaGallery,
    "story-a11y-opt-out": storyA11yOptOut,
    "story-no-play": storyNoPlay,
    "story-viewport-tag": storyViewportTag,
  },
};
