import { type ReactNode, type RefObject, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

import { usePortalContainer } from "../primitives/layer";

export interface PortalProps {
  children?: ReactNode;
  /** The element to mount into. @default the nearest `PortalContainer`'s, else the topmost open modal, else `<body>` */
  target?: RefObject<HTMLElement | null> | undefined;
  /** Renders the children in place instead. */
  disabled?: boolean | undefined;
}

/** Mounts its children elsewhere in the document, after the first client render. */
export function Portal({ children, target, disabled = false }: PortalProps) {
  const fallback = usePortalContainer();
  const ref = target ?? fallback;
  const [node, setNode] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- a ref to an element in the same commit is set only now
    if (!disabled) setNode(ref?.current ?? document.body);
  }, [ref, disabled]);

  if (disabled) return children;
  return node && createPortal(children, node);
}
