import type { KeyboardEvent } from "react";

import { isComposingEvent, isEditableTarget } from "../../foundations/dom";
import {
  type NavigableList,
  Typeahead,
  getFirstEnabledIndex,
  getLastEnabledIndex,
  getNextIndex,
} from "../../primitives/composite";
import { Store } from "../../primitives/store";
import { TreeCollection, getToggledLeafValues } from "./treeCollection";

/** A row the tree shows: a node whose ancestors are all expanded. */
export interface VisibleNode<T> {
  node: T;
  indexPath: number[];
  value: string;
  disabled: boolean;
}

export interface TreeViewState {
  focusedValue: string | null;
  renamingValue: string | null;
}

export interface TabStopArg {
  value: string;
  /** The row that holds the tab stop while no shown row has focus. */
  first: string | null;
  visible: ReadonlySet<string>;
}

export const selectFocused = (state: TreeViewState): string | null => state.focusedValue;

export const selectIsTabStop = (state: TreeViewState, { value, first, visible }: TabStopArg) =>
  state.focusedValue != null && visible.has(state.focusedValue)
    ? state.focusedValue === value
    : first === value;

export const selectIsRenaming = (state: TreeViewState, value: string): boolean =>
  state.renamingValue === value;

export interface PressModifiers {
  /** Ctrl or ⌘: toggles the node in a multiple selection. */
  toggle: boolean;
  /** Shift: extends a multiple selection to the node. */
  range: boolean;
}

const NO_MODIFIERS: PressModifiers = { toggle: false, range: false };

export interface TreeViewNodeConfig {
  collection: TreeCollection<unknown>;
  visibleNodes: readonly VisibleNode<unknown>[];
  expandedValue: readonly string[];
  selectedValue: readonly string[];
  checkedValue: readonly string[];
  multiple: boolean;
  expandOnClick: boolean;
  typeahead: boolean;
  rtl: boolean;
  canRename: ((node: unknown, indexPath: number[]) => boolean) | undefined;
  onExpandedChange: (value: string[]) => void;
  onSelectionChange: (value: string[]) => void;
  onCheckedChange: (value: string[]) => void;
  /** Whether expanding the branch first loads its children. */
  needsLoad: (value: string) => boolean;
  /** Loads the branches, calling back each one that loaded. */
  load: (values: string[], onLoaded: (value: string) => void) => void;
  onRenameComplete: ((value: string, label: string, indexPath: number[]) => void) | undefined;
}

const IDLE: TreeViewNodeConfig = {
  collection: new TreeCollection<unknown>([], { getNodeValue: String, getNodeLabel: String }),
  visibleNodes: [],
  expandedValue: [],
  selectedValue: [],
  checkedValue: [],
  multiple: false,
  expandOnClick: true,
  typeahead: true,
  rtl: false,
  canRename: undefined,
  onExpandedChange: () => {},
  onSelectionChange: () => {},
  onCheckedChange: () => {},
  needsLoad: () => false,
  load: () => {},
  onRenameComplete: undefined,
};

const isModifierKey = (event: KeyboardEvent) => event.ctrlKey || event.altKey || event.metaKey;

const isAnchor = (element: Element) => element.matches("a[href]");

const uniq = (values: readonly string[]) => Array.from(new Set(values));

const sameValues = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value, i) => value === b[i]);

const isWithin = (ancestor: readonly number[], indexPath: readonly number[]) =>
  indexPath.length > ancestor.length && ancestor.every((index, i) => indexPath[i] === index);

/**
 * The focus, keyboard, typeahead, selection and expansion of one tree. Rows register their element
 * by node value; the root hands it the latest state after every render.
 */
export class TreeViewNode {
  readonly store = new Store<TreeViewState>({ focusedValue: null, renamingValue: null });
  private config = IDLE;
  private readonly typeaheadSession = new Typeahead();
  private readonly rows = new Map<string, HTMLElement>();
  private readonly rowValues = new WeakMap<HTMLElement, string>();
  private scroller: ((index: number) => void) | undefined;
  private focusFrame = 0;
  // Written through on every change, so changes in one tick build on each other.
  private expanded: readonly string[] = [];
  private selected: readonly string[] = [];
  private checked: readonly string[] = [];

