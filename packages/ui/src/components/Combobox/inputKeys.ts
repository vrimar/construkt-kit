import type { KeyboardEvent } from "react";

import { isComposingEvent } from "../../foundations/dom";

// zag's Enter selects and then clicks the link, selecting twice in a combobox that stays open.
export function clickHighlightedLinkOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter" || event.defaultPrevented) return;
  if (event.ctrlKey || event.shiftKey || isComposingEvent(event)) return;
  const input = event.currentTarget;
  if (input.getAttribute("aria-expanded") !== "true") return;
  const id = input.getAttribute("aria-activedescendant");
  const item = id ? input.ownerDocument.getElementById(id) : null;
  if (!item?.matches("a[href]")) return;
  event.preventDefault();
  queueMicrotask(() => item.click());
}

// Preventing default is the only way past zag's Home/End highlight move, so the caret moves by hand.
export function moveCaretOnHomeEnd(event: KeyboardEvent<HTMLInputElement>) {
  if ((event.key !== "Home" && event.key !== "End") || event.defaultPrevented) return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  event.preventDefault();
  const input = event.currentTarget;
  const caret = event.key === "Home" ? 0 : input.value.length;
  input.setSelectionRange(caret, caret);
}
