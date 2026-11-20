import {
  type ReactNode,
  type Ref,
  type RefCallback,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { type ChangeDetails } from "../primitives/change";
import {
  PresenceActivity,
  type TransitionStatus,
  presenceAttributes,
  usePresence,
} from "../primitives/presence";
import { dataAttr, openStateAttributes } from "../primitives/render";
import { useMergedRefs } from "../primitives/render/useMergedRefs";

export type CollapsibleChangeReason = "trigger-press";

/** Why a panel was asked to open or close, and a way to keep it as it is. */
export type CollapsibleChangeDetails = ChangeDetails<CollapsibleChangeReason>;

export interface CollapsibleState {
  open: boolean;
  /** Open, or still animating closed. */
  visible: boolean;
  disabled: boolean;
  /** Whether `open` has changed since mount; a panel that mounted open doesn't animate until then. */
  toggled: boolean;
  status: TransitionStatus;
  contentId: string;
  triggerId: string;
  setContentElement: (node: HTMLElement | null) => void;
  /** Asks to flip `open`, as a press on the trigger does. */
  toggle: (event: Event) => void;
}

const CollapsibleContext = createContext<CollapsibleState | null>(null);

export const CollapsibleProvider = CollapsibleContext.Provider;

export function useCollapsibleContext(part: string): CollapsibleState {
  const context = useContext(CollapsibleContext);
  if (!context) throw new Error(`${part} must be placed inside its collapsible's Root or Item.`);
  return context;
}

export interface UseCollapsibleOptions {
  open: boolean;
  disabled: boolean;
  contentId: string;
  triggerId: string;
  onToggle: (event: Event) => void;
}

/** A panel's open state with the presence that keeps it mounted while it animates closed. */
export function useCollapsible({
  open,
  disabled,
  contentId,
  triggerId,
  onToggle,
}: UseCollapsibleOptions): CollapsibleState {
  const presence = usePresence(open);
  const [initialOpen] = useState(open);
  const [toggled, setToggled] = useState(false);
  if (!toggled && open !== initialOpen) setToggled(true);

  return {
    open,
    visible: presence.mounted,
    disabled,
    toggled,
    status: presence.status,
    contentId,
    triggerId,
    setContentElement: presence.setElement,
    toggle: onToggle,
  };
}

export const collapsibleStateAttributes = (open: boolean, disabled: boolean) => ({
  ...openStateAttributes(open),
  "data-disabled": dataAttr(disabled),
});

const finiteAnimations = (element: HTMLElement) =>
  element
    .getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);

/**
 * The panel element's ref. Opening and closing measure the panel into
 * `--collapsible-height` and `--collapsible-width`, which the recipe's keyframes run to and from;
 * a panel at rest open has its animation turned off, so mounting open or being shown again by a
 * hidden ancestor doesn't replay it.
 */
export function useCollapsiblePanel(state: CollapsibleState, ref: Ref<HTMLDivElement> | undefined) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const handledRef = useRef<boolean | undefined>(undefined);
  const panelRef = useMergedRefs<HTMLDivElement>(elementRef, state.setContentElement, ref);
  const { open, toggled } = state;

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const previous = handledRef.current;
    handledRef.current = open;
    if (previous === open) return;

    const rest = () => element.style.setProperty("animation-name", "none");
    rest();
    if (open && !toggled) return;
    element.style.setProperty("--collapsible-height", `${element.scrollHeight}px`);
    element.style.setProperty("--collapsible-width", `${element.scrollWidth}px`);
    element.style.removeProperty("animation-name");
    if (!open) return;

    let cancelled = false;
    let finished = false;
    const frame = requestAnimationFrame(() => {
      void Promise.allSettled(
        finiteAnimations(element).map((animation) => animation.finished),
      ).then(() => {
        if (cancelled) return;
        finished = true;
        rest();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      // An open cut short (Strict Mode's remount, a hidden ancestor) plays again when the effect reruns.
      if (!finished) handledRef.current = undefined;
    };
  }, [open, toggled]);

  return panelRef as RefCallback<HTMLDivElement>;
}

/** The panel element's id and state attributes. */
export const panelAttributes = (state: CollapsibleState) => ({
  id: state.contentId,
  ...collapsibleStateAttributes(state.open, state.disabled),
  ...presenceAttributes(state.status),
});

export interface CollapsiblePresenceProps {
  state: CollapsibleState;
  keepMounted: boolean;
  children: ReactNode;
}

/** Renders a panel while it is open or animating closed, or keeps it hidden with `keepMounted`. */
export const CollapsiblePresence = ({ state, keepMounted, children }: CollapsiblePresenceProps) => (
  <PresenceActivity
    mounted={state.visible}
    keepMounted={keepMounted}
  >
    {children}
  </PresenceActivity>
);
