import { useEffect, useState } from "react";

import { useLatestRef } from "./useLatestRef";

export function useFocusOnMount(enabled: boolean, focus: () => void): void {
  const [onMount] = useState(enabled);
  const focusRef = useLatestRef(focus);
  useEffect(() => {
    if (!onMount) return;
    const frame = requestAnimationFrame(() => focusRef.current());
    return () => cancelAnimationFrame(frame);
  }, [onMount, focusRef]);
}
