import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Stack, createSlotRecipeContext } from "#styled-system/jsx";
import { toast as toastRecipe } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import { usePointerDrag } from "../../hooks/usePointerDrag";
import {
  type SwipeDirection,
  isNoDragTarget,
  rubberBand,
  swipeDisplacement,
} from "../../primitives/drag";
import { subscribeLayers, useLayerBranch, useTopLayerPopover } from "../../primitives/layer";
import { useLocale } from "../../primitives/locale";
import { usePresence } from "../../primitives/presence";
import { dataAttr, openStateAttributes, renderable } from "../../primitives/render";
import { createCloseTrigger } from "../closeTrigger";
import { Icon } from "../Icon";
import { Portal } from "../Portal";
import { Spinner } from "../Spinner";
import { statusIcons } from "../statusIcons";
import { type ToastPlacement, toastRegionLabel } from "./toastRegion";
import { type ToastEntry, type ToastStore, createToastStore, getToastDuration } from "./toastStore";

const { withProvider, withContext } = createSlotRecipeContext(toastRecipe);

const Group = withProvider(renderable.div, "group");
const Root = withProvider(renderable.div, "root");
const Indicator = withContext(Icon, "indicator");
const Title = withContext(renderable.div, "title");
const Description = withContext(renderable.div, "description");
const ActionTrigger = withContext(renderable.button, "actionTrigger");
const CloseTrigger = createCloseTrigger(withContext(renderable.button, "closeTrigger"));

const store = createToastStore({ max: 5 });

/** Shows, updates and dismisses the toasts that `<Toaster />` renders. */
export const toaster: ToastStore = store;

const SWIPE_THRESHOLD = 40;
const REVERSE_CANCEL_THRESHOLD = 10;
const SWIPE_IGNORE = 'button, a, input, textarea, [role="button"]';

interface Countdown {
  key: string;
  remaining: number;
}

interface ToasterGroup {
  entered: Set<number>;
  countdowns: Map<number, Countdown>;
  setHeight: (instance: number, height: number) => void;
  remove: (id: string) => void;
  moveFocusFrom: (root: HTMLElement, focusVisible: boolean) => void;
  resumeIfIdle: () => void;
}

const isPageHidden = () => document.visibilityState === "hidden";

function raise(group: HTMLElement) {
  // A modal it was portalled into can unmount, and its layer change notify, before the portal moves it.
  if (!group.isConnected || group.contains(group.ownerDocument.activeElement)) return;
  group.hidePopover();
  group.showPopover();
}

function findOpenToast(roots: Element[], from: number, step: number) {
  for (let index = from; index >= 0 && index < roots.length; index += step) {
    const root = roots[index];
    if (root instanceof HTMLElement && root.hasAttribute("data-open")) return root;
  }
  return null;
}

export interface ToasterProps {
  /**
   * Where the toasts stack: `bottom-end` keeps them off controls along the top of the page.
   * @default "top-end"
   */
  placement?: ToastPlacement | undefined;
}

/**
 * Renders the toasts `toaster` shows, stacked at `placement` in the viewport, or in the topmost
 * open modal so they stay interactive while it is.
 */
