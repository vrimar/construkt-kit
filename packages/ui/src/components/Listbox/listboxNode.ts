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

/** One option of a list, by its encoded value, in the order the keyboard walks it. */
export interface ListEntry {
  value: string;
  label: string;
  disabled: boolean;
}

export interface ListboxState {
  highlightedValue: string | null;
  /** Whether the highlighted option shows as highlighted. */
  highlightVisible: boolean;
}

export const selectHighlighted = (state: ListboxState): string | null => state.highlightedValue;

export const selectIsHighlighted = (state: ListboxState, value: string): boolean =>
  state.highlightVisible && state.highlightedValue === value;

export interface PickModifiers {
  /** Extends a multiple selection from its anchor to the option, with Shift held. */
  range: boolean;
}

const NO_MODIFIERS: PickModifiers = { range: false };

type Edge = "first" | "last";

export interface ListboxNodeProps {
  entries: readonly ListEntry[];
  disabled: boolean;
  loopFocus: boolean;
  typeahead: boolean;
  /** Shows the highlight whenever there is one, not only while the list has keyboard focus. */
  alwaysShowHighlight: boolean;
  /** Scrolls a virtual list to an index; without it the option's element scrolls into view. */
  scrollToIndex: ((index: number) => void) | undefined;
  /** An option was picked by a click, Enter or Space. */
  onPick: (value: string, modifiers: PickModifiers, event: Event) => void;
  /** The keyboard moved the highlight, with Shift held when `range` is set. */
  onNavigate: ((value: string, modifiers: PickModifiers) => void) | undefined;
  /** Ctrl or ⌘ + A. */
  onSelectAll: (() => void) | undefined;
  onHighlightChange: ((value: string | null) => void) | undefined;
  highlightControlled: boolean;
}

const IDLE: ListboxNodeProps = {
  entries: [],
  disabled: false,
  loopFocus: false,
  typeahead: true,
  alwaysShowHighlight: false,
  scrollToIndex: undefined,
  onPick: () => {},
  onNavigate: undefined,
  onSelectAll: undefined,
  onHighlightChange: undefined,
  highlightControlled: false,
};

export const sameEntries = (a: readonly ListEntry[], b: readonly ListEntry[]): boolean =>
  a === b ||
  (a.length === b.length &&
    a.every(
      (entry, index) =>
        entry.value === b[index].value &&
        entry.label === b[index].label &&
        entry.disabled === b[index].disabled,
    ));

const navigable = (entries: readonly ListEntry[]): NavigableList => ({
  length: entries.length,
  isDisabled: (index) => entries[index].disabled,
});

/** Scrolls `item` into view when `container` scrolls, as little as shows all of it. */
export function scrollIntoViewWithin(container: Element | null, item: Element | null | undefined) {
  if (container == null || item == null || container.scrollHeight <= container.clientHeight) return;
  item.scrollIntoView({ block: "nearest" });
}

/**
 * The highlight, keyboard and pointer handling of one list of options: a listbox that takes focus
 * itself, or one driven from an input that keeps focus while the options carry
 * `aria-activedescendant`.
 */
export class ListboxNode {
  readonly store: Store<ListboxState>;
  private config = IDLE;
  private readonly typeahead = new Typeahead();
  private readonly elements = new Map<string, HTMLElement>();
  private contentElement: HTMLElement | null = null;
  private inputElement: HTMLElement | null = null;
  private inputFocused = false;
  private inputAutoHighlight = false;
  private contentFocused = false;
  private keyboard = false;
  private pointer = false;
  private interactionCount = 0;

  constructor(
    readonly id: string,
    highlightedValue: string | null,
  ) {
    this.store = new Store<ListboxState>({ highlightedValue, highlightVisible: false });
  }

  update(config: ListboxNodeProps): void {
    const changed = !sameEntries(config.entries, this.config.entries);
    this.config = config;
    this.syncVisibility();
    if (changed) this.entriesChanged();
  }

  get content(): HTMLElement | null {
    return this.contentElement;
  }

  setContent(element: HTMLElement | null): void {
    this.contentElement = element;
  }

  get input(): HTMLElement | null {
    return this.inputElement;
  }

  setInput(element: HTMLElement | null): void {
    this.inputElement = element;
    if (!element) this.inputFocused = false;
  }

  itemId(value: string): string {
    return `${this.id}:item:${value}`;
  }

  registerItem(value: string, element: HTMLElement): () => void {
    this.elements.set(value, element);
    return () => {
      if (this.elements.get(value) === element) this.elements.delete(value);
    };
  }

  elementOf(value: string): HTMLElement | undefined {
    return this.elements.get(value);
  }

  get highlighted(): string | null {
    return this.store.state.highlightedValue;
  }

  /** How many presses and key presses the root has seen; it only grows. */
  get interactions(): number {
    return this.interactionCount;
  }

  private syncVisibility() {
    const visible =
      this.config.alwaysShowHighlight ||
      this.inputFocused ||
      (this.contentFocused && this.keyboard);
    this.store.set("highlightVisible", visible);
  }

  highlight(value: string | null, scroll = false): void {
    if (value !== this.highlighted) {
      this.config.onHighlightChange?.(value);
      if (!this.config.highlightControlled) this.store.set("highlightedValue", value);
    }
    if (scroll && value != null) this.scrollTo(value);
  }

  /** Applies a controlled highlight. */
  syncHighlight(value: string | null): void {
    this.store.set("highlightedValue", value);
  }

  scrollTo(value: string): void {
    const { scrollToIndex, entries } = this.config;
    if (scrollToIndex) {
      const index = entries.findIndex((entry) => entry.value === value);
      if (index !== -1) scrollToIndex(index);
      return;
    }
    scrollIntoViewWithin(this.contentElement, this.elements.get(value));
  }

