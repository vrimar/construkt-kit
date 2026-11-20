function copyNode(node: HTMLElement) {
  const doc = node.ownerDocument;
  const selection = doc.defaultView?.getSelection();
  if (!selection) throw new Error("No selection to copy from");
  selection.removeAllRanges();
  const range = doc.createRange();
  range.selectNodeContents(node);
  selection.addRange(range);
  const copied = doc.execCommand("copy");
  selection.removeAllRanges();
  if (!copied) throw new Error("The browser refused to copy");
}

/** Writes `text` to the clipboard, falling back to a selection copy; rejects if neither works. */
export async function copyText(container: HTMLElement, text: string): Promise<void> {
  const doc = container.ownerDocument;
  const clipboard = doc.defaultView?.navigator.clipboard;
  if (clipboard?.writeText !== undefined) {
    const written = await clipboard.writeText(text).then(
      () => true,
      () => false,
    );
    if (written) return;
  }

  const node = doc.createElement("pre");
  Object.assign(node.style, {
    width: "1px",
    height: "1px",
    position: "fixed",
    top: "5px",
    // Under an inherited `user-select: none`, the copy succeeds with nothing selected.
    userSelect: "text",
    webkitUserSelect: "text",
  });
  node.textContent = text;
  container.appendChild(node);
  try {
    copyNode(node);
  } finally {
    node.remove();
  }
}
