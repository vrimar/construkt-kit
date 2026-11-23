import type { JSXAttribute } from "jscodeshift";

import { type Attribute, findAttribute, kitTransform, literalBoolean } from "./jsx";

export const parser = "tsx";

const OVERLAY_ROOTS = new Set([
  "ColorPicker",
  "ColorPicker.Root",
  "Combobox.Root",
  "CommandPalette.Root",
  "ConfirmPopover",
  "Dialog.Root",
  "Drawer.Root",
  "HoverCard.Root",
  "InfoTip",
  "Menu.Root",
  "Popover.Root",
  "PromptPopover",
  "Sheet.Root",
  "ToggleTip",
  "Tooltip",
  "TreeView.Root",
]);

const DISCLOSURE_ROOTS = new Set(["Accordion.Root", "Collapsible.Root", "Tabs.Root"]);

const UNPORTALLED = new Set([
  "ColorPicker",
  "ColorPicker.Content",
  "Combobox.Content",
  "ConfirmPopover",
  "DatePicker",
  "DatePickerSelect",
  "Dialog.Content",
  "Drawer.Content",
  "HoverCard.Content",
  "InfoTip",
  "Menu.Content",
  "Popover.Content",
  "PromptPopover",
  "Sheet.Content",
  "ToggleTip",
  "Tooltip",
]);

const PLACED = new Set([
  "ColorPicker",
  "ColorPicker.Root",
  "Combobox.Root",
  "ConfirmPopover",
  "DatePicker",
  "DatePickerSelect",
  "HoverCard.Root",
  "InfoTip",
  "Menu.Root",
  "Popover.Root",
  "PromptPopover",
  "ToggleTip",
  "Tooltip",
]);

const ANCHORED = new Set([
  "ConfirmPopover",
  "Menu.Root",
  "Popover.Root",
  "PromptPopover",
  "Tooltip",
]);

/**
 * Drops the overlay props the kit removed with Ark and rewrites the ones it replaced:
 * `lazyMount` and `unmountOnExit` go from overlays and from the disclosure roots where the kit's
 * panels already unmount, `portalled` and `portalRef` go from content that renders in the top
 * layer, `positioning={{ placement }}` becomes `placement`, and `positioning.getAnchorRect`
 * becomes `anchor={{ getBoundingClientRect }}`. Anything else, such as a dynamic value or another
 * `positioning` key, is left as it is and reported with its line. Only elements imported from
 * `@construkt-kit/ui`, under any name, are rewritten.
 */
export default kitTransform(({ j, root, kitName, report }) => {
  let changed = false;

  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = kitName(path.node.name);
    if (name === null) return;
    const attributes = path.node.attributes ?? [];
    const remove = new Set<Attribute>();
    const add: JSXAttribute[] = [];
    const find = (prop: string) => findAttribute(attributes, prop);

    const mount = ["lazyMount", "unmountOnExit"].map((prop) => {
      const attribute = find(prop);
      return { prop, attribute, value: attribute && literalBoolean(attribute) };
    });
    const [lazy, unmount] = mount;
    if (OVERLAY_ROOTS.has(name)) {
      for (const { prop, attribute, value } of mount) {
        if (!attribute) continue;
        if (value === true) remove.add(attribute);
        else report(path, `${prop} isn't \`true\`, but the kit mounts an overlay only while open`);
      }
    } else if (DISCLOSURE_ROOTS.has(name) && (lazy?.attribute || unmount?.attribute)) {
      const values = mount.flatMap(({ attribute, value }) => (attribute ? [value] : []));
      if (values.some((value) => value !== true)) {
        report(
          path,
          "lazyMount or unmountOnExit isn't `true`; give panels that stay `keepMounted`",
        );
      } else if (lazy?.attribute && !unmount?.attribute) {
        report(path, "lazyMount without unmountOnExit kept a shown panel; give it `keepMounted`");
      } else {
        for (const { attribute } of mount) if (attribute) remove.add(attribute);
      }
    }

    if (UNPORTALLED.has(name)) {
      for (const prop of ["portalled", "portalRef"]) {
        const attribute = find(prop);
        if (attribute) remove.add(attribute);
      }
    }

    const positioning = find("positioning");
    if (positioning && PLACED.has(name)) {
      const value =
        positioning.value?.type === "JSXExpressionContainer" ? positioning.value.expression : null;
      if (value?.type !== "ObjectExpression") {
        report(path, "positioning isn't an object literal");
      } else {
        const rewritten: JSXAttribute[] = [];
        let why: string | undefined;
        for (const property of value.properties) {
          if (
            (property.type !== "ObjectProperty" && property.type !== "Property") ||
            property.computed ||
            property.key.type !== "Identifier"
          ) {
            why = "positioning spreads or computes a key";
            continue;
          }
          const key = property.key.name;
          if ((key === "placement" || key === "getAnchorRect") && find(rewrittenProp(key))) {
            why = `\`${rewrittenProp(key)}\` would be given twice`;
          } else if (key === "placement") {
            const placement = property.value;
            rewritten.push(
              j.jsxAttribute(
                j.jsxIdentifier("placement"),
                placement.type === "StringLiteral"
                  ? j.stringLiteral(placement.value)
                  : j.jsxExpressionContainer(placement as never),
              ),
            );
          } else if (key === "getAnchorRect" && ANCHORED.has(name)) {
            const getAnchorRect = property.value;
            const takesNothing =
              (getAnchorRect.type === "ArrowFunctionExpression" ||
                getAnchorRect.type === "FunctionExpression") &&
              getAnchorRect.params.length === 0;
            if (!takesNothing) {
              why = "positioning.getAnchorRect reads its argument";
              continue;
            }
            rewritten.push(
              j.jsxAttribute(
                j.jsxIdentifier("anchor"),
                j.jsxExpressionContainer(
                  j.objectExpression([
                    j.objectProperty(j.identifier("getBoundingClientRect"), getAnchorRect),
                  ]),
                ),
              ),
            );
          } else {
            why = `positioning.${key} has no replacement here`;
          }
        }
        if (why) {
          report(path, why);
        } else {
          remove.add(positioning);
          add.push(...rewritten);
        }
      }
    }

    if (remove.size === 0) return;
    const kept = (list: Attribute[]) => list.filter((attribute) => !remove.has(attribute));
    const at = positioning ? attributes.indexOf(positioning) : attributes.length;
    path.node.attributes = [
      ...kept(attributes.slice(0, at)),
      ...add,
      ...kept(attributes.slice(at)),
    ];
    changed = true;
  });

  return changed;
});

const rewrittenProp = (key: "placement" | "getAnchorRect") =>
  key === "placement" ? "placement" : "anchor";
