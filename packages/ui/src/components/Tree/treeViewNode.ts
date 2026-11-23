import { sameItems } from "@construkt-kit/utils";
import type { KeyboardEvent, MouseEvent } from "react";

import {
  isComposingEvent,
  isEditableTarget,
  isModifierKey,
  opensLinkNatively,
} from "../../foundations/dom";
import {
  type NavigableList,
  RangeSelection,
  Typeahead,
  entryList,
  getLastEnabledIndex,
  getNextIndex,
  getTargetIndex,
  isCrossOrientationCloseKey,
  isCrossOrientationOpenKey,
} from "../../primitives/composite";
import { Store } from "../../primitives/store";
import { getSelectAllState } from "../selection";
import { TreeCollection, getToggledLeafValues, isDescendantPath } from "./treeCollection";

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
  /** The row that holds the tab stop while no shown row has focus. */
  first: string | null;
  visible: ReadonlySet<string>;
}

export const selectTabStop = (state: TreeViewState, { first, visible }: TabStopArg) =>
  state.focusedValue != null && visible.has(state.focusedValue) ? state.focusedValue : first;

export const selectIsTabStop = (state: TreeViewState, arg: TabStopArg & { value: string }) =>
  selectTabStop(state, arg) === arg.value;

export const selectIsRenaming = (state: TreeViewState, value: string): boolean =>
  state.renamingValue === value;

export interface PressModifiers {
  /** Ctrl or ⌘: toggles the node in a multiple selection. */
  toggle: boolean;
  /** Shift: extends a multiple selection to the node. */
  range: boolean;
}

const NO_MODIFIERS: PressModifiers = { toggle: false, range: false };

const pressModifiers = (event: {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}): PressModifiers => ({ toggle: event.ctrlKey || event.metaKey, range: event.shiftKey });

export interface PressedRow {
  value: string;
  isBranch: boolean;
  disabled: boolean;
  loading: boolean;
}

export interface TreeViewNodeConfig {
  collection: TreeCollection<unknown>;
  visibleNodes: readonly VisibleNode<unknown>[];
  expandedValue: readonly string[];
  selectedValue: readonly string[];
  checkedValue: readonly string[];
  selectionMode: "none" | "single" | "multiple";
  isNodeCheckable: (node: unknown) => boolean;
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
  selectionMode: "single",
  isNodeCheckable: () => true,
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

const isAnchor = (element: Element) => element.matches("a[href]");

const uniq = (values: readonly string[]) => Array.from(new Set(values));

export const parentIndexOf = (nodes: readonly VisibleNode<unknown>[], index: number): number => {
  const depth = nodes[index]?.indexPath.length ?? 0;
  if (depth < 2) return -1;
  let parent = index - 1;
  while (parent >= 0 && nodes[parent].indexPath.length !== depth - 1) parent -= 1;
  return parent;
};

/**
 * The focus, keyboard, typeahead, selection and expansion of one tree. Rows register their element
 * by node value; the root hands it the latest state after every render.
 */
export class TreeViewNode {
  readonly store = new Store<TreeViewState>({ focusedValue: null, renamingValue: null });
  private config = IDLE;
  private readonly typeaheadSession = new Typeahead();
  private readonly range = new RangeSelection();
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
    return entryList(this.config.visibleNodes);
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
    if (sameItems(next, this.expanded)) return;
    this.expanded = next;
    this.config.onExpandedChange([...next]);
  }

  private setSelected(next: readonly string[]) {
    if (sameItems(next, this.selected)) return;
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
    const { selectionMode, expandOnClick } = this.config;
    const multiple = selectionMode === "multiple";
    if (multiple && modifiers.toggle) {
      this.range.reset(value);
      this.setSelected(
        this.selected.includes(value)
          ? this.selected.filter((entry) => entry !== value)
          : [...this.selected, value],
      );
      return;
    }
    if (multiple && modifiers.range && this.extendSelectionTo(value)) return;
    this.range.reset(value);
    if (selectionMode !== "none") this.setSelected([value]);
    if (isBranch && expandOnClick) this.toggleExpanded(value);
  }