export function Toaster({ placement = "top-end" }: ToasterProps = {}) {
  const { toasts, expanded } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const { dir } = useLocale();

  const [group, showGroup] = useTopLayerPopover<HTMLDivElement>();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useComposedRefs(showGroup, groupRef);
  useLayerBranch(group);

  const [heights, setHeights] = useState<ReadonlyMap<number, number>>(() => new Map());
  const interaction = useRef({
    lastFocused: null as HTMLElement | null,
    focusWithin: false,
    pointerWithin: false,
    pointerX: 0,
    pointerY: 0,
    ignoreMouseFrame: 0,
    settling: 0,
    unsettled: false,
    leaving: false,
  });

  const api = useMemo(() => {
    const state = interaction.current;
    const trackPointer = (event: Pick<MouseEvent, "clientX" | "clientY">) => {
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
    };
    const unsettled = () => Boolean(state.ignoreMouseFrame) || state.leaving || state.unsettled;
    // The stack can slide under a resting pointer without the browser moving its hover there.
    const watchPointer = (event: PointerEvent) => {
      trackPointer(event);
      if (unsettled() || groupRef.current?.contains(event.target as Node)) return;
      pointerLeave();
    };
    const releasePointer = () => {
      state.pointerWithin = false;
      document.removeEventListener("pointermove", watchPointer, true);
    };
    const restoreFocus = () => {
      state.lastFocused?.focus({ preventScroll: true });
      state.lastFocused = null;
    };
    const resumeIfIdle = () => {
      if (isPageHidden() || state.pointerWithin || state.focusWithin) return;
      store.resume();
    };
    const pointerEnter = (event: MouseEvent) => {
      trackPointer(event);
      if (state.ignoreMouseFrame) return;
      if (!state.pointerWithin) {
        document.addEventListener("pointermove", watchPointer, { capture: true, passive: true });
      }
      state.pointerWithin = true;
      store.expand();
      store.pause();
    };
    const pointerLeave = () => {
      releasePointer();
      store.collapse();
      resumeIfIdle();
      if (!state.focusWithin) restoreFocus();
    };
    const settleAfterRemoval = () => {
      cancelAnimationFrame(state.ignoreMouseFrame);
      const settling = ++state.settling;
      state.unsettled = true;
      state.ignoreMouseFrame = requestAnimationFrame(() => {
        state.ignoreMouseFrame = 0;
        const node = groupRef.current;
        const moving = node ? [...node.children].flatMap((root) => root.getAnimations()) : [];
        void Promise.allSettled(moving.map((animation) => animation.finished)).then(() => {
          if (settling !== state.settling) return;
          state.unsettled = false;
          if (!node || state.leaving || !state.pointerWithin) return;
          const under = document.elementFromPoint(state.pointerX, state.pointerY);
          if (!node.contains(under)) pointerLeave();
        });
      });
    };

    const toasterGroup: ToasterGroup = {
      entered: new Set(),
      countdowns: new Map(),
      setHeight: (instance, height) =>
        setHeights((previous) =>
          previous.get(instance) === height ? previous : new Map(previous).set(instance, height),
        ),
      remove: (id) => {
        store.remove(id);
        settleAfterRemoval();
      },
      moveFocusFrom: (root, focusVisible) => {
        const roots = [...(groupRef.current?.children ?? [])];
        const index = roots.indexOf(root);
        const next = focusVisible
          ? (findOpenToast(roots, index + 1, 1) ?? findOpenToast(roots, index - 1, -1))
          : null;
        if (next) next.focus({ preventScroll: true });
        else if (focusVisible && state.lastFocused) restoreFocus();
        else if (root.ownerDocument.activeElement instanceof HTMLElement) {
          root.ownerDocument.activeElement.blur();
        }
      },
      resumeIfIdle,
    };

    return {
      group: toasterGroup,
      onMouseEnter: pointerEnter,
      onMouseMove: pointerEnter,
      // A leaving toast moves out from under the pointer, so where it went is decided once the stack settles.
      onMouseLeave: (event: MouseEvent) => {
        trackPointer(event);
        if (!unsettled()) pointerLeave();
      },
      onFocus: (event: FocusEvent<HTMLDivElement>) => {
        if (!state.focusWithin) {
          state.focusWithin = true;
          state.lastFocused =
            event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null;
        }
        store.expand();
        store.pause();
      },
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        const to = event.relatedTarget as Node | null;
        if (!state.focusWithin || event.currentTarget.contains(to)) return;
        queueMicrotask(() => {
          state.focusWithin = false;
          if (to) state.lastFocused = null;
          if (state.pointerWithin) return;
          store.collapse();
          resumeIfIdle();
          restoreFocus();
        });
      },
      reset: () => {
        state.focusWithin = false;
        releasePointer();
        state.lastFocused = null;
      },
      dispose: () => {
        cancelAnimationFrame(state.ignoreMouseFrame);
        state.settling += 1;
        state.unsettled = false;
        releasePointer();
      },
    };
  }, []);

  useEffect(() => api.dispose, [api]);

  useEffect(
    () =>
      store.subscribe(() => {
        const shown = new Set(store.getSnapshot().toasts.map((toast) => toast.instance));
        setHeights((previous) => {
          const kept = [...previous].filter(([instance]) => shown.has(instance));
          return kept.length === previous.size ? previous : new Map(kept);
        });
      }),
    [],
  );

  useLayoutEffect(() => {
    interaction.current.leaving = toasts.some((toast) => toast.closing);
  }, [toasts]);

  useEffect(() => {
    const shown = new Set(toasts.map((toast) => toast.instance));
    const { entered, countdowns } = api.group;
    for (const instance of entered) if (!shown.has(instance)) entered.delete(instance);
    for (const instance of countdowns.keys()) if (!shown.has(instance)) countdowns.delete(instance);
  }, [api, toasts]);

  useEffect(() => {
    if (!group) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.altKey && event.code === "KeyT") queueMicrotask(() => group.focus());
    };
    document.addEventListener("keydown", onKeyDown, true);
    const unsubscribe = subscribeLayers(() => raise(group));
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      unsubscribe();
    };
  }, [group]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (isPageHidden()) store.pause();
      else api.group.resumeIfIdle();
    };
    if (isPageHidden()) store.pause();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [api]);

  const count = toasts.length;
  const shownCount = useRef(count);
  useLayoutEffect(() => {
    if (group && count > shownCount.current) raise(group);
    shownCount.current = count;
  }, [group, count]);

  useEffect(() => {
    if (count <= 1) store.collapse();
    if (count > 0) return;
    api.reset();
    if (!isPageHidden()) store.resume();
  }, [api, count]);

  const swipeDirections: readonly SwipeDirection[] = [
    placement === "bottom-end" ? "down" : "up",
    dir === "rtl" ? "left" : "right",
  ];
  const frontmostHeight = toasts.length > 0 ? heights.get(toasts[0].instance) : undefined;
  const offsets = toasts.map((_, index) =>
    toasts.slice(0, index).reduce((sum, above) => sum + (heights.get(above.instance) ?? 0), 0),
  );

  return (
    <Portal>
      <Group
        ref={groupRefs}
        placement={placement}
        popover="manual"
        role="region"
        aria-label={toastRegionLabel(placement)}
        aria-live="polite"
        aria-relevant="additions text"
        aria-atomic="false"
        tabIndex={-1}
        dir={dir}
        style={
          frontmostHeight === undefined
            ? undefined
            : ({ "--toast-frontmost-height": `${frontmostHeight}px` } as CSSProperties)
        }
        onMouseEnter={api.onMouseEnter}
        onMouseMove={api.onMouseMove}
        onMouseLeave={api.onMouseLeave}
        onFocus={api.onFocus}
        onBlur={api.onBlur}
      >
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.instance}
            toast={toast}
            index={index}
            offsetY={offsets[index]}
            measuredHeight={heights.get(toast.instance)}
            expanded={expanded}
            placement={placement}
            swipeDirections={swipeDirections}
            group={api.group}
          />
        ))}
      </Group>
    </Portal>
  );
}

