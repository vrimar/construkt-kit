import { isEditableTarget } from "@construkt-kit/ui";
import { type RefObject, useEffect } from "react";

import type { DataGridLabels } from "./types";
import type { AnyGridCore } from "./useGridCore";

interface CopyHandlerOptions {
  announce: (message: string) => void;
  labels: Readonly<RefObject<DataGridLabels>>;
}

export function useCopyHandler(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  { announce, labels }: CopyHandlerOptions,
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
        announce(labels.current.copyRefused);
        return;
      }
      event.clipboardData?.setData("text/plain", payload.text);
      event.clipboardData?.setData("text/html", payload.html);
      announce(labels.current.copied);
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, [core, scroller, announce, labels]);
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
