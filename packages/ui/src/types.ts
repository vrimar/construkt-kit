import type { Ref, RefObject } from "react";

/** Convenience type for components that accept a forwarded ref.
 *  Defaults to HTMLDivElement when no element type is specified.
 */
export type WithRef<T, E extends Element = HTMLDivElement> = T & { ref?: Ref<E> };

/** Portal opt-out for overlay content. `HTMLElement | null` matches what `useRef` yields. */
export interface PortalledProps {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement | null>;
}
