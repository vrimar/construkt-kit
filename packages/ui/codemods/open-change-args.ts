import type {
  API,
  ASTPath,
  ArrowFunctionExpression,
  FunctionExpression,
  Identifier,
  JSXOpeningElement,
} from "jscodeshift";

import { attributeName, kitTransform } from "./jsx";

export const parser = "tsx";

interface Callback {
  /** The key the value used to be read from. */
  key: string;
  /** Whether the callback takes the rest of the old object as a second `details` argument. */
  details: boolean;
  /** The callback's name now, where it changed. */
  rename?: string | undefined;
}

const valueOnly = (key: string): Callback => ({ key, details: false });
const withDetails = (key: string): Callback => ({ key, details: true });
const renamedTo = (rename: string, callback: Callback): Callback => ({ ...callback, rename });

const OPEN_CHANGE = { onOpenChange: withDetails("open") };

const TREE_LOADING = {
  loadChildren: withDetails("node"),
  onLoadChildrenComplete: valueOnly("collection"),
  onRenameComplete: withDetails("value"),
};

const CHECKED_CHANGE = { onCheckedChange: valueOnly("checked") };

const VALUE_CHANGE = { onValueChange: valueOnly("value") };

const COLOR_PICKER = {
  ...OPEN_CHANGE,
  onValueChange: withDetails("value"),
  onValueChangeEnd: withDetails("value"),
  onFormatChange: valueOnly("format"),
};

/** For each migrated component, the callbacks that take the value itself instead of an object. */
const MIGRATED: Record<string, Record<string, Callback>> = {
  "Accordion.Root": VALUE_CHANGE,
  "ActionBar.Root": OPEN_CHANGE,
  "Avatar.Root": { onStatusChange: valueOnly("status") },
  "Carousel.Root": { onPageChange: renamedTo("onValueChange", valueOnly("page")) },
  Checkbox: CHECKED_CHANGE,
  "Checkbox.Root": CHECKED_CHANGE,
  CheckboxCard: CHECKED_CHANGE,
  "Clipboard.Root": { onStatusChange: valueOnly("copied") },
  "Collapsible.Root": OPEN_CHANGE,
  ColorPicker: COLOR_PICKER,
  "ColorPicker.Root": COLOR_PICKER,
  "Combobox.Root": {
    ...OPEN_CHANGE,
    onValueChange: valueOnly("value"),
    onInputValueChange: withDetails("inputValue"),
    onHighlightChange: valueOnly("highlightedValue"),
  },
  "CommandPalette.Root": OPEN_CHANGE,
  ConfirmPopover: OPEN_CHANGE,
  "Dialog.Root": OPEN_CHANGE,
  "Drawer.Root": { ...OPEN_CHANGE, onSnapPointChange: valueOnly("snapPoint") },
  "Editable.Root": {
    onValueChange: valueOnly("value"),
    onValueCommit: valueOnly("value"),
    onValueRevert: valueOnly("value"),
    onEditChange: renamedTo("onEditingChange", withDetails("edit")),
  },
  "FileUpload.Root": {
    onFileChange: renamedTo("onValueChange", withDetails("acceptedFiles")),
    onFileAccept: renamedTo("onValueChange", valueOnly("files")),
    onFileReject: valueOnly("files"),
  },
  "HoverCard.Root": OPEN_CHANGE,
  InfoTip: OPEN_CHANGE,
  "Listbox.Root": { onValueChange: valueOnly("value") },
  "Menu.Root": {
    ...OPEN_CHANGE,
    onSelect: valueOnly("value"),
    onHighlightChange: valueOnly("highlightedValue"),
  },
  "Menu.RadioItemGroup": { onValueChange: valueOnly("value") },
  "Menu.SegmentGroup": { onValueChange: valueOnly("value") },
  "Pagination.Root": { onPageChange: renamedTo("onValueChange", withDetails("page")) },
  "NumberInput.Root": {
    onValueChange: withDetails("value"),
    onValueCommit: withDetails("value"),
    onValueInvalid: withDetails("value"),
    onFocusChange: withDetails("focused"),
  },
  "PinInput.Root": {
    onValueChange: withDetails("value"),
    onValueComplete: withDetails("value"),
    onValueInvalid: withDetails("value"),
  },
  "Popover.Root": OPEN_CHANGE,
  PromptPopover: OPEN_CHANGE,
  RadioGroup: VALUE_CHANGE,
  "RadioCard.Root": VALUE_CHANGE,
  "RatingGroup.Root": {
    onValueChange: valueOnly("value"),
    onHoverChange: valueOnly("hoveredValue"),
  },
  "SegmentGroup.Root": VALUE_CHANGE,
  "Sheet.Root": { ...OPEN_CHANGE, onSnapPointChange: valueOnly("snapPoint") },
  Slider: {
    onValueChange: valueOnly("value"),
    onValueChangeEnd: valueOnly("value"),
    onFocusChange: withDetails("focusedIndex"),
  },
  Switch: CHECKED_CHANGE,
  "Tabs.Root": VALUE_CHANGE,
  "TagsInput.Root": {
    onValueChange: valueOnly("value"),
    onInputValueChange: valueOnly("inputValue"),
    onHighlightChange: valueOnly("highlightedValue"),
    onValueInvalid: valueOnly("reason"),
  },
  "ToggleGroup.Root": VALUE_CHANGE,
  ToggleTip: OPEN_CHANGE,
  Tooltip: OPEN_CHANGE,
  TreeSelectList: TREE_LOADING,
  "TreeView.Root": {
    ...TREE_LOADING,
    onExpandedChange: withDetails("expandedValue"),
    onSelectionChange: withDetails("selectedValue"),
    onCheckedChange: valueOnly("checkedValue"),
  },
};

