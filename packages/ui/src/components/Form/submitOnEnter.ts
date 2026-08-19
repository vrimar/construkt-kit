import type { KeyboardEvent } from "react";

export const isPlainEnter = (event: KeyboardEvent) => {
  if (event.key !== "Enter" || event.defaultPrevented || event.nativeEvent.isComposing) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;

  return target.tagName !== "TEXTAREA" && !target.isContentEditable;
};
