import { sameItems } from "@construkt-kit/utils";
import type { KeyboardEvent, MouseEvent } from "react";

import { isComposingEvent, isEditableTarget, opensLinkNatively } from "../../foundations/dom";
import {
  HighlightList,
  type HighlightListOptions,
  type HighlightState,
  type ListTarget,
  Typeahead,
  activateItem,
  scrollIntoViewIfNeeded,
} from "../composite";

/** One option of a list, by its encoded value, in the order the keyboard walks it. */
export interface ListEntry {
  value: string;
  label: string;
  disabled: boolean;
}

export interface ListboxState extends HighlightState {
  /** Whether the highlighted option shows as highlighted. */
  highlightVisible: boolean;
  /** The options follow text the user is typing, and the highlight hasn't been moved since. */
  suggesting: boolean;
}

export const selectIsHighlightShown = (state: ListboxState, value: string): boolean =>
  state.highlightVisible && state.highlightedValue === value;

export const selectSuggesting = (state: ListboxState): boolean => state.suggesting;

export interface PickModifiers {
  /** Extends a multiple selection from its anchor to the option, with Shift held. */
  range: boolean;
}

const NO_MODIFIERS: PickModifiers = { range: false };

export interface ListboxNodeProps extends HighlightListOptions {
  entries: readonly ListEntry[];
  disabled: boolean;
  typeahead: boolean;
  /** Shows the highlight whenever there is one, not only while the list has keyboard focus. */
  alwaysShowHighlight: boolean;
  /**
   * Highlights the first enabled option when the options change while the user types, or drop the
   * highlighted one.
   */
  autoHighlight: boolean;
  /** Scrolls a virtual list to an index; without it the option's element scrolls into view. */
  scrollToIndex: ((index: number) => void) | undefined;
  /** An option was picked by a click, Enter or Space. */
  onPick: (value: string, modifiers: PickModifiers, event: Event) => void;
  /** The keyboard moved the highlight from `from` to `value`, with Shift held when `range` is set. */
  onNavigate: ((value: string, modifiers: PickModifiers, from: string | null) => void) | undefined;
  /** Ctrl or ⌘ + A. */
  onSelectAll: (() => void) | undefined;
}

const IDLE: ListboxNodeProps = {
  entries: [],
  disabled: false,
  loopFocus: false,
  typeahead: true,
  alwaysShowHighlight: false,
  autoHighlight: false,
  scrollToIndex: undefined,
  onPick: () => {},
  onNavigate: undefined,
  onSelectAll: undefined,
  onHighlightChange: undefined,
  highlightControlled: false,
};

const sameEntry = (a: ListEntry, b: ListEntry): boolean =>
  a.value === b.value && a.label === b.label && a.disabled === b.disabled;

/**
 * The highlight, keyboard and pointer handling of one list of options: a listbox that takes focus
 * itself, or one driven from an input that keeps focus while the options carry
 * `aria-activedescendant`.
 */
