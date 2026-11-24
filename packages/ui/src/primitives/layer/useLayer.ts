import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import {
  type DismissReason,
  type Layer,
  countNestedModals,
  hasOpenOverlay,
  pushLayer,
  registerEscapeFallback,
  registerLayerBranch,
  subscribeLayers,
} from "./layerStack";

export const LayerContext = createContext<Layer | null>(null);

export interface UseLayerOptions {
  contains: (target: Node) => boolean;
  dismiss: (reason: DismissReason, event: Event) => boolean;
  /** The `<dialog>` of a modal layer, shown with `showModal()` before the layer opens. */
  modal?: (() => HTMLElement | null) | undefined;
  /**
   * The popup's element, for a layer that counts toward `hasOpenOverlay` and takes a press outside
   * it from the layers it is nested in, whether or not it closes. A tooltip, hover card or inline
   * editor leaves it out.
   */
  overlay?: (() => Element | null) | undefined;
}

/**
 * Keeps a layer on the stack while `open`, nested in the layer of the nearest `LayerContext`.
 * Provide the returned layer through `LayerContext` to the popup's content.
 */
export function useLayer(open: boolean, options: UseLayerOptions): Layer | null {
  const parent = useContext(LayerContext);
  const optionsRef = useLatestRef(options);
  const [layer, setLayer] = useState<Layer | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const next: Layer = {
      parent,
      overlayElement: optionsRef.current.overlay
        ? () => optionsRef.current.overlay?.() ?? null
        : null,
      modalElement: () => optionsRef.current.modal?.() ?? null,
      contains: (target) => optionsRef.current.contains(target),
      dismiss: (reason, event) => optionsRef.current.dismiss(reason, event),
    };
    setLayer(next);
    const pop = pushLayer(next);
    return () => {
      pop();
      setLayer(null);
    };
  }, [open, parent, optionsRef]);

  return layer;
}

/**
 * While `enabled`, offers Escape to `handle` when no open layer sits above the one it renders in,
 * for a control that isn't a layer itself, such as a selection's action bar.
 */
export function useEscapeFallback(
  enabled: boolean,
  handle: (event: KeyboardEvent) => boolean,
): void {
  const scope = useContext(LayerContext);
  const handleRef = useLatestRef(handle);
  useLayoutEffect(() => {
    if (!enabled) return;
    return registerEscapeFallback(scope, (event) => handleRef.current(event));
  }, [enabled, scope, handleRef]);
}

/**
 * Calls `onExitComplete` once `exited`, after `open` turned false: once the overlay has left the
 * page and handed focus back. Opening again first cancels it.
 */
export function useOverlayExit(open: boolean, exited: boolean, onExitComplete?: () => void): void {
  const onExitCompleteRef = useLatestRef(onExitComplete);
  const closingRef = useRef(false);
  const wasOpenRef = useRef(open);

  useLayoutEffect(() => {
    if (wasOpenRef.current && !open) closingRef.current = true;
    else if (open) closingRef.current = false;
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (open || !exited || !closingRef.current) return;
    closingRef.current = false;
    onExitCompleteRef.current?.();
  }, [open, exited, onExitCompleteRef]);
}

const noOverlay = () => false;

/** Whether a popup, menu or dialog is open, leaving out any inside `except` or holding it. */
export function useHasOpenOverlay(except?: Element | null): boolean {
  return useSyncExternalStore(subscribeLayers, () => hasOpenOverlay(except), noOverlay);
}

/** Keeps `element` registered as a layer branch while it is mounted. */
export function useLayerBranch(element: Element | null): void {
  useLayoutEffect(() => (element ? registerLayerBranch(element) : undefined), [element]);
}

const noModals = () => 0;

/** How many open modal layers are nested in `layer`, kept current as layers open and close. */
export function useNestedModalCount(layer: Layer | null): number {
  return useSyncExternalStore(
    subscribeLayers,
    () => (layer ? countNestedModals(layer) : 0),
    noModals,
  );
}
