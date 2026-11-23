import { useCallback } from "react";

import { selectHighlighted } from "../composite";
import { dataAttr } from "../render";
import { useStore } from "../store";
import { type ListboxNode, selectIsHighlightShown } from "./listboxNode";

/** A ref for the element the options scroll in. */
export function useListboxContentRef(
  node: ListboxNode,
): (element: HTMLElement | null) => () => void {
  return useCallback(
    (element: HTMLElement | null) => {
      node.setContent(element);
      return () => node.setContent(null);
    },
    [node],
  );
}

/** A ref for an input that drives the list while keeping focus. */
export function useListboxInputRef(node: ListboxNode): (element: HTMLElement | null) => () => void {
  return useCallback(
    (element: HTMLElement | null) => {
      node.setInput(element);
      return () => node.setInput(null);
    },
    [node],
  );
}

/** The `aria-activedescendant` of whatever keeps focus while the highlight moves. */
export function useListboxActiveDescendant(node: ListboxNode): string | undefined {
  const highlighted = useStore(node.store, selectHighlighted);
  return highlighted == null ? undefined : node.renderedItemId(highlighted);
}

export interface ListboxOptionState {
  /** The option's encoded value. */
  value: string;
  selected: boolean;
  disabled: boolean;
}

/** An option of `node`: the ref that registers its element, and its id, role and state attributes. */
export function useListboxOption(
  node: ListboxNode,
  { value, selected, disabled }: ListboxOptionState,
) {
  const highlighted = useStore(node.store, selectIsHighlightShown, value);
  const ref = useCallback(
    (element: HTMLElement | null) => (element ? node.registerItem(value, element) : undefined),
    [node, value],
  );
  return {
    ref,
    props: {
      id: node.itemId(value),
      role: "option",
      "data-value": value,
      "aria-selected": selected,
      "aria-disabled": disabled || undefined,
      "data-selected": dataAttr(selected),
      "data-highlighted": dataAttr(highlighted),
      "data-disabled": dataAttr(disabled),
    },
  };
}