export class ListboxNode extends HighlightList<ListboxState> {
  private config = IDLE;
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
    suggesting = true,
  ) {
    super({ highlightedValue, highlightVisible: false, suggesting });
  }

  update(config: ListboxNodeProps): void {
    const changed =
      config.entries !== this.config.entries &&
      !sameItems(config.entries, this.config.entries, sameEntry);
    this.config = config;
    this.syncVisibility();
    if (changed) this.entriesChanged();
  }

  protected get highlightOptions(): HighlightListOptions {
    return this.config;
  }

  protected highlightItems(): readonly ListEntry[] {
    return this.config.entries;
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

  /** The id item `value` renders with: its own when given one, else `itemId`. */
  renderedItemId(value: string): string {
    return this.elements.get(value)?.id || this.itemId(value);
  }

  registerItem(value: string, element: HTMLElement): () => void {
    this.elements.set(value, element);
    return () => {
      if (this.elements.get(value) === element) this.elements.delete(value);
    };
  }

  /** How many presses and key presses the root has seen; it only grows. */
  get interactions(): number {
    return this.interactionCount;
  }

  get suggesting(): boolean {
    return this.store.state.suggesting;
  }

  /** Marks whether the options follow what the user types; moving the highlight clears it. */
  setSuggesting(suggesting: boolean): void {
    this.store.set("suggesting", suggesting);
  }

  private syncVisibility() {
    const visible =
      this.config.alwaysShowHighlight ||
      this.inputFocused ||
      (this.contentFocused && this.keyboard);
    this.store.set("highlightVisible", visible);
  }

  /** The pointer moved onto an option. */
  hover(value: string): void {
    this.setSuggesting(false);
    this.highlight(value);
  }

  scrollTo(value: string): void {
    const { scrollToIndex, entries } = this.config;
    if (scrollToIndex) {
      const index = entries.findIndex((entry) => entry.value === value);
      if (index !== -1) scrollToIndex(index);
      return;
    }
    scrollIntoViewIfNeeded(this.contentElement, this.elements.get(value));
  }

  scrollToTop(): void {
    const { scrollToIndex } = this.config;
    if (scrollToIndex) scrollToIndex(0);
    else if (this.contentElement) this.contentElement.scrollTop = 0;
  }

  private get autoHighlights() {
    return this.config.autoHighlight || (this.inputAutoHighlight && this.inputFocused);
  }

  private entriesChanged() {
    const { entries } = this.config;
    const { highlightedValue: highlighted, suggesting, highlightVisible } = this.store.state;
    const removed = highlighted != null && !entries.some((entry) => entry.value === highlighted);
    if (this.autoHighlights && (removed || suggesting)) this.highlight(this.firstEnabled(), true);
    else if (removed) this.highlight(null);
    else if (highlighted != null && !suggesting && highlightVisible) this.scrollTo(highlighted);
  }

  firstEnabled(): string | null {
    const { entries } = this.config;
    return entries[this.targetIndex(entries, "first")]?.value ?? null;
  }

  lastEnabled(): string | null {
    const { entries } = this.config;
    return entries[this.targetIndex(entries, "last")]?.value ?? null;
  }

  pick(value: string, event: Event, modifiers: PickModifiers = NO_MODIFIERS): void {
    const entry = this.config.entries.find((candidate) => candidate.value === value);
    if (!entry || entry.disabled || this.config.disabled) return;
    this.config.onPick(value, modifiers, event);
  }

  /** A click on an option picks it, unless it lands on a field inside it or opens the option's link. */
  onItemClick(value: string, event: MouseEvent<HTMLElement>): void {
    if (event.defaultPrevented || event.button !== 0) return;
    if (isEditableTarget(event.target) || opensLinkNatively(event)) return;
    this.pick(value, event.nativeEvent, { range: event.shiftKey });
  }

  /** Picks the highlighted option, or clicks it when it is a link, so it opens where the modifiers ask. */
  pickHighlighted(event: KeyboardEvent<HTMLElement>): void {
    const value = this.highlighted;
    if (value == null) return;
    const element = this.elements.get(value);
    if (element?.matches("a[href]")) {
      event.preventDefault();
      activateItem(element, event);
      return;
    }
    this.pick(value, event.nativeEvent);
  }

  /** Clears what an open list tracks, once it closes. */
  reset(): void {
    this.keyboard = false;
    this.setSuggesting(true);
    this.resetHighlight();
  }

  dispose(): void {
    this.disposeHighlight();
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
    this.setSuggesting(false);
    if (this.keyboard) return;
    this.keyboard = true;
    this.syncVisibility();
  }

  private navigate(target: ListTarget, shiftKey: boolean) {
    this.showKeyboardFocus();
    const from = this.highlighted;
    const value = this.move(target);
    if (value != null) this.config.onNavigate?.(value, { range: shiftKey }, from);
    return value;
  }

  onContentKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.defaultPrevented || this.config.disabled) return;
    const content = event.currentTarget;
    const target = event.target as HTMLElement;
    if (!content.contains(target) || isEditableTarget(target)) return;

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
        this.pickHighlighted(event);
        return;
      case " ": {
        if (this.typingAhead && this.config.typeahead) {
          event.preventDefault();
          this.typeaheadKey(" ");
          return;
        }
        if (target !== content) return;
        event.preventDefault();
        const value = this.highlighted;
        if (value != null) this.pick(value, event.nativeEvent, { range: event.shiftKey });
        return;
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      if (this.config.onSelectAll) {
        event.preventDefault();
        this.config.onSelectAll();
      }
      return;
    }
    if (target !== content || !this.config.typeahead || !Typeahead.accepts(event)) return;
    event.preventDefault();
    this.showKeyboardFocus();
    this.typeaheadKey(event.key);
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
      this.pickHighlighted(event);
      return true;
    }
    return false;
  }
}
