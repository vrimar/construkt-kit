const RESET_MS = 350;

let collator: Intl.Collator | undefined;

const startsWith = (label: string, query: string) => {
  collator ??= new Intl.Collator(undefined, { usage: "search", sensitivity: "base" });
  const text = query.normalize("NFC");
  return collator.compare(label.normalize("NFC").trim().slice(0, text.length), text) === 0;
};

/** One typeahead session: keys typed less than 350ms apart build a single search. */
export class Typeahead {
  private search = "";
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** Whether a search is under way, so Space types a space instead of activating. */
  get typing(): boolean {
    return this.search !== "";
  }

  /**
   * Adds `key` to the search and returns the index of the next label it matches, ignoring case and
   * accents, or -1. A search of one letter, or one letter repeated, starts after `activeIndex` so
   * repeating it cycles through the labels that start with it; a longer one starts at
   * `activeIndex`. Either wraps, and skips null labels.
   */
  match(labels: readonly (string | null)[], key: string, activeIndex: number): number {
    const search = this.search + key;
    this.search = search;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.reset(), RESET_MS);

    const chars = Array.from(search);
    const repeated = chars.length > 1 && chars.every((char) => char === chars[0]);
    const query = repeated ? chars[0] : search;
    const single = repeated || chars.length === 1;
    const start = Math.max(activeIndex, 0);
    for (let offset = 0; offset < labels.length; offset += 1) {
      const index = (start + offset) % labels.length;
      if (single && index === activeIndex) continue;
      const label = labels[index];
      if (label != null && startsWith(label, query)) return index;
    }
    return -1;
  }

  reset(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.search = "";
  }
}
