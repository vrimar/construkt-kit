import { useEffect, useRef } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import type { ListboxNode } from "../../primitives/listbox";

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
