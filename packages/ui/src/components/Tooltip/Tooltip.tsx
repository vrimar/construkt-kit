import {
  type ComponentProps,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tooltip } from "#styled-system/recipes";

import { isAriaTrue } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import type { UseOpenStateOptions } from "../../primitives/layer";
import type { Anchor, PlacementOption } from "../../primitives/position";
import { presenceAttributes } from "../../primitives/presence";
import { openStateAttributes, renderable } from "../../primitives/render";
import { useStore } from "../../primitives/store";
import type { WithRef } from "../../types";
import { createAnchoredPositioner, createArrow, useAnchoredPopup } from "../floating";
import { isRenderable } from "../itemSlots";
import { Kbd } from "../Kbd";
import { asRender } from "../renderContent";
import {
  DEFAULT_OPEN_DELAY,
  type TooltipEntry,
  type TooltipState,
  TooltipStore,
} from "./tooltipStore";

const { withRootProvider, withContext } = createSlotRecipeContext(tooltip);

const StyledArrow = withContext(renderable.div, "arrow");
const StyledArrowTip = withContext(renderable.div, "arrowTip");
const StyledContent = withContext(renderable.div, "content");
const Positioner = createAnchoredPositioner(withContext(renderable.div, "positioner"));
const StyledTrigger = withContext(renderable.span, "trigger");
const { Arrow } = createArrow(StyledArrow, StyledArrowTip);

const StyleRoot = withRootProvider(({ children }: { children?: ReactNode }) => children);

// Scroll and client sizes round separately, so a 1px difference is not a cut.
const isClipped = (el: Element) =>
  (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) &&
  getComputedStyle(el).overflow !== "visible";

const isTextCut = (el: Element) =>
  isClipped(el) || Array.from(el.querySelectorAll("*")).some(isClipped);

const isExpanded = (el: Element) => isAriaTrue(el.getAttribute("aria-expanded") ?? undefined);

const OWN_TRIGGER_KEY = "trigger";

const selectOpen = (state: TooltipState) => state.open;
const selectTrigger = (state: TooltipState) => state.trigger;
const selectShown = (state: TooltipState, key: string) => state.open && state.key === key;
const selectEntry = (state: TooltipState) => state.entry;

function useHideOnScroll(store: TooltipStore, key: string | null, trigger: HTMLElement | null) {
  useEffect(() => {
    if (!trigger) return;
    const onScroll = (event: Event) => {
      const { target } = event;
      if (target instanceof Document || (target instanceof Node && target.contains(trigger))) {
        store.hide(key, "scroll", event);
      }
    };
    const onPointerLockChange = (event: Event) => store.hide(key, "scroll", event);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("pointerlockchange", onPointerLockChange);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [store, key, trigger]);
}

interface TriggerBindingOptions {
  store: TooltipStore;
  contentId: string;
  triggerKey: string;
  disabled: boolean;
  showWhenTruncated: boolean;
}

function useTriggerBinding({
  store,
  contentId,
  triggerKey,
  disabled,
  showWhenTruncated,
}: TriggerBindingOptions) {
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const shown = useStore(store, selectShown, triggerKey);
  const latest = useLatestRef({ disabled, showWhenTruncated });
  // Set once the pointer asks to open, so it shows at most once until the pointer leaves.
  const hovering = useRef(false);
  // Set by a press's pointerdown, so the click that ends the press doesn't ask to close again.
  const pressing = useRef(false);

  useLayoutEffect(() => {
    if (disabled && shown) store.hide(triggerKey, "trigger-blur");
  }, [store, disabled, shown, triggerKey]);

  useEffect(() => {
    if (!shown || !trigger) return;
    const hideIfExpanded = () => {
      if (isExpanded(trigger)) store.hide(triggerKey, "trigger-blur");
    };
    hideIfExpanded();
    const expansion = new MutationObserver(hideIfExpanded);
    expansion.observe(trigger, { attributeFilter: ["aria-expanded"] });
    return () => expansion.disconnect();
  }, [store, shown, trigger, triggerKey]);

  useHideOnScroll(store, triggerKey, shown ? trigger : null);

  const handlers = useMemo(() => {
    const opens = (event: SyntheticEvent<HTMLElement>) =>
      !latest.current.disabled &&
      !isExpanded(event.currentTarget) &&
      (!latest.current.showWhenTruncated || isTextCut(event.currentTarget));
    const onHover = (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "touch" || hovering.current || !opens(event)) return;
      hovering.current = true;
      store.showAfterDelay(triggerKey, event.currentTarget, event.nativeEvent);
    };
    const onLeave = (event: PointerEvent<HTMLElement>) => {
      // A finger only leaves as it lifts, after its press has already asked to close.
      if (event.pointerType === "touch") return;
      hovering.current = false;
      pressing.current = false;
      store.hideAfterDelay(triggerKey, event.nativeEvent);
    };
    const onPress = (event: SyntheticEvent<HTMLElement>) => {
      if (!latest.current.disabled) store.hide(triggerKey, "trigger-press", event.nativeEvent);
    };
    return {
      onPointerMove: onHover,
      onPointerOver: onHover,
      onPointerLeave: onLeave,
      onPointerCancel: (event: PointerEvent<HTMLElement>) => {
        pressing.current = false;
        onLeave(event);
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        pressing.current = true;
        onPress(event);
      },
      onClick: (event: SyntheticEvent<HTMLElement>) => {
        if (pressing.current) pressing.current = false;
        else onPress(event);
      },
      onKeyDown: () => {
        pressing.current = false;
      },
      onFocus: (event: SyntheticEvent<HTMLElement>) => {
        if (!opens(event) || !event.currentTarget.matches(":focus-visible")) return;
        store.show(triggerKey, event.currentTarget, "trigger-focus", event.nativeEvent);
      },
      onBlur: (event: SyntheticEvent<HTMLElement>) => {
        store.hide(triggerKey, "trigger-blur", event.nativeEvent);
      },
    };
  }, [store, triggerKey, latest]);

  return {
    trigger,
    props: { ref: setTrigger, "aria-describedby": shown ? contentId : undefined, ...handlers },
  };
}