/** For each migrated component, the props that only changed their name. */
const RENAMED: Record<string, Record<string, string>> = {
  "Carousel.Root": { page: "value", defaultPage: "defaultValue", padding: "peek" },
  "Editable.Root": { edit: "editing", defaultEdit: "defaultEditing" },
  "FileUpload.Root": { acceptedFiles: "value", defaultAcceptedFiles: "defaultValue" },
  FormFileUpload: { acceptedFiles: "value", defaultAcceptedFiles: "defaultValue" },
  "Pagination.Root": { page: "value", defaultPage: "defaultValue" },
  "PinInput.Root": { mask: "masked" },
  Portal: { container: "target" },
};

const renamedProp = (element: string, prop: string): string =>
  MIGRATED[element]?.[prop]?.rename ?? RENAMED[element]?.[prop] ?? prop;

/**
 * Rewrites `onOpenChange={({ open }) => …}` and `onOpenChange={(e) => … e.open …}` on the kit's
 * migrated overlays to `onOpenChange={(open) => …}`, and the value callbacks of Menu, Listbox,
 * Combobox, the drawers' snap points, the trees, the color picker and the form controls the same
 * way. Where the callback takes a `details` argument, the other keys move to it:
 * `({ inputValue, reason }) =>` becomes `(inputValue, { reason }) =>`. Props and callbacks that
 * changed their name, such as Pagination's `page` and `onPageChange`, take the new one. Where the
 * handler or the code around it already uses the key's name for something else, the value is named
 * `next` (or `nextOpen`, …) instead, so the rewrite reads the same variables. A handler passed by
 * reference, one that uses its argument any other way, or a rename onto a prop the element would then have twice, is left as it
 * is and reported with its file and line. Only elements imported from `@construkt-kit/ui`, under
 * any name, are rewritten.
 */
