import {
  type ReactNode,
  type RefObject,
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import { getTopmostModal, subscribeLayers } from "./layerStack";

const PortalContainerContext = createContext<RefObject<HTMLElement | null> | undefined>(undefined);

/** Portals rendered inside `children` mount into `target` instead of `<body>`. */
export function PortalContainer({
  target,
  children,
}: {
  target: RefObject<HTMLElement | null>;
  children?: ReactNode;
}) {
  return <PortalContainerContext value={target}>{children}</PortalContainerContext>;
}

const noModal = () => null;

/**
 * The element portals should mount into: the nearest `PortalContainer`'s, else the topmost open
 * modal `<dialog>`, whose `showModal()` leaves everything outside it inert, else `undefined` for
 * `<body>`.
 */
export function usePortalContainer(): RefObject<HTMLElement | null> | undefined {
  const own = useContext(PortalContainerContext);
  const modal = useSyncExternalStore(subscribeLayers, getTopmostModal, noModal);
  const fallback = useMemo(() => (modal ? { current: modal } : undefined), [modal]);
  return own ?? fallback;
}
