import { useCallback, useEffect, useRef, useState } from "react";

import { VisuallyHidden } from "#styled-system/jsx";

// VoiceOver on Safari misses changes to a region in its first moments in the DOM.
const INITIAL_REGION_DELAY = 200;
const MIN_REGION_DELAY = 100;

export interface UseAnnouncerOptions {
  /** `"assertive"` interrupts what the screen reader is saying. Defaults to `"polite"`. */
  politeness?: "polite" | "assertive";
}

/**
 * A visually hidden live region and `announce(message, delay?)`, which puts `message` in it after
 * `delay` ms, 100ms at least, unless a newer message or `cancel()` comes first. Render `liveRegion`
 * once, inside the component and before the first announcement: a region that mounts with its text
 * is not reliably read, and one outside a modal around the component is inert.
 */
export function useAnnouncer({ politeness = "polite" }: UseAnnouncerOptions = {}) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const readyAt = useRef(0);

  useEffect(() => {
    readyAt.current = Date.now() + INITIAL_REGION_DELAY;
    return () => clearTimeout(timer.current);
  }, []);

  const cancel = useCallback(() => clearTimeout(timer.current), []);

  // Clearing the region first makes screen readers announce a message equal to the last one.
  const announce = useCallback((next: string, delay = 0) => {
    clearTimeout(timer.current);
    setMessage("");
    timer.current = setTimeout(
      () => setMessage(next),
      Math.max(delay, MIN_REGION_DELAY, readyAt.current - Date.now()),
    );
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

  return { announce, liveRegion, cancel };
}
