import type { DistributiveOmit } from "#styled-system/types";

export function splitKeys<P extends object, K extends string>(
  props: P,
  keys: Record<K, true>,
): [Partial<Record<K, unknown>>, DistributiveOmit<P, K>] {
  const picked: Partial<Record<K, unknown>> = {};
  const rest = { ...props } as Record<string, unknown>;
  for (const key of Object.keys(keys) as K[]) {
    picked[key] = rest[key];
    delete rest[key];
  }
  return [picked, rest as DistributiveOmit<P, K>];
}

/**
 * Splits a hook's options off a component's props: `keys` lists every option, so the options keep
 * their types and none reaches the element.
 */
export function splitOptions<P extends object, K extends keyof P & string>(
  props: P,
  keys: Record<K, true>,
): [Pick<P, K>, DistributiveOmit<P, K>] {
  const [options, rest] = splitKeys(props, keys);
  return [options as Pick<P, K>, rest];
}
