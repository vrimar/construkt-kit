import type {
  MultipleSelectionProps,
  SelectionMode,
  SelectionProps,
  SelectionValue,
  SingleSelectionProps,
} from "./types";

export const encodeSelectionValue = (value: SelectionValue): string =>
  typeof value === "number" ? `n:${value}` : `s:${value}`;

/** `items` by their encoded values in list order, and each one's value; throws on a repeated value. */
export function indexSelectionItems<T, V extends SelectionValue>(
  items: readonly T[],
  getItemValue: (item: T) => V,
): { items: Map<string, T>; values: Map<string, V> } {
  const byValue = new Map<string, T>();
  const values = new Map<string, V>();
  for (const item of items) {
    const value = getItemValue(item);
    const encoded = encodeSelectionValue(value);
    if (values.has(encoded)) {
      throw new Error(`Selection items must have unique values. Duplicate value: ${String(value)}`);
    }
    byValue.set(encoded, item);
    values.set(encoded, value);
  }
  return { items: byValue, values };
}

/** A single or multiple selection as a list of values. */
export const toSelectionArray = <V>(value: V | readonly V[] | null | undefined): V[] =>
  value == null ? [] : Array.isArray(value) ? [...(value as readonly V[])] : [value as V];

/**
 * The values of encoded `selection`, each read from `values` or, once the items no longer hold it,
 * from `current`.
 */
export function decodeSelection<V extends SelectionValue>(
  selection: readonly string[],
  values: ReadonlyMap<string, V>,
  current: readonly V[],
): V[] {
  return selection
    .map(
      (encoded) =>
        values.get(encoded) ?? current.find((value) => encodeSelectionValue(value) === encoded),
    )
    .filter((value): value is V => value !== undefined);
}

/** Reports `values` to `onValueChange`: all of them, or for a single selection its first, never none. */
export function emitSelection<V extends SelectionValue>(
  selectionMode: SelectionMode | undefined,
  onValueChange: SelectionProps<V, SelectionMode>["onValueChange"],
  values: readonly V[],
): void {
  if (selectionMode === "multiple") {
    (onValueChange as MultipleSelectionProps<V>["onValueChange"])([...values]);
  } else if (values.length > 0) {
    (onValueChange as SingleSelectionProps<V>["onValueChange"])(values[0]);
  }
}
