import { useEffect, useRef } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import type { ListboxNode } from "./listboxNode";

/**
 * Reveals `selected`, the first selected option in list order, once it is there to reveal: on
 * mount, or when it arrives later, as long as the user hasn't searched, pressed or typed in the
 * list since.
 */
export function useRevealSelection(
  node: ListboxNode,
  active: boolean,
  query: string,
  selected: string | undefined,
  reveal: (value: string) => void,
): void {
  const revealRef = useLatestRef(reveal);
  const queryRef = useLatestRef(query);
  const pendingRef = useRef<{ query: string; interactions: number } | null>(null);
  const shown = active ? selected : undefined;

  useEffect(() => {
    if (!active) return;
    pendingRef.current = { query: queryRef.current, interactions: node.interactions };
    return () => {
      pendingRef.current = null;
    };
  }, [active, node, queryRef]);

  useEffect(() => {
    const pending = pendingRef.current;
    if (pending == null) return;
    if (pending.query !== query || pending.interactions !== node.interactions) {
      pendingRef.current = null;
      return;
    }
    if (shown == null) return;
    // A frame lets an opening overlay place itself first.
    const frame = requestAnimationFrame(() => {
      pendingRef.current = null;
      revealRef.current(shown);
    });
    return () => cancelAnimationFrame(frame);
  }, [node, query, revealRef, shown]);
}

// Unlike scrollIntoView, never scrolls the page or any other ancestor.
export function scrollWithinContainer(container: HTMLElement, item: Element): void {
  const box = container.getBoundingClientRect();
  const rect = item.getBoundingClientRect();
  // Rects carry an opening animation's transform; scrollTop doesn't.
  const scale = container.offsetHeight ? box.height / container.offsetHeight : 1;
  const style = getComputedStyle(container);
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const above = (rect.top - box.top) / scale - container.clientTop - paddingTop;
  const below = above + rect.height / scale - (container.clientHeight - paddingTop - paddingBottom);
  if (above < 0) container.scrollTop += above;
  else if (below > 0) container.scrollTop += Math.min(below, above);
}
