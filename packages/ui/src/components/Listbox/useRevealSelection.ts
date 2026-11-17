import { useListboxContext } from "@ark-ui/react/listbox";
import { useEffect, useRef } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";

export function useRevealSelection(
  active: boolean,
  query: string,
  reveal: (value: string) => void,
): void {
  const { collection, value } = useListboxContext();
  const [selected] = active ? collection.sort(value.filter((item) => collection.has(item))) : [];
  const revealRef = useLatestRef(reveal);
  const queryRef = useLatestRef(query);
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) return;
    pendingRef.current = queryRef.current;
    return () => {
      pendingRef.current = null;
    };
  }, [active, queryRef]);

  useEffect(() => {
    if (pendingRef.current == null) return;
    if (pendingRef.current !== query) {
      pendingRef.current = null;
      return;
    }
    if (selected == null) return;
    // A frame lets an opening overlay place itself first.
    const frame = requestAnimationFrame(() => {
      pendingRef.current = null;
      revealRef.current(selected);
    });
    return () => cancelAnimationFrame(frame);
  }, [query, revealRef, selected]);
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