  constructor(readonly id: string) {}

  update(config: TreeViewNodeConfig): void {
    this.config = config;
    this.expanded = config.expandedValue;
    this.selected = config.selectedValue;
    this.checked = config.checkedValue;
  }

  dispose(): void {
    cancelAnimationFrame(this.focusFrame);
    this.typeaheadSession.reset();
  }

  nodeId(value: string): string {
    return `${this.id}:node:${value}`;
  }

  registerRow(value: string, element: HTMLElement): () => void {
    this.rows.set(value, element);
    this.rowValues.set(element, value);
    return () => {
      if (this.rows.get(value) === element) this.rows.delete(value);
    };
  }

  /** Lets a virtual list scroll a row that isn't rendered into view before it takes focus. */
  setScroller(scroller: ((index: number) => void) | undefined): void {
    this.scroller = scroller;
  }

  get focusedValue(): string | null {
    return this.store.state.focusedValue;
  }

  private indexOf(value: string): number {
    return this.config.visibleNodes.findIndex((entry) => entry.value === value);
  }

  private get list(): NavigableList {
    const { visibleNodes } = this.config;
    return { length: visibleNodes.length, isDisabled: (index) => visibleNodes[index].disabled };
  }

  /** Scrolls the row of `value` into view, rendering it first in a virtual list, and focuses it. */
  focus(value: string | null | undefined): void {
    if (value == null) return;
    cancelAnimationFrame(this.focusFrame);
    const index = this.indexOf(value);
    if (this.scroller && index !== -1) {
      this.scroller(index);
      this.focusFrame = requestAnimationFrame(() => this.rows.get(value)?.focus());
      return;
    }
    this.rows.get(value)?.focus();
  }

  /** Scrolls the row of `value` into view, rendering it first in a virtual list. */
  scrollTo(value: string): void {
    const index = this.indexOf(value);
    if (this.scroller && index !== -1) this.scroller(index);
    else this.rows.get(value)?.scrollIntoView({ block: "nearest" });
  }

  /** Focuses the row of `value` where it is, without scrolling. */
  focusRow(value: string): void {
    this.rows.get(value)?.focus({ preventScroll: true });
  }

  private focusIndex(index: number) {
    this.focus(this.config.visibleNodes[index]?.value);
  }

  onRowFocus(value: string): void {
    this.store.set("focusedValue", value);
  }

  private setExpanded(next: readonly string[]) {
    if (sameValues(next, this.expanded)) return;
    this.expanded = next;
    this.config.onExpandedChange([...next]);
  }

  private setSelected(next: readonly string[]) {
    if (sameValues(next, this.selected)) return;
    this.selected = next;
    this.config.onSelectionChange([...next]);
  }

  /** Expands the branches, loading the children of those that need it before they open. */
  expand(values: readonly string[]): void {
    const opening = values.filter((value) => !this.expanded.includes(value));
    if (opening.length === 0) return;
    const deferred = opening.filter((value) => this.config.needsLoad(value));
    this.config.load(deferred, (value) => this.expand([value]));
    const now = opening.filter((value) => !deferred.includes(value));
    if (now.length > 0) this.setExpanded(uniq([...this.expanded, ...now]));
  }

  collapse(values: readonly string[]): void {
    if (!values.some((value) => this.expanded.includes(value))) return;
    this.setExpanded(this.expanded.filter((value) => !values.includes(value)));
  }

  toggleExpanded(value: string): void {
    if (this.expanded.includes(value)) this.collapse([value]);
    else this.expand([value]);
  }

  private expandSiblings(value: string) {
    const { collection } = this.config;
    const indexPath = collection.getIndexPath(value);
    if (!indexPath) return;
    this.expand(
      collection
        .getSiblingNodes(indexPath)
        .filter((node) => collection.isBranchNode(node))
        .map((node) => collection.getNodeValue(node)),
    );
  }

