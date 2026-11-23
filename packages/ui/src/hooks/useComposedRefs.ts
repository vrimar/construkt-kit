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

/**
 * One ref callback that attaches a node to every ref and runs their cleanups when it detaches.
 * The node type comes from the first ref; the others need only accept it.
 */
export const useComposedRefs = <T>(
  first: Ref<T> | undefined,
  ...rest: (Ref<NoInfer<T>> | undefined)[]
): RefCallback<T> =>
  useCallback(
    (node: T | null) => {
      const cleanups = [attachRef(first, node), ...rest.map((ref) => attachRef(ref, node))];
      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [first, ...rest],
  );
