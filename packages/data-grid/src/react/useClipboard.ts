import { isEditableTarget } from "@construkt-kit/ui";
import { useEffect } from "react";

import type { AnyGridCore } from "./useGridCore";

export function useCopyHandler(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  onRefused: () => void,
  onCopied: () => void,
): void {
  useEffect(() => {
    if (!scroller) return;
    const onCopy = (event: ClipboardEvent) => {
      const active = document.activeElement;
      if (!scroller.contains(active) || isEditableTarget(active)) return;
      const text = document.getSelection();
      if (text && !text.isCollapsed && scroller.contains(text.anchorNode)) return;
      event.preventDefault();
      const payload = core.copyPayload();
      if (!payload) {
        onRefused();
        return;
      }
      event.clipboardData?.setData("text/plain", payload.text);
      event.clipboardData?.setData("text/html", payload.html);
      onCopied();
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, [core, scroller, onRefused, onCopied]);
}

export async function writeClipboard(core: AnyGridCore): Promise<boolean> {
  const payload = core.copyPayload();
  if (!payload) return false;
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([payload.text], { type: "text/plain" }),
        "text/html": new Blob([payload.html], { type: "text/html" }),
      }),
    ]);
  } else {
    await navigator.clipboard.writeText(payload.text);
  }
  return true;
}