interface ToastItemProps {
  toast: ToastEntry;
  index: number;
  offsetY: number;
  measuredHeight: number | undefined;
  expanded: boolean;
  placement: ToastPlacement;
  swipeDirections: readonly SwipeDirection[];
  group: ToasterGroup;
}

function ToastItem({
  toast,
  index,
  offsetY,
  measuredHeight,
  expanded,
  placement,
  swipeDirections,
  group,
}: ToastItemProps) {
  const open = !toast.closing;
  const presence = usePresence(open, { enterOnMount: !group.entered.has(toast.instance) });
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const attachRoot = useCallback((node: HTMLDivElement | null) => setRoot(node), []);
  const rootRef = useComposedRefs<HTMLDivElement>(attachRoot, presence.setElement);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>();
  const titleId = useId();
  const descriptionId = useId();

  useLayoutEffect(() => {
    group.entered.add(toast.instance);
  }, [group, toast.instance]);

  useDismissTimer(toast, group.countdowns);
  useMeasuredHeight(root, open, toast.instance, group.setHeight);
  const swipe = useSwipeToDismiss(root, swipeDirections, open, {
    onSwipe: (direction) => {
      setSwipeDirection(direction);
      store.dismiss(toast.id);
    },
    onRelease: group.resumeIfIdle,
  });

  const { mounted } = presence;
  const { id } = toast;
  useEffect(() => {
    if (!mounted) group.remove(id);
  }, [mounted, id, group]);

  useLayoutEffect(() => {
    if (open || !root) return;
    const active = root.ownerDocument.activeElement;
    if (active instanceof HTMLElement && root.contains(active)) {
      group.moveFocusFrom(root, active.matches(":focus-visible"));
    }
  }, [open, root, group]);

  if (!mounted) return null;

  const StatusIcon = statusIcons[toast.type];

  return (
    <Root
      ref={rootRef}
      status={toast.type}
      placement={placement}
      role="status"
      aria-atomic="true"
      aria-labelledby={toast.title ? titleId : undefined}
      aria-describedby={toast.description ? descriptionId : undefined}
      tabIndex={0}
      data-type={toast.type}
      {...openStateAttributes(open)}
      data-expanded={dataAttr(expanded)}
      data-collapsed={dataAttr(!expanded)}
      data-paused={dataAttr(toast.paused)}
      data-starting-style={dataAttr(presence.status === "starting")}
      data-swipe-direction={swipeDirection}
      style={
        {
          "--toast-index": index,
          "--toast-offset-y": `${offsetY}px`,
          "--toast-height": measuredHeight === undefined ? undefined : `${measuredHeight}px`,
        } as CSSProperties
      }
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key !== "Escape" || event.defaultPrevented) return;
        event.preventDefault();
        store.dismiss(toast.id);
      }}
      onPointerDown={swipe.onPointerDown}
    >
      {toast.type === "loading" ? (
        <Spinner color="colorPalette.plain.fg" />
      ) : (
        StatusIcon && (
          <Indicator>
            <StatusIcon />
          </Indicator>
        )
      )}
      <Stack
        gap="3"
        alignItems="start"
      >
        <Stack gap="1">
          {toast.title && <Title id={titleId}>{toast.title}</Title>}
          {toast.description && <Description id={descriptionId}>{toast.description}</Description>}
        </Stack>
        {toast.action && (
          <ActionTrigger
            type="button"
            onClick={() => {
              toast.action?.onClick();
              store.dismiss(toast.id);
            }}
          >
            {toast.action.label}
          </ActionTrigger>
        )}
      </Stack>
      {toast.closable && <CloseTrigger onClick={() => store.dismiss(toast.id)} />}
    </Root>
  );
}

