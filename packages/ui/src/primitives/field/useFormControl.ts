import { type RefObject, useEffect, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";

const isFormElement = (
  element: Element,
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement =>
  element.matches("textarea, input, select, button");

const formOf = (element: Element) =>
  isFormElement(element) ? element.form : element.closest("form");

/**
 * Calls `onReset` when the form `input()` (else `elementRef`) submits to resets uncancelled, and
 * returns whether the fieldset around `elementRef` is disabled.
 */
export function useFormControl(
  elementRef: RefObject<Element | null>,
  onReset: () => void,
  input?: () => Element | null | undefined,
): { fieldsetDisabled: boolean } {
  const [fieldsetDisabled, setFieldsetDisabled] = useState(false);
  const latest = useLatestRef({ onReset, input });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    // Listening above the form lets React's delegated `onReset` cancel the reset first.
    const scope = element.getRootNode();
    const handleReset = (event: Event) => {
      if (event.defaultPrevented) return;
      const form = formOf(latest.current.input?.() ?? element);
      if (form && event.target === form) latest.current.onReset();
    };
    scope.addEventListener("reset", handleReset, { passive: true });

    const fieldset = element.closest("fieldset");
    const observer = fieldset && new MutationObserver(() => setFieldsetDisabled(fieldset.disabled));
    if (fieldset) {
      observer?.observe(fieldset, { attributes: true, attributeFilter: ["disabled"] });
      setFieldsetDisabled(fieldset.disabled);
    }

    return () => {
      scope.removeEventListener("reset", handleReset);
      observer?.disconnect();
    };
  }, [elementRef, latest]);

  return { fieldsetDisabled };
}