  scrollToTop(): void {
    const { scrollToIndex } = this.config;
    if (scrollToIndex) scrollToIndex(0);
    else if (this.contentElement) this.contentElement.scrollTop = 0;
  }

  private target(target: "next" | "prev" | Edge): number {
    const { entries, loopFocus } = this.config;
    const list = navigable(entries);
    if (target === "first") return getFirstEnabledIndex(list);
    if (target === "last") return getLastEnabledIndex(list);
    const current = entries.findIndex((entry) => entry.value === this.highlighted);
    return getNextIndex(list, current, { decrement: target === "prev", loop: loopFocus });
  }

  /** Moves the highlight; returns the option it landed on, or null when there is none to move to. */
  move(target: "next" | "prev" | Edge): string | null {
    const entry = this.config.entries[this.target(target)];
    if (!entry) return null;
    this.highlight(entry.value, true);
    return entry.value;
  }

  private entriesChanged() {
    const { entries } = this.config;
    if (this.inputAutoHighlight && this.inputFocused) {
      queueMicrotask(() => this.highlight(this.firstEnabled()));
      return;
    }
    const highlighted = this.highlighted;
    if (highlighted != null && !entries.some((entry) => entry.value === highlighted)) {
      queueMicrotask(() => this.highlight(null));
    }
  }

  firstEnabled(): string | null {
    return this.config.entries[this.target("first")]?.value ?? null;
  }

  lastEnabled(): string | null {
    return this.config.entries[this.target("last")]?.value ?? null;
  }

  private typeaheadKey(key: string) {
    const { entries } = this.config;
    const labels = entries.map((entry) => (entry.disabled ? null : entry.label));
    const current = entries.findIndex((entry) => entry.value === this.highlighted);
    const entry = entries[this.typeahead.match(labels, key, current)];
    if (entry) this.highlight(entry.value, true);
  }

  pick(value: string, event: Event, modifiers: PickModifiers = NO_MODIFIERS): void {
    const entry = this.config.entries.find((candidate) => candidate.value === value);
    if (!entry || entry.disabled || this.config.disabled) return;
    this.config.onPick(value, modifiers, event);
  }

  /** Clears what an open list tracks, once it closes. */
  reset(): void {
    this.typeahead.reset();
    this.keyboard = false;
    this.highlight(null);
  }

  dispose(): void {
    this.typeahead.reset();
  }

  /** The list took focus; without a highlight, its first selected or first option highlights. */
  onContentFocus(element: HTMLElement, firstSelected: string | undefined): void {
    this.contentFocused = true;
    this.keyboard = !this.pointer && element.matches(":focus-visible");
    this.syncVisibility();
    if (this.highlighted == null)
      this.highlight(firstSelected ?? this.firstEnabled(), this.keyboard);
  }

  onContentBlur(): void {
    this.contentFocused = false;
    this.pointer = false;
    this.syncVisibility();
  }

  onInputFocus(autoHighlight: boolean): void {
    this.inputFocused = true;
    this.inputAutoHighlight = autoHighlight;
    this.syncVisibility();
  }

  onInputBlur(): void {
    this.inputFocused = false;
    this.syncVisibility();
  }

  /** A press inside the root, after which the highlight shows only from the keyboard again. */
  onPointerDown(): void {
    this.interactionCount += 1;
    this.pointer = true;
    if (!this.keyboard) return;
    this.keyboard = false;
    this.syncVisibility();
  }

  onKeyDownCapture(): void {
    this.interactionCount += 1;
    this.pointer = false;
  }

  private showKeyboardFocus() {
    if (this.keyboard) return;
    this.keyboard = true;
    this.syncVisibility();
  }

  private navigate(target: "next" | "prev" | Edge, shiftKey: boolean) {
    this.showKeyboardFocus();
    const value = this.move(target);
    if (value != null) this.config.onNavigate?.(value, { range: shiftKey });
    return value;
  }

  onContentKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.defaultPrevented || this.config.disabled) return;
    const content = event.currentTarget;
    const target = event.target as HTMLElement;
    if (!content.contains(target) || isEditableTarget(target)) return;
    const native = event.nativeEvent;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        if (this.navigate(event.key === "ArrowDown" ? "next" : "prev", event.shiftKey) != null) {
          event.preventDefault();
        }
        return;
      case "Home":
      case "End":
        event.preventDefault();
        this.navigate(event.key === "Home" ? "first" : "last", event.shiftKey);
        return;
      case "Enter":
        this.pickHighlighted(native);
        return;
      case " ":
        if (this.typeahead.typing && this.config.typeahead) {
          event.preventDefault();
          this.typeaheadKey(" ");
          return;
        }
        if (target !== content) return;
        event.preventDefault();
        this.pickHighlighted(native);
        return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      if (this.config.onSelectAll) {
        event.preventDefault();
        this.config.onSelectAll();
      }
      return;
    }
    if (target !== content || !this.config.typeahead) return;
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    this.showKeyboardFocus();
    this.typeaheadKey(event.key);
  }

  private pickHighlighted(event: Event) {
    const value = this.highlighted;
    if (value != null) this.pick(value, event);
  }

  /** Arrow keys and Enter on an input that drives the list; returns whether it handled the key. */
  onInputKeyDown(event: KeyboardEvent<HTMLElement>): boolean {
    if (event.defaultPrevented || isComposingEvent(event) || this.config.disabled) return false;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.navigate(event.key === "ArrowDown" ? "next" : "prev", event.shiftKey);
      return true;
    }
    if (event.key === "Enter" && this.highlighted != null) {
      event.preventDefault();
      this.pickHighlighted(event.nativeEvent);
      return true;
    }
    return false;
  }
}
