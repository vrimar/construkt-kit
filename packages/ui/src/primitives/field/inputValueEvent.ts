/** Sets a form input's value and fires `input`, so React and form libraries see the change. */
export function dispatchInputValueEvent(input: HTMLInputElement | null, value: string) {
  if (!input) return;
  const view = input.ownerDocument.defaultView ?? window;
  // The prototype's setter bypasses React's value tracker, which is what makes React fire `onChange`.
  Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "value")?.set?.call(
    input,
    value,
  );
  input.setAttribute("value", value);
  input.dispatchEvent(new view.Event("input", { bubbles: true }));
}
