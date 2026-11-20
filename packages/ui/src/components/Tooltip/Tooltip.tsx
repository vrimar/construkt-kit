import {
  type ComponentProps,
  Fragment,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tooltip } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLatestRef } from "../../hooks/useLatestRef";
import { type OpenChangeDetails, useLayer } from "../../primitives/layer";
import { type Anchor, type PlacementOption, usePosition } from "../../primitives/position";
import { presenceAttributes, usePresence } from "../../primitives/presence";
import { openStateAttributes, renderable } from "../../primitives/render";
import type { WithRef } from "../../types";
import { FloatingContext, createArrow, createTopLayerPositioner } from "../floating";
import { isRenderable } from "../itemSlots";
import { Kbd } from "../Kbd";
import { DEFAULT_OPEN_DELAY, TooltipStore } from "./tooltipStore";

const { withRootProvider, withContext } = createSlotRecipeContext(tooltip);

const StyledArrow = withContext(renderable.div, "arrow");
const StyledArrowTip = withContext(renderable.div, "arrowTip");
const StyledContent = withContext(renderable.div, "content");
const Positioner = createTopLayerPositioner(withContext(renderable.div, "positioner"));
const StyledTrigger = withContext(renderable.span, "trigger");
const { Arrow } = createArrow(StyledArrow, StyledArrowTip);

const StyleRoot = withRootProvider(({ children }: { children?: ReactNode }) => children);

// Scroll and client sizes round separately, so a 1px difference is not a cut.
const isClipped = (el: Element) =>
  (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) &&
  getComputedStyle(el).overflow !== "visible";

const isTextCut = (el: Element) =>
  isClipped(el) || Array.from(el.querySelectorAll("*")).some(isClipped);

const OWN_TRIGGER_KEY = "trigger";

const useStoreValue = <T,>(store: TooltipStore, read: () => T) =>
  useSyncExternalStore(store.subscribe, read, read);

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
  const shown = useStoreValue(store, () => store.isShown(triggerKey));
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
    const onScroll = (event: Event) => {
      const { target } = event;
      if (target instanceof Document || (target instanceof Node && target.contains(trigger))) {
        store.hide(triggerKey, "scroll", event);
      }
    };
    const onPointerLockChange = (event: Event) => store.hide(triggerKey, "scroll", event);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("pointerlockchange", onPointerLockChange);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [store, shown, trigger, triggerKey]);

  const handlers = useMemo(() => {
    const opens = (event: SyntheticEvent<HTMLElement>) =>
      !latest.current.disabled &&
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

  return { ref: setTrigger, "aria-describedby": shown ? contentId : undefined, ...handlers };
}

type TriggerBinding = ReturnType<typeof useTriggerBinding>;

const asTriggerElement = (children: ReactNode): ReactElement =>
  isValidElement(children) && children.type !== Fragment ? children : <span>{children}</span>;

function TriggerTarget({ binding, children }: { binding: TriggerBinding; children: ReactNode }) {
  return (
    <StyledTrigger
      {...binding}
      render={asTriggerElement(children)}
    />
  );
}

interface TooltipEntry {
  label: ReactNode;
  placement: PlacementOption;
  shortcut: ReactNode;
  showArrow: boolean | undefined;
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
  const open = useStoreValue(store, () => store.open);
  const trigger = useStoreValue(store, () => store.trigger);
  const { setFloating, setArrow, side, align, floatingStyle, arrowStyle } = usePosition({
    open,
    placement,
    anchor: anchor ?? trigger,
  });
  const presence = usePresence(open);
  const elementRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, presence.setElement);
  useLayer(open, {
    contains: () => false,
    dismiss: (reason, event) => {
      if (reason !== "escape-key") return false;
      store.hide(null, reason, event);
      return true;
    },
  });

  if (!presence.mounted) return null;

  return (
    <FloatingContext value={{ side, align, arrowStyle, setArrow }}>
      <Positioner
        ref={setFloating}
        style={floatingStyle}
        data-side={side}
        data-align={align}
      >
        <StyledContent
          ref={elementRef}
          id={contentId}
          role="tooltip"
          data-side={side}
          data-align={align}
          {...openStateAttributes(open)}
          {...presenceAttributes(presence.status)}
        >
          {children}
        </StyledContent>
      </Positioner>
    </FloatingContext>
  );
}

export interface TooltipProps {
  /** The trigger. An element becomes the trigger itself; anything else is wrapped in a `span`. */
  children: ReactNode | undefined;
  label: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
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
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const triggerRef = useComposedRefs(binding.ref, setTriggerEl);

  return (
    <StyleRoot>
      {children != null && (
        <TriggerTarget binding={{ ...binding, ref: triggerRef }}>{children}</TriggerTarget>
      )}
      {body && (
        <TooltipPopup
          store={store}
          contentId={contentId}
          placement={placement}
          anchor={anchor ?? triggerEl}
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
  entries: Map<string, TooltipEntry>;
  refresh: () => void;
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
  const { store, contentId, entries, refresh } = group;
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
    entries.set(triggerKey, { label, placement, shortcut, showArrow });
    if (store.key === triggerKey) refresh();
    return () => {
      entries.delete(triggerKey);
    };
  }, [entries, refresh, store, triggerKey, bare, label, placement, shortcut, showArrow]);

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
  const [entries] = useState(() => new Map<string, TooltipEntry>());
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((version) => version + 1), []);
  const value = useMemo(
    () => ({ store, contentId, placement, entries, refresh }),
    [store, contentId, placement, entries, refresh],
  );
  const activeKey = useStoreValue(store, () => store.key);
  const entry = activeKey === null ? undefined : entries.get(activeKey);

  return (
    <TooltipGroupContext value={value}>
      {children}
      <StyleRoot>
        {entry && (
          <TooltipPopup
            store={store}
            contentId={contentId}
            placement={entry.placement}
            anchor={null}
          >
            <TooltipBody
              label={entry.label}
              showArrow={entry.showArrow}
              shortcut={entry.shortcut}
            />
          </TooltipPopup>
        )}
      </StyleRoot>
    </TooltipGroupContext>
  );
}

export type TooltipContentProps = ComponentProps<typeof StyledContent>;
