import { type RefCallback, useCallback } from "react";

import { isItemDisabled } from "./navigation";

export interface CompositeItem {
  element: HTMLElement;
  value: string;
  /** The text typeahead matches, in place of the element's own. */
  label: string | undefined;
}

function sortByDocumentPosition(a: Element, b: Element) {
  if (a.nextElementSibling === b) return -1;
  if (b.nextElementSibling === a) return 1;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

/**
 * The items of a list widget. They are ordered by their place in the document when read, so items
 * that mount out of order, sit in groups or move keep their order without re-registering.
 */
export class CompositeList {
  private readonly entries = new Map<HTMLElement, CompositeItem>();

  register(element: HTMLElement, value: string, label: string | undefined): () => void {
    const item = { element, value, label };
    this.entries.set(element, item);
    return () => {
      if (this.entries.get(element) === item) this.entries.delete(element);
    };
  }

  /** The connected items in document order. */
  items(): CompositeItem[] {
    return [...this.entries.values()]
      .filter((item) => item.element.isConnected)
      .sort((a, b) => sortByDocumentPosition(a.element, b.element));
  }

  find(value: string | null): CompositeItem | undefined {
    if (value == null) return undefined;
    for (const item of this.entries.values()) {
      if (item.value === value && item.element.isConnected) return item;
    }
    return undefined;
  }
}

/** Registers the element it is attached to as the item `value` of `list`. */
export function useCompositeListItem(
  list: CompositeList,
  value: string,
  label?: string,
): RefCallback<HTMLElement> {
  return useCallback(
    (element: HTMLElement | null) => (element ? list.register(element, value, label) : undefined),
    [list, value, label],
  );
}

export function syncRovingTabStop(list: CompositeList, value: string | null): void {
  const items = list.items();
  const enabled = items.filter((item) => !isItemDisabled(item.element));
  const stop = enabled.find((item) => item.value === value) ?? enabled[0];
  for (const item of items) item.element.setAttribute("tabindex", item === stop ? "0" : "-1");
}
