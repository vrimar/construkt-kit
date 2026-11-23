interface HeldStyle {
  holders: number;
  value: string;
  saved: string;
  priority: string;
}

const heldStyles = new WeakMap<HTMLElement, Map<string, HeldStyle>>();

/** Holds an inline style until its last holder releases, then restores the prior value unless it changed meanwhile. */
export function holdStyle(element: HTMLElement, property: string, value: string): () => void {
  let held = heldStyles.get(element);
  if (!held) {
    held = new Map();
    heldStyles.set(element, held);
  }
  let entry = held.get(property);
  if (!entry) {
    const { style } = element;
    entry = {
      holders: 0,
      value,
      saved: style.getPropertyValue(property),
      priority: style.getPropertyPriority(property),
    };
    held.set(property, entry);
    style.setProperty(property, value);
  }
  entry.holders += 1;
  const styles = held;
  const current = entry;

  return () => {
    current.holders -= 1;
    if (current.holders > 0) return;
    styles.delete(property);
    const { style } = element;
    if (style.getPropertyValue(property) !== current.value) return;
    if (current.saved) style.setProperty(property, current.saved, current.priority);
    else style.removeProperty(property);
    if (style.length === 0) element.removeAttribute("style");
  };
}