function useDismissTimer(toast: ToastEntry, countdowns: Map<number, Countdown>) {
  const duration = getToastDuration(toast);
  const { id, instance, type, closing, paused } = toast;
  const key = `${type}:${duration}`;

  const running = !closing && !paused && Number.isFinite(duration);
  useEffect(() => {
    if (!running) return;
    const saved = countdowns.get(instance);
    const remaining = saved?.key === key ? saved.remaining : duration;
    const startedAt = Date.now();
    const timer = setTimeout(() => store.dismiss(id), remaining);
    return () => {
      clearTimeout(timer);
      countdowns.set(instance, { key, remaining: remaining - (Date.now() - startedAt) });
    };
  }, [running, id, instance, key, duration, countdowns]);
}

function useMeasuredHeight(
  root: HTMLElement | null,
  open: boolean,
  instance: number,
  setHeight: (instance: number, height: number) => void,
) {
  const openRef = useLatestRef(open);

  useLayoutEffect(() => {
    if (!root) return;
    const measure = () => {
      if (!openRef.current || !root.isConnected) return;
      const previous = root.style.getPropertyValue("height");
      root.style.setProperty("height", "auto");
      const height = root.offsetHeight;
      if (previous) root.style.setProperty("height", previous);
      else root.style.removeProperty("height");
      setHeight(instance, height);
    };
    measure();

    let frame = 0;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    const observeChildren = () => {
      resizeObserver.disconnect();
      for (const child of root.children) resizeObserver.observe(child);
    };
    observeChildren();
    const mutationObserver = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      measure();
      observeChildren();
    });
    mutationObserver.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [root, instance, setHeight, openRef]);
}

