const VISUAL_PROPERTIES = [
  "box-sizing",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-size",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-variant-caps",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-weight",
  "letter-spacing",
  "margin-left",
  "margin-right",
  "padding-left",
  "padding-right",
  "text-indent",
  "text-transform",
] as const;

/** Sizes `input` to its text by measuring a hidden copy of it, and returns a cleanup. */
export function autoresizeInput(input: HTMLInputElement): () => void {
  const doc = input.ownerDocument;
  const view = doc.defaultView ?? window;
  const style = view.getComputedStyle(input);
  const ghost = doc.createElement("div");
  ghost.style.cssText =
    "display:inline-block;height:0;overflow:hidden;position:absolute;top:0;visibility:hidden;white-space:nowrap;";
  for (const property of VISUAL_PROPERTIES) {
    ghost.style.setProperty(property, style.getPropertyValue(property));
  }
  ghost.style.borderLeft = `${style.borderLeftWidth} solid`;
  ghost.style.borderRight = `${style.borderRightWidth} solid`;
  doc.body.appendChild(ghost);

  const resize = () => {
    view.requestAnimationFrame(() => {
      ghost.textContent = input.value;
      input.style.setProperty("width", view.getComputedStyle(ghost).width);
    });
  };
  resize();
  input.addEventListener("input", resize);
  input.addEventListener("change", resize);

  return () => {
    ghost.remove();
    input.removeEventListener("input", resize);
    input.removeEventListener("change", resize);
  };
}
