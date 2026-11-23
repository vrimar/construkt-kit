import { type RefCallback, useCallback, useState } from "react";

/** Shows an element given `popover="manual"` in the top layer while it is mounted. */
export function useTopLayerPopover<T extends HTMLElement>(): [T | null, RefCallback<T>] {
  const [element, setElement] = useState<T | null>(null);
  const ref = useCallback((node: T | null) => {
    if (!node) return;
    node.showPopover();
    setElement(node);
    return () => {
      if (node.isConnected) node.hidePopover();
      setElement(null);
    };
  }, []);
  return [element, ref];
}