function useSwipeToDismiss(
  root: HTMLElement | null,
  directions: readonly SwipeDirection[],
  open: boolean,
  { onSwipe, onRelease }: { onSwipe: (direction: SwipeDirection) => void; onRelease: () => void },
) {
  const swipe = useRef({
    lock: null as "x" | "y" | null,
    direction: undefined as SwipeDirection | undefined,
    furthest: 0,
    reversed: false,
    x: 0,
    y: 0,
  });

  const setMovement = (x: number, y: number) => {
    swipe.current.x = x;
    swipe.current.y = y;
    root?.style.setProperty("--toast-swipe-movement-x", `${x}px`);
    root?.style.setProperty("--toast-swipe-movement-y", `${y}px`);
  };

  return usePointerDrag<HTMLDivElement>({
    disabled: !open,
    threshold: 1,
    activeAttribute: "data-swiping",
    onPress: (event) =>
      !isNoDragTarget(event.target) && !(event.target as Element).closest(SWIPE_IGNORE),
    onStart: () => {
      swipe.current = {
        lock: null,
        direction: undefined,
        furthest: 0,
        reversed: false,
        x: 0,
        y: 0,
      };
      store.pause();
    },
    onMove: ({ deltaX, deltaY }) => {
      const state = swipe.current;
      const right = directions.includes("right");
      const left = directions.includes("left");
      const down = directions.includes("down");
      const up = directions.includes("up");
      const horizontal = left || right;
      const vertical = up || down;
      if (state.lock === null && horizontal && vertical) {
        state.lock = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
      }

      if (state.direction === undefined) {
        const alongX =
          state.lock === "x" || (state.lock === null && Math.abs(deltaX) >= Math.abs(deltaY));
        const candidate: SwipeDirection = alongX
          ? deltaX > 0
            ? "right"
            : "left"
          : deltaY > 0
            ? "down"
            : "up";
        if (directions.includes(candidate)) {
          state.direction = candidate;
          state.furthest = swipeDisplacement(candidate, deltaX, deltaY);
        }
      } else {
        const current = swipeDisplacement(state.direction, deltaX, deltaY);
        state.furthest = Math.max(state.furthest, current);
        if (current > SWIPE_THRESHOLD) state.reversed = false;
        else if (state.furthest - current >= REVERSE_CANCEL_THRESHOLD) state.reversed = true;
      }

      setMovement(
        state.lock === "y" || !horizontal ? 0 : rubberBand(deltaX, right, left),
        state.lock === "x" || !vertical ? 0 : rubberBand(deltaY, down, up),
      );
    },
    onEnd: (_, { cancelled }) => {
      const state = swipe.current;
      const direction =
        cancelled || state.reversed
          ? undefined
          : directions.find((each) => swipeDisplacement(each, state.x, state.y) > SWIPE_THRESHOLD);
      if (direction) onSwipe(direction);
      else setMovement(0, 0);
      onRelease();
    },
  });
}
