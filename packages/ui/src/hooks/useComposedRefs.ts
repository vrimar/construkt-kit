import { type Ref, type RefCallback, useCallback } from "react";

const attachRef = <T>(ref: Ref<T> | undefined, node: T | null): (() => void) => {
  if (typeof ref === "function") {
    const cleanup = ref(node);
    return typeof cleanup === "function" ? cleanup : () => ref(null);
  }
  if (ref) ref.current = node;
  return () => {
    if (ref) ref.current = null;
  };
};

export const useComposedRefs = <T>(
  first: Ref<T> | undefined,
  second: Ref<T> | undefined,
): RefCallback<T> =>
  useCallback(
    (node: T | null) => {
      const cleanups = [attachRef(first, node), attachRef(second, node)];
      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    },
    [first, second],
  );