  /** A click, Enter or Space on a node: selects it and, on a branch, toggles it. */
  press(value: string, isBranch: boolean, modifiers: PressModifiers = NO_MODIFIERS): void {
    const { multiple, expandOnClick } = this.config;
    if (multiple && modifiers.toggle) {
      this.setSelected(
        this.selected.includes(value)
          ? this.selected.filter((entry) => entry !== value)
          : [...this.selected, value],
      );
      return;
    }
    if (multiple && modifiers.range) {
      this.extendSelectionTo(value);
      return;
    }
    this.setSelected([value]);
    if (isBranch && expandOnClick) this.toggleExpanded(value);
  }

  private extendSelectionTo(target: string) {
    const { visibleNodes } = this.config;
    const anchor = this.selected[0] ?? visibleNodes[getFirstEnabledIndex(this.list)]?.value;
    if (anchor === undefined) return;
    const values = [anchor, target];
    let hits = 0;
    for (const { value } of visibleNodes) {
      if (hits === 1) values.push(value);
      if (value === anchor || value === target) hits += 1;
    }
    this.setSelected(uniq(values));
  }

  private extendSelectionStep(from: string, to: string) {
    const values = new Set(this.selected);
    if (values.has(from) && values.has(to)) values.delete(from);
    else if (!values.has(to)) values.add(to);
    this.setSelected(Array.from(values));
  }

  private extendSelectionToEdge(edge: "first" | "last") {
    const values = this.config.visibleNodes.map((entry) => entry.value);
    const anchor = this.selected.length > 0 ? values.indexOf(this.selected[0]) : -1;
    if (edge === "first") this.setSelected(anchor === -1 ? values : values.slice(0, anchor + 1));
    else this.setSelected(anchor === -1 ? [] : values.slice(anchor));
  }

  private selectAll() {
    const values: string[] = [];
    this.config.collection.visit({
      onEnter: (node) => {
        values.push(this.config.collection.getNodeValue(node));
      },
    });
    this.setSelected(values);
    this.focusIndex(getLastEnabledIndex(this.list));
  }

  toggleChecked(value: string, isBranch: boolean): void {
    const { collection } = this.config;
    let next: string[];
    if (isBranch) {
      const leaves = getToggledLeafValues(collection, value);
      const all = leaves.every((leaf) => this.checked.includes(leaf));
      next = all
        ? this.checked.filter((entry) => !leaves.includes(entry))
        : uniq([...this.checked, ...leaves]);
    } else {
      next = this.checked.includes(value)
        ? this.checked.filter((entry) => entry !== value)
        : [...this.checked, value];
    }
    if (sameValues(next, this.checked)) return;
    this.checked = next;
    this.config.onCheckedChange(next);
  }

  private focusParent(index: number) {
    const { visibleNodes } = this.config;
    const { indexPath } = visibleNodes[index];
    if (indexPath.length < 2) return;
    const parentPath = indexPath.slice(0, -1).join();
    for (let i = index - 1; i >= 0; i -= 1) {
      if (visibleNodes[i].indexPath.join() === parentPath) {
        this.focusIndex(i);
        return;
      }
    }
  }

  private focusFirstChild(index: number) {
    const { visibleNodes } = this.config;
    const { indexPath } = visibleNodes[index];
    for (
      let i = index + 1;
      i < visibleNodes.length && isWithin(indexPath, visibleNodes[i].indexPath);
      i += 1
    ) {
      if (!visibleNodes[i].disabled) {
        this.focusIndex(i);
        return;
      }
    }
  }

  private typeaheadKey(key: string, index: number) {
    const { visibleNodes, collection } = this.config;
    const labels = visibleNodes.map((entry) =>
      entry.disabled ? null : collection.stringifyNode(entry.node),
    );
    const match = this.typeaheadSession.match(labels, key, index);
    if (match !== -1) this.focusIndex(match);
  }

  startRename(value: string): void {
    this.store.set("renamingValue", value);
  }

