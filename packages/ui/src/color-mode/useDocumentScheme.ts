import { useLayoutEffect, useState } from "react";

import type { ResolvedColorMode } from "./ColorModeProvider";

const schemeOf = (element: Element): ResolvedColorMode =>
  element.classList.contains("dark") ? "dark" : "light";

function documentSchemeAgainstScope(element: Element): ResolvedColorMode | undefined {
  const root = element.ownerDocument.documentElement;
  const scope = element.parentElement?.closest(".light, .dark");
  if (!scope || scope === root) return undefined;
  const scheme = schemeOf(root);
  return schemeOf(scope) === scheme ? undefined : scheme;
}

/**
 * The scope class (`light` or `dark`) that makes a top-layer element follow the document's colour
 * mode while it is rendered inside a `.light` or `.dark` scope of the other one; `undefined` when
 * it already follows the document.
 */
export function useDocumentScheme(element: Element | null): ResolvedColorMode | undefined {
  const [scheme, setScheme] = useState<ResolvedColorMode | undefined>(undefined);

  useLayoutEffect(() => {
    if (!element) return;
    const update = () => setScheme(documentSchemeAgainstScope(element));
    update();
    const observer = new MutationObserver(update);
    observer.observe(element.ownerDocument.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [element]);

  return element ? scheme : undefined;
}
