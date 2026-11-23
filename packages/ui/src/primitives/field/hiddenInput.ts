import { useLayoutEffect, useRef } from "react";

import { visuallyHidden } from "#styled-system/patterns";

import { useLatestRef } from "../../hooks/useLatestRef";
import { dispatchInputValueEvent } from "./inputValueEvent";

/** Hides a native control from sight only, so it still takes focus and shows the browser's validation. */
export const hiddenInputClass = visuallyHidden();

/** A form-backing input's hiding: out of sight, the tab order and the accessibility tree. */
export const hiddenFormInputProps = {
  className: hiddenInputClass,
  "aria-hidden": true,
  tabIndex: -1,
} as const;

/**
 * Writes `value` into the form-backing input `getInput` returns whenever it changes, firing
 * `input` as typing would. An array writes each entry into `getInput(index)`.
 */
export function useHiddenInputValue(
  getInput: (index: number) => HTMLInputElement | null | undefined,
  value: string | readonly string[],
) {
  const values = typeof value === "string" ? [value] : value;
  const key = JSON.stringify(values);
  const syncedKey = useRef(key);
  const latest = useLatestRef({ getInput, values });

  useLayoutEffect(() => {
    if (syncedKey.current === key) return;
    syncedKey.current = key;
    const current = latest.current;
    current.values.forEach((entry, index) =>
      dispatchInputValueEvent(current.getInput(index) ?? null, entry),
    );
  }, [key, latest]);
}
