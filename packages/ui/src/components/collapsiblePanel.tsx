import { type MouseEvent, type Ref, useLayoutEffect, useRef, useState } from "react";

import { isSafari } from "../foundations/platform";
import { useComposedRefs } from "../hooks/useComposedRefs";
import {
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../hooks/useRenderedParts";
import { type ChangeDetails } from "../primitives/change";
import { type TransitionStatus, presenceAttributes, usePresence } from "../primitives/presence";
import { dataAttr, openStateAttributes } from "../primitives/render";
import { createPartContext } from "./partContext";

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
  /** The ids the trigger and content render with unless given their own. */
  ids: { content: string; trigger: string };
  /** The rendered trigger's id. */
  triggerId: string | undefined;
  /** The rendered content's id. */
  contentId: string | undefined;
  reportRendered: ReportRendered<"trigger" | "content">;
  setContentElement: (node: HTMLElement | null) => void;
  /** Asks to flip `open`, as a press on the trigger does. */
  toggle: (event: Event) => void;
}

export const [CollapsibleContext, useCollapsibleContext] = createPartContext<CollapsibleState>(
  "its collapsible's Root or Item",
);

export const CollapsibleProvider = CollapsibleContext.Provider;

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
  const [rendered, reportRendered] = useRenderedParts<"trigger" | "content">();
  const [initialOpen] = useState(open);
  const [toggled, setToggled] = useState(false);
  if (!toggled && open !== initialOpen) setToggled(true);

  return {
    open,
    visible: presence.mounted,
    disabled,
    toggled,
    status: presence.status,
    ids: { content: contentId, trigger: triggerId },
    triggerId: rendered.trigger,
    contentId: rendered.content,
    reportRendered,
    setContentElement: presence.setElement,
    toggle: onToggle,
  };
}

export const collapsibleStateAttributes = (open: boolean, disabled: boolean) => ({
  ...openStateAttributes(open),
  "data-disabled": dataAttr(disabled),
});

/**
 * The trigger's props, with `id` when given: it names and controls the panel, and a press toggles it
 * unless prevented.
 */
export const useCollapsibleTriggerProps = (
  state: CollapsibleState,
  { id, render }: { id?: string | undefined; render?: unknown },
) => ({
  id: useReportRendered(state.reportRendered, "trigger", id ?? state.ids.trigger),
  type: render ? undefined : ("button" as const),
  disabled: state.disabled,
  "aria-controls": state.visible ? state.contentId : undefined,
  "aria-expanded": state.open,
  ...collapsibleStateAttributes(state.open, state.disabled),
  onClick(event: MouseEvent<HTMLElement>) {
    if (event.defaultPrevented || state.disabled) return;
    if (isSafari()) event.currentTarget.focus();
    state.toggle(event.nativeEvent);
  },
});

export const collapsibleIndicatorProps = (state: CollapsibleState) => ({
  "aria-hidden": true,
  ...collapsibleStateAttributes(state.open, state.disabled),
});

const finiteAnimations = (element: HTMLElement) =>
  element
    .getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);

/**
 * The panel element's ref, id, `id` when given, and state attributes. Opening and closing measure the panel into
 * `--collapsible-height` and `--collapsible-width`, which the recipe's keyframes run to and from;
 * a panel at rest open has its animation turned off, so mounting open or being shown again by a
 * hidden ancestor doesn't replay it.
 */
export function useCollapsibleContent(
  state: CollapsibleState,
  ref: Ref<HTMLDivElement> | undefined,
  id: string | undefined,
) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const handledRef = useRef<boolean | undefined>(undefined);
  const panelRef = useComposedRefs(elementRef, state.setContentElement, ref);
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

  const contentId = useReportRendered(state.reportRendered, "content", id ?? state.ids.content);

  return {
    ref: panelRef,
    id: contentId,
    ...collapsibleStateAttributes(state.open, state.disabled),
    ...presenceAttributes(state.status),
  };
}
