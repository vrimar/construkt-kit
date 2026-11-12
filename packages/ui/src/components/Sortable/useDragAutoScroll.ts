import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { type RefObject, useEffect } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";

type AutoScrollArgs = Parameters<typeof autoScrollForElements>[0];
type CanScroll = NonNullable<AutoScrollArgs["canScroll"]>;
type FeedbackArgs = Parameters<CanScroll>[0];
type Axis = "vertical" | "horizontal";
type MaxScrollSpeed = "standard" | "fast";

interface DragAutoScrollOptions {
  /** Scroll container to auto-scroll near its edges during a drag. */
  element: Element | null | undefined;
  axis: Axis;
  enabled: boolean;
  maxScrollSpeed?: MaxScrollSpeed;
  /** Whether a drag scrolls `element`. Defaults to every element drag. */
  canScroll?: CanScroll;
}

interface Claim {
  axis: Axis;
  options: Readonly<
    RefObject<{ maxScrollSpeed: MaxScrollSpeed; canScroll: CanScroll | undefined }>
  >;
}

interface SharedRegistration {
  claims: Set<Claim>;
  cleanup: () => void;
}

// pdnd keeps one registration per element, so instances sharing a scroll container share it too.
const registrations = new WeakMap<Element, SharedRegistration>();

const claimFor = (claims: Set<Claim>, args: FeedbackArgs) => {
  for (const claim of claims) {
    if (claim.options.current.canScroll?.(args) ?? true) return claim;
  }
  return undefined;
};

function claimAutoScroll(element: Element, claim: Claim) {
  let shared = registrations.get(element);
  if (!shared) {
    const claims = new Set<Claim>();
    shared = {
      claims,
      cleanup: autoScrollForElements({
        element,
        canScroll: (args) => claimFor(claims, args) !== undefined,
        getAllowedAxis: (args) => claimFor(claims, args)?.axis ?? "all",
        getConfiguration: (args) => ({
          maxScrollSpeed: claimFor(claims, args)?.options.current.maxScrollSpeed ?? "standard",
        }),
      }),
    };
    registrations.set(element, shared);
  }
  const { claims, cleanup } = shared;
  claims.add(claim);
  return () => {
    claims.delete(claim);
    if (claims.size > 0) return;
    cleanup();
    registrations.delete(element);
  };
}

/** Edge auto-scroll; re-binds when the scroll element mounts or changes. */
export function useDragAutoScroll({
  element,
  axis,
  enabled,
  maxScrollSpeed = "standard",
  canScroll,
}: DragAutoScrollOptions) {
  const options = useLatestRef({ maxScrollSpeed, canScroll });

  useEffect(() => {
    if (!enabled || !element) return;
    return claimAutoScroll(element, { axis, options });
  }, [enabled, element, axis, options]);
}
