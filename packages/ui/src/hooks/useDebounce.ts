import { type DependencyList, useEffect } from "react";

import { useLatestRef } from "./useLatestRef";

/** Calls the latest `fn` once `ms` have passed since mount or since `deps` or `ms` last changed. */
export function useDebounce(fn: () => void, ms: number, deps: DependencyList): void {
  const fnRef = useLatestRef(fn);

  useEffect(() => {
    const timer = setTimeout(() => fnRef.current(), ms);
    return () => clearTimeout(timer);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [fnRef, ms, ...deps]);
}
