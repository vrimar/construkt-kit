import { type RefObject, useEffect, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";

const isFormElement = (
  element: Element,
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement =>
  element.matches("textarea, input, select, button");

const formOf = (element: Element) =>
  isFormElement(element) ? element.form : element.closest("form");

export interface FormControlOptions {
  /** The control's element; its `<fieldset>`, and its form unless `input` gives one. */
  elementRef: RefObject<Element | null>;
  /** Called when the form resets, unless the reset was cancelled. */
  onReset: () => void;
  /** The input whose form resets, in place of `elementRef`'s. */
  input?: (() => Element | null | undefined) | undefined;
  /** Called a frame after `onReset`, once the form has reset its inputs to their defaults. */
  afterReset?: (() => void) | undefined;
}

/**
 * Calls `onReset` when the control's form resets uncancelled, and returns whether the native
 * `<fieldset>` around it is disabled.
 */
export function useFormControl({ elementRef, ...options }: FormControlOptions): {
  fieldsetDisabled: boolean;
} {
  const [fieldsetDisabled, setFieldsetDisabled] = useState(false);
  const latest = useLatestRef(options);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    let frame = 0;
    // Listening above the form lets React's delegated `onReset` cancel the reset first.
    const scope = element.getRootNode();
    const handleReset = (event: Event) => {
      if (event.defaultPrevented) return;
      const form = formOf(latest.current.input?.() ?? element);
      if (!form || event.target !== form) return;
      latest.current.onReset();
      if (!latest.current.afterReset) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => latest.current.afterReset?.());
    };
    scope.addEventListener("reset", handleReset, { passive: true });

    const fieldset = element.closest("fieldset");
    const observer = fieldset && new MutationObserver(() => setFieldsetDisabled(fieldset.disabled));
    if (fieldset) {
      observer?.observe(fieldset, { attributes: true, attributeFilter: ["disabled"] });
      setFieldsetDisabled(fieldset.disabled);
    }

    return () => {
      cancelAnimationFrame(frame);
      scope.removeEventListener("reset", handleReset);
      observer?.disconnect();
    };
  }, [elementRef, latest]);

  return { fieldsetDisabled };
}
