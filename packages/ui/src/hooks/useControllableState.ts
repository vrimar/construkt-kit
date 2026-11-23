import { useCallback, useReducer, useRef, useState } from "react";

import { useLatestRef } from "./useLatestRef";

export interface UseControllableStateOptions<T> {
  /** The controlled value; `undefined` leaves the value to local state. */
  value: T | undefined;
  /** The local state's initial value, and the value `reset` restores. */
  defaultValue: T;
  /** Called with every value passed to the setter, controlled or not. */
  onChange?: ((value: T) => void) | undefined;
  /** Whether two values are the same, so `reset` leaves an equal one alone. @default Object.is */
  isEqual?: ((a: T, b: T) => boolean) | undefined;
}

/**
 * A value its parent controls through `value` and `onChange`, or leaves to local state that starts
 * at `defaultValue`. The setter writes local state only while uncontrolled and always calls
 * `onChange`; `reset` restores `defaultValue` to uncontrolled local state and calls `onChange` when
 * that changes it. Both functions are stable.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
  isEqual = Object.is,
}: UseControllableStateOptions<T>): [value: T, setValue: (next: T) => void, reset: () => void] {
  const [localValue, setLocalValue] = useState(defaultValue);
  // Written with local state, so a reset in the same tick as a write sees it.
  const localRef = useRef(localValue);
  const controlled = value !== undefined;
  const latestRef = useLatestRef({ controlled, defaultValue, onChange, isEqual });

  const setValue = useCallback(
    (next: T) => {
      if (!latestRef.current.controlled) {
        localRef.current = next;
        setLocalValue(next);
      }
      latestRef.current.onChange?.(next);
    },
    [latestRef],
  );

  const reset = useCallback(() => {
    const latest = latestRef.current;
    if (latest.controlled || latest.isEqual(localRef.current, latest.defaultValue)) return;
    localRef.current = latest.defaultValue;
    setLocalValue(latest.defaultValue);
    latest.onChange?.(latest.defaultValue);
  }, [latestRef]);

  return [value !== undefined ? value : localValue, setValue, reset];
}

/**
 * `useControllableState` whose setter also re-renders, so state copied from the value ahead of the
 * owner's answer re-syncs when a controlled owner keeps its value.
 */
export function useResyncedControllableState<T>(
  options: UseControllableStateOptions<T>,
): [value: T, setValue: (next: T) => void, reset: () => void] {
  const [value, setValue, reset] = useControllableState(options);
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const setAndRerender = useCallback(
    (next: T) => {
      setValue(next);
      rerender();
    },
    [setValue],
  );
  return [value, setAndRerender, reset];
}