export default kitTransform(({ j, root, kitName, report }) => {
  let changed = false;

  root.find(j.JSXAttribute).forEach((path) => {
    const opening: JSXOpeningElement = path.parent.node;
    if (opening.type !== "JSXOpeningElement" || path.node.name.type !== "JSXIdentifier") return;
    const name = kitName(opening.name);
    if (name === null) return;
    const propName = path.node.name;
    const prop = propName.name;
    const callback = MIGRATED[name]?.[prop];
    const target = renamedProp(name, prop);
    if (callback === undefined && target === prop) return;
    const collides = opening.attributes?.some((attribute) => {
      const other = attributeName(attribute);
      return attribute !== path.node && other !== undefined && renamedProp(name, other) === target;
    });
    if (target !== prop && collides) {
      report(path, `${prop} would become a second \`${target}\``);
      return;
    }

    if (callback !== undefined) {
      const value = path.node.value;
      const handler = value?.type === "JSXExpressionContainer" ? value.expression : null;
      if (handler?.type !== "ArrowFunctionExpression" && handler?.type !== "FunctionExpression") {
        report(path, `${prop} is not an inline function`);
        return;
      }
      if (!rewriteHandler(j, handler, callback, path.scope as Scope | null)) {
        report(path, `${prop} reads more than \`${callback.key}\` from its argument`);
        return;
      }
    }
    propName.name = target;
    changed = true;
  });

  return changed;
});

interface Scope {
  lookup: (name: string) => unknown;
}

function rewriteHandler(
  j: API["jscodeshift"],
  handler: ArrowFunctionExpression | FunctionExpression,
  { key, details }: Callback,
  scope: Scope | null,
): boolean {
  const [param] = handler.params;
  if (param === undefined) return true;

  if (param.type === "ObjectPattern") {
    let name: string | undefined;
    const rest = param.properties.filter((property) => {
      const own =
        (property.type === "ObjectProperty" || property.type === "Property") &&
        property.key.type === "Identifier" &&
        property.key.name === key;
      if (own && property.value.type === "Identifier") name = property.value.name;
      return !own;
    });
    if (rest.length === param.properties.length - 1 && name === undefined) return false;
    if (rest.length > 0 && !details) return false;
    handler.params[0] = j.identifier(name ?? `_${key}`);
    if (rest.length > 0) handler.params[1] = j.objectPattern(rest);
    return true;
  }

  if (param.type !== "Identifier") return false;
  const argument = param.name;
  const uses = j(handler.body).find(j.Identifier, { name: argument });
  const memberReads = j(handler.body).find(j.MemberExpression, {
    object: { type: "Identifier", name: argument },
    computed: false,
  });
  const reads = memberReads.filter(
    (path) => path.node.property.type === "Identifier" && path.node.property.name === key,
  );
  const others = memberReads.length - reads.length;
  if (uses.length !== memberReads.length || (others > 0 && !details)) return false;
  const name = freeName(j, handler, key, scope);
  reads.replaceWith(() => j.identifier(name));
  handler.params[0] = j.identifier(name);
  if (others > 0) handler.params[1] = j.identifier(argument);
  return true;
}

function freeName(
  j: API["jscodeshift"],
  handler: ArrowFunctionExpression | FunctionExpression,
  key: string,
  scope: Scope | null,
): string {
  const referenced = new Set(
    j(handler.body)
      .find(j.Identifier)
      .filter((path) => !isPropertyName(path))
      .nodes()
      .map((node) => node.name),
  );
  const taken = (name: string) => referenced.has(name) || scope?.lookup(name) != null;
  const suffix = key.charAt(0).toUpperCase() + key.slice(1);
  const name = [key, "next", `next${suffix}`].find((candidate) => !taken(candidate));
  if (name !== undefined) return name;
  let index = 2;
  while (taken(`next${suffix}${index}`)) index += 1;
  return `next${suffix}${index}`;
}

function isPropertyName(path: ASTPath<Identifier>): boolean {
  const parent = path.parent?.node;
  if (parent?.type === "MemberExpression") return !parent.computed && parent.property === path.node;
  if (parent?.type === "ObjectProperty" || parent?.type === "Property") {
    return !parent.computed && !parent.shorthand && parent.key === path.node;
  }
  return false;
}
