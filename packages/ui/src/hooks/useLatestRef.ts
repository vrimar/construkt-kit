import { type RefObject, useLayoutEffect, useRef } from "react";

/** A ref holding the last committed `value`, for callbacks that must not re-subscribe when it changes. */
export const useLatestRef = <T>(value: T): Readonly<RefObject<T>> => {
  const ref = useRef(value);

  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
