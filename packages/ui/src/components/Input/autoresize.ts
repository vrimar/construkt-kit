/** Grows `textarea` with its content up to its `max-height`, and returns a cleanup. */
export function autoresizeTextarea(textarea: HTMLTextAreaElement): () => void {
  const view = textarea.ownerDocument.defaultView ?? window;
  const style = view.getComputedStyle(textarea);

  const resize = () => {
    requestAnimationFrame(() => {
      textarea.style.height = "auto";
      let height =
        style.boxSizing === "content-box"
          ? textarea.scrollHeight - (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom))
          : textarea.scrollHeight +
            parseFloat(style.borderTopWidth) +
            parseFloat(style.borderBottomWidth);

      if (style.maxHeight !== "none" && height > parseFloat(style.maxHeight)) {
        if (style.overflowY === "hidden") textarea.style.overflowY = "scroll";
        height = parseFloat(style.maxHeight);
      } else if (style.overflowY !== "hidden") {
        textarea.style.overflowY = "hidden";
      }
      textarea.style.height = `${height}px`;
    });
  };

  textarea.addEventListener("input", resize);
  const form = textarea.form;
  form?.addEventListener("reset", resize);

  // React writes a controlled value through the element's own descriptor, which fires no event.
  const own = Object.getOwnPropertyDescriptor(textarea, "value");
  const descriptor = own?.set
    ? own
    : Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea), "value");
  let tracking = true;
  const wrapped = descriptor?.set && {
    ...descriptor,
    set(this: HTMLTextAreaElement, next: string) {
      descriptor.set?.call(this, next);
      if (tracking) resize();
    },
  };
  if (wrapped) Object.defineProperty(textarea, "value", wrapped);

  const resizeObserver = new view.ResizeObserver(() => requestAnimationFrame(resize));
  resizeObserver.observe(textarea);
  const attributeObserver = new view.MutationObserver(resize);
  attributeObserver.observe(textarea, {
    attributes: true,
    attributeFilter: ["rows", "placeholder"],
  });
  const fonts = textarea.ownerDocument.fonts;
  fonts?.addEventListener("loadingdone", resize);

  return () => {
    textarea.removeEventListener("input", resize);
    form?.removeEventListener("reset", resize);
    fonts?.removeEventListener("loadingdone", resize);
    resizeObserver.disconnect();
    attributeObserver.disconnect();
    tracking = false;
    // Restoring under a wrapper defined over ours would drop it; ours then stays, inert.
    if (wrapped && Object.getOwnPropertyDescriptor(textarea, "value")?.set === wrapped.set) {
      if (own) Object.defineProperty(textarea, "value", own);
      else Reflect.deleteProperty(textarea, "value");
    }
  };
}
