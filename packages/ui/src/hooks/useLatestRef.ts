import { type RefObject, useInsertionEffect, useRef } from "react";

/**
 * A ref holding the last committed `value`, for callbacks that must not re-subscribe when it
 * changes. It updates before any layout effect or its cleanup runs, so those read the new value.
 */
export const useLatestRef = <T>(value: T): Readonly<RefObject<T>> => {
  const ref = useRef(value);

  useInsertionEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