type TriggerBinding = ReturnType<typeof useTriggerBinding>;

function TriggerTarget({ binding, children }: { binding: TriggerBinding; children: ReactNode }) {
  return (
    <StyledTrigger
      {...binding.props}
      {...asRender(children)}
    />
  );
}

function TooltipBody({ label, showArrow, shortcut }: Omit<TooltipEntry, "placement">) {
  return (
    <>
      {showArrow && <Arrow />}
      {label}
      {isRenderable(shortcut) && (
        <Kbd
          size="sm"
          variant="outline"
          color="inherit"
          borderColor="current/35"
          ms="1.5"
        >
          {shortcut}
        </Kbd>
      )}
    </>
  );
}

interface TooltipPopupProps {
  store: TooltipStore;
  contentId: string;
  placement: PlacementOption;
  anchor: Anchor | null;
  ref?: Ref<HTMLDivElement> | undefined;
  children: ReactNode;
}

function TooltipPopup({ store, contentId, placement, anchor, ref, children }: TooltipPopupProps) {
  const open = useStore(store, selectOpen);
  const trigger = useStore(store, selectTrigger);
  const popup = useAnchoredPopup({
    open,
    placement,
    anchor: anchor ?? trigger,
    trigger,
    contains: false,
    overlay: false,
    dismiss: (reason, event) => {
      if (reason !== "escape-key") return false;
      store.hide(null, reason, event);
      return true;
    },
  });
  const elementRef = useComposedRefs(ref, popup.setElement);

  if (!popup.mounted) return null;

  return (
    <Positioner popup={popup}>
      <StyledContent
        ref={elementRef}
        id={contentId}
        role="tooltip"
        data-side={popup.side}
        data-align={popup.align}
        {...openStateAttributes(open)}
        {...presenceAttributes(popup.status)}
      >
        {children}
      </StyledContent>
    </Positioner>
  );
}

export interface TooltipProps extends UseOpenStateOptions {
  /** The trigger. An element becomes the trigger itself; anything else is wrapped in a `span`. */
  children: ReactNode | undefined;
  label: ReactNode;
  disabled?: boolean | undefined;
  /** @default 300 */
  openDelay?: number | undefined;
  /** @default 0 */
  closeDelay?: number | undefined;
  /** @default "top" */
  placement?: PlacementOption | undefined;
  /** Places the tooltip against this element or box instead of the trigger. */
  anchor?: Anchor | null | undefined;
  showArrow?: boolean | undefined;
  /** Opens only while the trigger's text is cut off, measured when the pointer or focus arrives. */
  showWhenTruncated?: boolean | undefined;
  /** Keyboard shortcut shown after the label. */
  shortcut?: ReactNode;
}

