interface RangeEntry {
  value: string;
  disabled: boolean;
}

/** The entries between `from` and `to` in list order, both included, or none when either is missing. */
function entryRange<E extends RangeEntry>(entries: readonly E[], from: string, to: string): E[] {
  const start = entries.findIndex((entry) => entry.value === from);
  const end = entries.findIndex((entry) => entry.value === to);
  if (start === -1 || end === -1) return [];
  const [low, high] = start <= end ? [start, end] : [end, start];
  return entries.slice(low, high + 1);
}

/** The anchor a Shift selection extends from, and the entries its last range selected. */
export class RangeSelection {
  private range: { anchor: string; covered: readonly string[] } | null = null;

  /** Anchors the next range at `value`: the entry a plain pick landed on. */
  reset(value: string): void {
    this.range = { anchor: value, covered: [] };
  }

  /**
   * The selection once the range runs from the anchor to `target`: the entries it last selected
   * drop out, shown or not, and those from the anchor to `target` join, leaving disabled ones as
   * they are. With no anchor among `entries`, the range anchors at `from` when that is among them;
   * `null` when nothing anchors it.
   */
  extendTo(
    entries: readonly RangeEntry[],
    selected: Iterable<string>,
    target: string,
    from?: string | null,
  ): string[] | null {
    const listed = (value: string) => entries.some((entry) => entry.value === value);
    let { range } = this;
    if (!range || !listed(range.anchor)) {
      if (from == null || !listed(from)) return null;
      range = { anchor: from, covered: [] };
      this.range = range;
    }
    const next = new Set(selected);
    for (const value of range.covered) next.delete(value);
    const covered = entryRange(entries, target, range.anchor).flatMap((entry) =>
      entry.disabled ? [] : [entry.value],
    );
    for (const value of covered) next.add(value);
    range.covered = covered;
    return [...next];
  }
}
