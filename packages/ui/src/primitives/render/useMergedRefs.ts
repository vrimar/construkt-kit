import { type Ref, type RefCallback, useMemo } from "react";

type MaybeRef<T> = Ref<T> | null | undefined;

export function useMergedRefs<T>(
  a: MaybeRef<T>,
  b: MaybeRef<T>,
  c?: MaybeRef<T>,
): RefCallback<T> | null {
  return useMemo(
    () => (a == null && b == null && c == null ? null : mergeRefs([a, b, c])),
    [a, b, c],
  );
}

function mergeRefs<T>(refs: MaybeRef<T>[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => attach(ref, node));
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  };
}

function attach<T>(ref: MaybeRef<T>, node: T | null): () => void {
  if (typeof ref === "function") {
    const cleanup = ref(node);
    return typeof cleanup === "function" ? cleanup : () => ref(null);
  }
  if (ref) ref.current = node;
  return () => {
    if (ref) ref.current = null;
  };
}