function OwnTooltip({
  contentRef,
  open,
  defaultOpen,
  onOpenChange,
  openDelay,
  closeDelay,
  disabled,
  placement,
  anchor,
  showWhenTruncated,
  body,
  children,
}: {
  contentRef: Ref<HTMLDivElement> | undefined;
  open: boolean | undefined;
  defaultOpen: boolean;
  onOpenChange: TooltipProps["onOpenChange"];
  openDelay: number;
  closeDelay: number;
  disabled: boolean;
  placement: PlacementOption;
  anchor: Anchor | null;
  showWhenTruncated: boolean;
  body: ReactElement | null;
  children: ReactNode;
}) {
  const [store] = useState(
    () =>
      new TooltipStore(
        { open, onOpenChange, openDelay, closeDelay },
        { defaultOpen, key: OWN_TRIGGER_KEY },
      ),
  );
  const contentId = `tooltip:${useId()}:content`;

  useLayoutEffect(() => {
    store.configure({ open, onOpenChange, openDelay, closeDelay });
  }, [store, open, onOpenChange, openDelay, closeDelay]);
  useEffect(() => {
    store.mount();
    return () => store.dispose();
  }, [store]);

  const binding = useTriggerBinding({
    store,
    contentId,
    triggerKey: OWN_TRIGGER_KEY,
    disabled,
    showWhenTruncated,
  });

  return (
    <StyleRoot>
      {children != null && <TriggerTarget binding={binding}>{children}</TriggerTarget>}
      {body && (
        <TooltipPopup
          store={store}
          contentId={contentId}
          placement={placement}
          anchor={anchor ?? binding.trigger}
          ref={contentRef}
        >
          {body}
        </TooltipPopup>
      )}
    </StyleRoot>
  );
}

interface TooltipGroupValue {
  store: TooltipStore;
  contentId: string;
  placement: PlacementOption;
}

const TooltipGroupContext = createContext<TooltipGroupValue | null>(null);

function GroupTrigger({
  group,
  entry,
  bare,
  disabled,
  showWhenTruncated,
  children,
}: {
  group: TooltipGroupValue;
  entry: TooltipEntry;
  bare: boolean;
  disabled: boolean;
  showWhenTruncated: boolean;
  children: ReactNode;
}) {
  const triggerKey = useId();
  const { store, contentId } = group;
  const binding = useTriggerBinding({
    store,
    contentId,
    triggerKey,
    disabled,
    showWhenTruncated,
  });
  const { label, placement, shortcut, showArrow } = entry;

  useLayoutEffect(() => {
    if (bare) return;
    return store.register(triggerKey, { label, placement, shortcut, showArrow });
  }, [store, triggerKey, bare, label, placement, shortcut, showArrow]);

  return (
    <StyleRoot>
      <TriggerTarget binding={binding}>{children}</TriggerTarget>
    </StyleRoot>
  );
}

/** Shows `label` beside its trigger on hover and keyboard focus. */
export function Tooltip({
  ref,
  children,
  label,
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  openDelay = DEFAULT_OPEN_DELAY,
  closeDelay = 0,
  placement,
  anchor,
  showArrow,
  showWhenTruncated = false,
  shortcut,
}: WithRef<TooltipProps>): ReactNode {
  const group = useContext(TooltipGroupContext);
  // An empty label keeps the same trigger tree, so toggling it never remounts the child.
  const bare = !isRenderable(label);
  const joinsGroup =
    group !== null &&
    ref === undefined &&
    open === undefined &&
    defaultOpen === undefined &&
    onOpenChange === undefined &&
    anchor === undefined &&
    openDelay === DEFAULT_OPEN_DELAY &&
    closeDelay === 0;

  if (joinsGroup) {
    return (
      <GroupTrigger
        group={group}
        entry={{ label, placement: placement ?? group.placement, shortcut, showArrow }}
        bare={bare}
        disabled={disabled || bare}
        showWhenTruncated={showWhenTruncated}
      >
        {children}
      </GroupTrigger>
    );
  }

  return (
    <OwnTooltip
      contentRef={ref}
      open={bare ? false : open}
      defaultOpen={defaultOpen ?? false}
      onOpenChange={onOpenChange}
      openDelay={openDelay}
      closeDelay={closeDelay}
      disabled={disabled || bare}
      placement={placement ?? "top"}
      anchor={anchor ?? null}
      showWhenTruncated={showWhenTruncated}
      body={
        bare ? null : (
          <TooltipBody
            label={label}
            showArrow={showArrow}
            shortcut={shortcut}
          />
        )
      }
    >
      {children}
    </OwnTooltip>
  );
}

export interface TooltipGroupProps {
  children: ReactNode;
  /** Where a tooltip in the group opens when it doesn't set `placement`. @default "top" */
  placement?: PlacementOption;
}

/**
 * Runs one tooltip for every plain `Tooltip` inside it, so a long list doesn't mount a tooltip per
 * row. A `Tooltip` that sets `open`, `defaultOpen`, `onOpenChange`, `openDelay`, `closeDelay`,
 * `anchor` or `ref` keeps its own. A shared tooltip's label renders here, outside its row.
 */