  onRowClick(event: MouseEvent<HTMLElement>, row: PressedRow): void {
    if (row.disabled || row.loading || event.button !== 0 || opensLinkNatively(event)) return;
    this.press(row.value, row.isBranch, pressModifiers(event));
    event.stopPropagation();
    if (!isAnchor(event.currentTarget)) event.preventDefault();
  }

  private extendSelectionTo(target: string, from?: string): boolean {
    const next = this.range.extendTo(this.config.visibleNodes, this.selected, target, from);
    if (next === null) return false;
    this.setSelected(next);
    return true;
  }

  private navigateTo(from: string, to: string, extend: boolean) {
    if (extend && this.config.selectionMode === "multiple") this.extendSelectionTo(to, from);
  }

  private selectAll() {
    const { collection } = this.config;
    const values = [...this.selected];
    collection.visit({
      onEnter: (node) => {
        if (!collection.getNodeDisabled(node)) values.push(collection.getNodeValue(node));
      },
    });
    this.setSelected(uniq(values));
    this.focusIndex(getLastEnabledIndex(this.list));
  }

  toggleChecked(node: unknown): void {
    const { collection, isNodeCheckable } = this.config;
    if (collection.getNodeDisabled(node) || !isNodeCheckable(node)) return;
    const value = collection.getNodeValue(node);
    const leaves = collection.isBranchNode(node)
      ? getToggledLeafValues(collection, node, isNodeCheckable)
      : [value];
    const next = getSelectAllState(this.checked, leaves).toggle();
    if (sameItems(next, this.checked)) return;
    this.checked = next;
    this.config.onCheckedChange(next);
  }

  private focusParent(index: number) {
    const parent = parentIndexOf(this.config.visibleNodes, index);
    if (parent !== -1) this.focusIndex(parent);
  }

  private focusFirstChild(index: number) {
    const { visibleNodes } = this.config;
    const { indexPath } = visibleNodes[index];
    for (
      let i = index + 1;
      i < visibleNodes.length && isDescendantPath(indexPath, visibleNodes[i].indexPath);
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
    const { collection, visibleNodes, selectionMode, rtl } = this.config;
    const index = this.indexOf(value);
    const entry = visibleNodes[index];
    if (!entry) return;
    const isBranch = collection.isBranchNode(entry.node);
    const { disabled } = entry;

    if (isCrossOrientationCloseKey(event.key, rtl)) {
      if (isModifierKey(event) || disabled) return;
      event.preventDefault();
      if (isBranch && this.expanded.includes(value)) this.collapse([value]);
      else this.focusParent(index);
      return;
    }
    if (isCrossOrientationOpenKey(event.key, rtl)) {
      if (isModifierKey(event) || !isBranch || disabled) return;
      event.preventDefault();
      if (this.focusedValue === value && this.expanded.includes(value)) {
        this.focusFirstChild(index);
      } else {
        this.expand([value]);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (isModifierKey(event)) return;
        event.preventDefault();
        const next = getNextIndex(this.list, index, {
          decrement: event.key === "ArrowUp",
          loop: false,
        });
        if (next === index) return;
        this.focusIndex(next);
        this.navigateTo(value, visibleNodes[next].value, event.shiftKey);
        return;
      }
      case "Home":
      case "End": {
        if (isModifierKey(event)) return;
        event.preventDefault();
        const edge = getTargetIndex(
          this.list,
          index,
          event.key === "Home" ? "first" : "last",
          false,
        );
        if (edge === -1) return;
        this.focusIndex(edge);
        this.navigateTo(value, visibleNodes[edge].value, event.shiftKey);
        return;
      }
      case " ":
        if (disabled) return;
        event.preventDefault();
        if (this.typeaheadSession.typing && this.config.typeahead) this.typeaheadKey(" ", index);
        else this.press(value, isBranch, pressModifiers(event));
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
      if (selectionMode === "multiple") this.selectAll();
      return;
    }
    if (!this.config.typeahead || !Typeahead.accepts(event)) return;
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
