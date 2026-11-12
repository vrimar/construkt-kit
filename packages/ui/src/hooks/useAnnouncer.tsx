import { useCallback, useRef, useState } from "react";

import { VisuallyHidden } from "#styled-system/jsx";

export interface UseAnnouncerOptions {
  /** `"assertive"` interrupts what the screen reader is saying. Defaults to `"polite"`. */
  politeness?: "polite" | "assertive";
}

/**
 * A visually hidden live region and a function that announces a message through it. Render
 * `liveRegion` once, before the first announcement: a region that mounts with its text is not
 * reliably read.
 */
export function useAnnouncer({ politeness = "polite" }: UseAnnouncerOptions = {}) {
  const [message, setMessage] = useState("");
  const toggle = useRef(false);

  // A toggled zero-width space makes screen readers re-announce identical messages.
  const announce = useCallback((next: string) => {
    toggle.current = !toggle.current;
    setMessage(toggle.current ? next : `${next}​`);
  }, []);

  const liveRegion = (
    <VisuallyHidden
      aria-live={politeness}
      aria-atomic="true"
      role={politeness === "assertive" ? "alert" : "status"}
    >
      {message}
    </VisuallyHidden>
  );

  return { announce, liveRegion };
}
