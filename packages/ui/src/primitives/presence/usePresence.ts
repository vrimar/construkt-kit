import { useEffect, useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";

import { dataAttr } from "../render";

export type TransitionStatus = "starting" | "ending" | undefined;

export interface Presence {
  /** Whether the popup is in the DOM: while open, and while it animates out. */
  mounted: boolean;
  status: TransitionStatus;
  /** The element whose animations the exit waits for. */
  setElement: (node: HTMLElement | null) => void;
}

export interface PresenceOptions {
  /** Unmounts in the frame `open` turns false when nothing animates out, instead of a frame later. */
  immediate?: boolean | undefined;
  /** Starts `starting` when it mounts open, so it animates in on its first render too. */
  enterOnMount?: boolean | undefined;
}

/** `data-starting-style` and `data-ending-style` for `status`. */
export const presenceAttributes = (status: TransitionStatus) => ({
  "data-starting-style": dataAttr(status === "starting"),
  "data-ending-style": dataAttr(status === "ending"),
});

const finiteAnimations = (element: HTMLElement) =>
  element
    .getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);

/**
 * Mounts a popup while `open` and keeps it mounted until its exit animations finish. The status is
 * `starting` for the first frame after it mounts and `ending` while it animates out, for
 * `data-starting-style` and `data-ending-style`.
 */
export function usePresence(
  open: boolean,
  { immediate = false, enterOnMount = false }: PresenceOptions = {},
): Presence {
  const [mounted, setMounted] = useState(open);
  const [status, setStatus] = useState<TransitionStatus>(() =>
    enterOnMount && open ? "starting" : undefined,
  );
  const [element, setElement] = useState<HTMLElement | null>(null);

  if (open && !mounted) {
    setMounted(true);
    setStatus("starting");
  }
  if (open && status === "ending") setStatus(undefined);
  if (!open && mounted && status !== "ending") setStatus("ending");

  useLayoutEffect(() => {
    if (status !== "starting") return;
    const frame = requestAnimationFrame(() => setStatus(undefined));
    return () => cancelAnimationFrame(frame);
  }, [status]);

  useLayoutEffect(() => {
    if (!immediate || open || !mounted) return;
    if (element && finiteAnimations(element).length > 0) return;
    // oxlint-disable-next-line react/set-state-in-effect -- the unmount must commit before paint
    setMounted(false);
    setStatus(undefined);
  }, [immediate, open, mounted, element]);

  useEffect(() => {
    if (open || !mounted) return;
    let cancelled = false;
    const unmount = () => {
      setMounted(false);
      setStatus(undefined);
    };
    if (!element) {
      unmount();
      return;
    }
    const frame = requestAnimationFrame(() => {
      void Promise.allSettled(
        finiteAnimations(element).map((animation) => animation.finished),
      ).then(() => {
        // A finished animation drops its last keyframe this frame; a later commit paints the popup at rest once.
        if (!cancelled) flushSync(unmount);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [open, mounted, element]);

  return { mounted, status, setElement };
}
