import { clampValue } from "@construkt-kit/utils";

export interface SizeLimits {
  min: number;
  max: number;
}

export function distribute(
  total: number,
  items: readonly (SizeLimits & { weight: number })[],
): number[] {
  const sizes = items.map((item) => item.min);
  const free = new Set(items.map((_, index) => index).filter((index) => items[index].weight > 0));
  let remaining = total;
  for (const index of items.keys()) if (!free.has(index)) remaining -= sizes[index];

  while (free.size > 0) {
    const weight = [...free].reduce((sum, index) => sum + items[index].weight, 0);
    const share = (index: number) => (remaining * items[index].weight) / weight;
    let violation = 0;
    for (const index of free) {
      sizes[index] = clampValue(share(index), items[index].min, items[index].max);
      violation += sizes[index] - share(index);
    }
    if (violation === 0) break;
    const frozen = [...free].filter(
      (index) => Math.sign(sizes[index] - share(index)) === Math.sign(violation),
    );
    for (const index of frozen) {
      remaining -= sizes[index];
      free.delete(index);
    }
  }
  return roundPreservingTotal(sizes);
}

export function resizeTogether(
  widths: readonly number[],
  limits: readonly SizeLimits[],
  delta: number,
): number[] {
  const total = widths.reduce((sum, width) => sum + width, 0);
  return distribute(
    total + delta,
    widths.map((width, index) => ({ ...limits[index], weight: Math.max(width, 1) })),
  );
}

function roundPreservingTotal(sizes: number[]): number[] {
  const rounded = sizes.map((size) => Math.floor(size));
  let leftover =
    Math.round(sizes.reduce((sum, size) => sum + size, 0)) -
    rounded.reduce((sum, size) => sum + size, 0);
  const byFraction = sizes
    .map((size, index) => ({ index, fraction: size - Math.floor(size) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (const { index } of byFraction) {
    if (leftover <= 0) break;
    rounded[index]++;
    leftover--;
  }
  return rounded;
}