export function TooltipGroup({ children, placement = "top" }: TooltipGroupProps) {
  const [store] = useState(
    () => new TooltipStore({ openDelay: DEFAULT_OPEN_DELAY, closeDelay: 0 }),
  );
  useEffect(() => () => store.dispose(), [store]);
  const contentId = `tooltip:${useId()}:content`;
  const value = useMemo(() => ({ store, contentId, placement }), [store, contentId, placement]);

  return (
    <TooltipGroupContext value={value}>
      {children}
      <EntryPopup
        store={store}
        contentId={contentId}
        anchor={null}
      />
    </TooltipGroupContext>
  );
}

function EntryPopup({
  store,
  contentId,
  anchor,
}: {
  store: TooltipStore;
  contentId: string;
  anchor: Anchor | null;
}) {
  const entry = useStore(store, selectEntry);
  return (
    <StyleRoot>
      {entry && (
        <TooltipPopup
          store={store}
          contentId={contentId}
          placement={entry.placement}
          anchor={anchor}
        >
          <TooltipBody
            label={entry.label}
            showArrow={entry.showArrow}
            shortcut={entry.shortcut}
          />
        </TooltipPopup>
      )}
    </StyleRoot>
  );
}

export interface UseTooltipDelegateOptions {
  /** @default 300 */
  openDelay?: number | undefined;
  /** @default "top" */
  placement?: PlacementOption | undefined;
}

export interface TooltipDelegate {
  /** Shows `label` beside `trigger` at once. */
  show: (trigger: HTMLElement, label: ReactNode) => void;
  /**
   * Shows `label` beside `trigger` after `openDelay`, or at once while another tooltip is open or
   * has just closed.
   */
  showAfterDelay: (trigger: HTMLElement, label: ReactNode) => void;
  /** Hides the tooltip, or stops one waiting to show. */
  hide: () => void;
  /** The tooltip; render it once. */
  tooltip: ReactNode;
}

let delegatedCount = 0;
const delegatedKeys = new WeakMap<HTMLElement, string>();

const delegatedKey = (trigger: HTMLElement) => {
  let key = delegatedKeys.get(trigger);
  if (key === undefined) {
    delegatedCount += 1;
    key = `delegated:${delegatedCount}`;
    delegatedKeys.set(trigger, key);
  }
  return key;
};

// A delegated trigger can leave the document while its tooltip shows; the tooltip then stays put.
const lastBoxOf = (trigger: HTMLElement): Anchor => {
  let box: DOMRect | null = null;
  return {
    getBoundingClientRect: () => {
      if (box === null || trigger.isConnected) box = trigger.getBoundingClientRect();
      return box;
    },
  };
};

function DelegatedPopup({ store, contentId }: { store: TooltipStore; contentId: string }) {
  const open = useStore(store, selectOpen);
  const trigger = useStore(store, selectTrigger);
  const anchor = useMemo(() => trigger && lastBoxOf(trigger), [trigger]);
  useHideOnScroll(store, null, open ? trigger : null);
  return (
    <EntryPopup
      store={store}
      contentId={contentId}
      anchor={anchor}
    />
  );
}

/**
 * One tooltip for elements found as events arrive rather than wrapped in `Tooltip`, such as the cell
 * under the pointer in a grid. It hands off with every other tooltip as `Tooltip` does: another
 * tooltip open, or just closed, skips the delay.
 */
export function useTooltipDelegate({
  openDelay = DEFAULT_OPEN_DELAY,
  placement = "top",
}: UseTooltipDelegateOptions = {}): TooltipDelegate {
  const [store] = useState(() => new TooltipStore({ openDelay, closeDelay: 0 }));
  const contentId = `tooltip:${useId()}:content`;
  const registration = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    store.configure({ openDelay, closeDelay: 0 });
  }, [store, openDelay]);
  useEffect(() => () => store.dispose(), [store]);

  return useMemo<TooltipDelegate>(() => {
    const register = (trigger: HTMLElement, label: ReactNode) => {
      const key = delegatedKey(trigger);
      const previous = registration.current;
      registration.current = store.register(key, {
        label,
        placement,
        shortcut: null,
        showArrow: undefined,
      });
      previous?.();
      return key;
    };
    return {
      show: (trigger, label) => store.show(register(trigger, label), trigger, "trigger-focus"),
      showAfterDelay: (trigger, label) => store.showAfterDelay(register(trigger, label), trigger),
      hide: () => store.hide(null, "pointer-leave"),
      tooltip: (
        <DelegatedPopup
          store={store}
          contentId={contentId}
        />
      ),
    };
  }, [store, contentId, placement]);
}

export type TooltipContentProps = ComponentProps<typeof StyledContent>;
