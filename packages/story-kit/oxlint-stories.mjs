const FUNCTIONS = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);

function propName(key) {
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal" && typeof key.value === "string") return key.value;
  return null;
}

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
  "swipe",
  "fill",
  "type",
  "hover",
  "check",
  "uncheck",
  "selectOption",
  "dragTo",
  "resizeTo",
  "startDrag",
  "touchDrag",
  "signIn",
  "openPopup",
  "pickMenuItem",
  "openSelect",
  "pickOption",
  "selectSegment",
  "dismissToast",
  "hoverTooltip",
  "dropFiles",
  "setChecked",
  "scrollTree",
  "revealTreeItem",
]);

function calleeName(callee) {
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && !callee.computed) return callee.property.name;
  return null;
}

const TEST_FUNCTIONS = new Set(["test", "storyTest"]);

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
        if (node.callee.type === "Identifier" && TEST_FUNCTIONS.has(node.callee.name)) {
          const body = node.arguments.findLast((argument) => FUNCTIONS.has(argument.type));
          if (body) tests.push({ node, body, actions: [], expects: [] });
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
  meta: { name: "stories" },
  rules: {
    "a11y-opt-out": storyA11yOptOut,
    "no-play": storyNoPlay,
    "spec-asserts": specAsserts,
    "spec-screenshot-via-gallery": specScreenshotViaGallery,
    "viewport-tag": storyViewportTag,
  },
};
