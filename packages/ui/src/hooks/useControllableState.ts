import { useCallback, useState } from "react";

import { useLatestRef } from "./useLatestRef";

export interface UseControllableStateOptions<T> {
  /** The controlled value; `undefined` leaves the value to local state. */
  value: T | undefined;
  /** The local state's initial value, and the value `reset` restores. */
  defaultValue: T;
  /** Called with every value passed to the setter, controlled or not. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * A value its parent controls through `value` and `onChange`, or leaves to local state that starts
 * at `defaultValue`. The setter writes local state only while uncontrolled and always calls
 * `onChange`; `reset` restores `defaultValue` to uncontrolled local state without calling it. Both
 * functions are stable.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [value: T, setValue: (next: T) => void, reset: () => void] {
  const [localValue, setLocalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const latestRef = useLatestRef({ controlled, defaultValue, onChange });

  const setValue = useCallback(
    (next: T) => {
      if (!latestRef.current.controlled) setLocalValue(next);
      latestRef.current.onChange?.(next);
    },
    [latestRef],
  );

  const reset = useCallback(() => {
    if (!latestRef.current.controlled) setLocalValue(latestRef.current.defaultValue);
  }, [latestRef]);

  return [value !== undefined ? value : localValue, setValue, reset];
}
