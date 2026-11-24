import { useLayoutEffect } from "react";

let lastOrder = 0;
const claims = new Set<number>();

export const lastFocusClaim = (): number => lastOrder;

export function useFocusClaim(claiming: boolean): void {
  useLayoutEffect(() => {
    if (!claiming) return;
    const order = ++lastOrder;
    claims.add(order);
    return () => {
      claims.delete(order);
    };
  }, [claiming]);
}

export const isFocusClaimedSince = (order: number): boolean =>
  [...claims].some((claim) => claim > order);
