const handoffs = new WeakMap<Element, HTMLElement>();

export function recordFocusHandoff(overlay: Element | null, target: HTMLElement | null): void {
  if (overlay && target) handoffs.set(overlay, target);
}

function closestHandoff(element: Element): HTMLElement | null {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const target = handoffs.get(node);
    if (target) return target;
  }
  return null;
}

/** `element`, or once it left the page with an overlay, where that overlay handed focus back. */
export function resolveReturnTarget(element: HTMLElement | null): HTMLElement | null {
  const visited = new Set<Element>();
  let target = element;
  while (target && !target.isConnected && !visited.has(target)) {
    visited.add(target);
    target = closestHandoff(target);
  }
  return target?.isConnected ? target : null;
}