  submitRename(label: string, refocus: boolean): void {
    const value = this.store.state.renamingValue;
    const trimmed = label.trim();
    if (value == null || trimmed === "") return;
    const indexPath = this.config.collection.getIndexPath(value);
    this.store.set("renamingValue", null);
    if (indexPath) this.config.onRenameComplete?.(value, trimmed, indexPath);
    if (refocus) this.focus(value);
  }

  cancelRename(): void {
    const value = this.store.state.renamingValue;
    this.store.set("renamingValue", null);
    this.focus(value);
  }

  private rowOf(target: HTMLElement, tree: HTMLElement): string | undefined {
    for (let element: HTMLElement | null = target; element; element = element.parentElement) {
      const value = this.rowValues.get(element);
      if (value !== undefined && this.rows.get(value) === element) return value;
      if (element === tree) return undefined;
    }
    return undefined;
  }

  onTreeKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.defaultPrevented || isComposingEvent(event)) return;
    const target = event.target as HTMLElement;
    if (isEditableTarget(target)) return;
    const value = this.rowOf(target, event.currentTarget);
    if (value === undefined) return;
    const { collection, visibleNodes, multiple, rtl } = this.config;
    const index = this.indexOf(value);
    const entry = visibleNodes[index];
    if (!entry) return;
    const isBranch = collection.isBranchNode(entry.node);
    const { disabled } = entry;

    let key = event.key;
    if (rtl && key === "ArrowLeft") key = "ArrowRight";
    else if (rtl && key === "ArrowRight") key = "ArrowLeft";

    switch (key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (isModifierKey(event)) return;
        event.preventDefault();
        const next = getNextIndex(this.list, index, {
          decrement: key === "ArrowUp",
          loop: false,
        });
        if (next === index) return;
        this.focusIndex(next);
        if (event.shiftKey && multiple) {
          this.extendSelectionStep(value, visibleNodes[next].value);
        }
        return;
      }
      case "ArrowLeft":
        if (isModifierKey(event) || disabled) return;
        event.preventDefault();
        if (isBranch && this.expanded.includes(value)) this.collapse([value]);
        else this.focusParent(index);
        return;
      case "ArrowRight":
        if (isModifierKey(event) || !isBranch || disabled) return;
        event.preventDefault();
        if (this.focusedValue === value && this.expanded.includes(value)) {
          this.focusFirstChild(index);
        } else {
          this.expand([value]);
        }
        return;
      case "Home":
      case "End":
        if (isModifierKey(event)) return;
        event.preventDefault();
        if (event.shiftKey && multiple)
          this.extendSelectionToEdge(key === "Home" ? "first" : "last");
        this.focusIndex(
          key === "Home" ? getFirstEnabledIndex(this.list) : getLastEnabledIndex(this.list),
        );
        return;
      case " ":
        if (disabled) return;
        if (this.typeaheadSession.typing && this.config.typeahead) {
          event.preventDefault();
          this.typeaheadKey(" ", index);
          return;
        }
        this.onEnter(event, value, isBranch);
        return;
      case "Enter":
        if (disabled) return;
        this.onEnter(event, value, isBranch);
        return;
      case "*":
        if (disabled) return;
        event.preventDefault();
        this.expandSiblings(value);
        return;
      case "F2": {
        const { canRename } = this.config;
        if (disabled || !canRename || !canRename(entry.node, entry.indexPath)) return;
        event.preventDefault();
        this.startRename(value);
        return;
      }
    }

    if (event.key === "a" && (event.ctrlKey || event.metaKey)) {
      if (disabled) return;
      event.preventDefault();
      if (multiple) this.selectAll();
      return;
    }
    if (!this.config.typeahead || event.key.length !== 1 || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    this.typeaheadKey(event.key, index);
  }

  private onEnter(event: KeyboardEvent<HTMLElement>, value: string, isBranch: boolean) {
    const target = event.target as HTMLElement;
    if (isAnchor(target) && isModifierKey(event)) return;
    this.press(value, isBranch);
    if (!isAnchor(target)) event.preventDefault();
  }
}
