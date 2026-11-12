import { useCallback, useRef, useState } from "react";

import { VisuallyHidden } from "#styled-system/jsx";

/** A polite live region and a function that announces a message through it. */
export function useAnnouncer() {
  const [message, setMessage] = useState("");
  const toggle = useRef(false);

  // A toggled zero-width space makes screen readers re-announce identical messages.
  const announce = useCallback((next: string) => {
    toggle.current = !toggle.current;
    setMessage(toggle.current ? next : `${next}​`);
  }, []);

  const liveRegion = (
    <VisuallyHidden
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {message}
    </VisuallyHidden>
  );

  return { announce, liveRegion };
}
