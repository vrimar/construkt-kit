import { useCallback, useEffect, useRef, useState } from "react";

import { VisuallyHidden } from "#styled-system/jsx";

// VoiceOver on Safari misses changes to a region in its first moments in the DOM.
const INITIAL_REGION_DELAY = 200;
const MIN_REGION_DELAY = 100;

/** A live region to render inside the component, so a modal around it doesn't make it inert. */
export function useLiveRegion(level: "polite" | "assertive") {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const readyAt = useRef(0);

  useEffect(() => {
    readyAt.current = Date.now() + INITIAL_REGION_DELAY;
    return () => clearTimeout(timer.current);
  }, []);

  const cancel = useCallback(() => clearTimeout(timer.current), []);
  const announce = useCallback((next: string, delay = 0) => {
    clearTimeout(timer.current);
    setMessage("");
    timer.current = setTimeout(
      () => setMessage(next),
      Math.max(delay, MIN_REGION_DELAY, readyAt.current - Date.now()),
    );
  }, []);

  const region = (
    <VisuallyHidden
      aria-live={level}
      aria-atomic="true"
      role={level === "assertive" ? "alert" : "status"}
    >
      {message}
    </VisuallyHidden>
  );
  return [region, announce, cancel] as const;
}
