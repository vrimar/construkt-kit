import { useCallback, useSyncExternalStore } from "react";

import { hasTabbable } from "./tabbable";

const WATCHED_ATTRIBUTES = ["tabindex", "disabled", "href", "contenteditable", "hidden", "inert"];

export function useHasTabbable(element: HTMLElement | null, enabled = true): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!element || !enabled) return () => {};
      const observer = new MutationObserver(onChange);
      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: WATCHED_ATTRIBUTES,
      });
      return () => observer.disconnect();
    },
    [element, enabled],
  );

  return useSyncExternalStore(
    subscribe,
    () => !element || !enabled || hasTabbable(element),
    () => true,
  );
}
