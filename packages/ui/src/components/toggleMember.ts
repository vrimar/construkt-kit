/**
 * `values` with `item` toggled. With `multiple` it joins or leaves; otherwise it becomes the only
 * one, and pressing the only one empties `values` when `removable` or returns them unchanged.
 */
export function toggleMember(
  values: string[],
  item: string,
  { multiple, removable = true }: { multiple: boolean; removable?: boolean },
): string[] {
  const included = values.includes(item);
  if (multiple) return included ? values.filter((entry) => entry !== item) : [...values, item];
  if (included && values.length === 1) return removable ? [] : values;
  return [item];
}
