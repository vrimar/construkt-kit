import { Store } from "../store";
import { type ListTarget, entryList, getTargetIndex } from "./navigation";
import { Typeahead } from "./Typeahead";

export interface HighlightState {
  highlightedValue: string | null;
}

export const selectHighlighted = (state: HighlightState): string | null => state.highlightedValue;

export const selectIsHighlighted = (state: HighlightState, value: string): boolean =>
  state.highlightedValue === value;

/** One item of a highlight list, in the order the keyboard walks it. */
export interface HighlightItem {
  value: string;
  /** The text typeahead matches. */
  label: string;
  disabled: boolean;
}

export interface HighlightListOptions {
  /** Arrow keys wrap from the last item to the first and back. */
  loopFocus: boolean;
  /** The highlight only changes through `syncHighlight`; `highlight` just reports it. */
  highlightControlled: boolean;
  onHighlightChange: ((value: string | null) => void) | undefined;
}

/**
 * The highlighted item of a list that keeps focus on itself or an input while its items carry
 * `aria-activedescendant`: moving it by arrow keys and typeahead, and scrolling it into view.
 */
export abstract class HighlightList<State extends HighlightState = HighlightState> {
  readonly store: Store<State>;
  private readonly typeahead = new Typeahead();

  constructor(state: State) {
    this.store = new Store(state);
  }

  protected abstract get highlightOptions(): HighlightListOptions;

  /** The items, in the order the keyboard walks them. */
  protected abstract highlightItems(): readonly HighlightItem[];

  /** Scrolls the item into view. */
  abstract scrollTo(value: string): void;

  get highlighted(): string | null {
    return this.store.state.highlightedValue;
  }

  /** Whether a typeahead search is under way, so Space types a space instead of activating. */
  get typingAhead(): boolean {
    return this.typeahead.typing;
  }

  highlight(value: string | null, scroll = false): void {
    if (value !== this.highlighted) {
      const { onHighlightChange, highlightControlled } = this.highlightOptions;
      onHighlightChange?.(value);
      if (!highlightControlled) this.syncHighlight(value);
    }
    if (scroll && value != null) this.scrollTo(value);
  }

  /** Applies a controlled highlight. */
  syncHighlight(value: string | null): void {
    this.store.set("highlightedValue", value);
  }

  protected targetIndex(items: readonly HighlightItem[], target: ListTarget): number {
    const current = items.findIndex((item) => item.value === this.highlighted);
    return getTargetIndex(entryList(items), current, target, this.highlightOptions.loopFocus);
  }

  /** Moves the highlight; returns the item it landed on, or null when there is none to move to. */
  move(target: ListTarget): string | null {
    const items = this.highlightItems();
    const item = items[this.targetIndex(items, target)];
    if (!item) return null;
    this.highlight(item.value, true);
    return item.value;
  }

  protected typeaheadKey(key: string): void {
    const items = this.highlightItems();
    const labels = items.map((item) => (item.disabled ? null : item.label));
    const current = items.findIndex((item) => item.value === this.highlighted);
    const item = items[this.typeahead.match(labels, key, current)];
    if (item) this.highlight(item.value, true);
  }

  /** Clears the highlight and any typeahead search, once the list closes. */
  protected resetHighlight(): void {
    this.typeahead.reset();
    this.highlight(null);
  }

  protected disposeHighlight(): void {
    this.typeahead.reset();
  }
}
