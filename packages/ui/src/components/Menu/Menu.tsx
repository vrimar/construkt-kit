import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Children,
  type ComponentProps,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
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
} from "react";
import { createPortal } from "react-dom";

import { Box, createSlotRecipeContext } from "#styled-system/jsx";
import { type MenuVariantProps, menu } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useCompositeListItem } from "../../primitives/composite";
import { KEEP_FOCUS, dismissFocusIntent } from "../../primitives/focus";
import {
  type DismissReason,
  LayerContext,
  type OpenChangeDetails,
  type OpenChangeReason,
  isWithinLayer,
  useOpenState,
  useOverlayExit,
} from "../../primitives/layer";
import { useLocale } from "../../primitives/locale";
import type { Anchor, PlacementOption, VirtualElement } from "../../primitives/position";
import { type TransitionStatus, presenceAttributes, usePresence } from "../../primitives/presence";
import { openStateAttributes, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { useStore } from "../../primitives/store";
import type { WithRef } from "../../types";
import {
  createAnchoredPositioner,
  createArrow,
  getPopupTriggerProps,
  useAnchoredPopup,
} from "../floating";
import { isRenderable, useItemSlotIds } from "../itemSlots";
import {
  type MobileLayoutProps,
  OverlayPresentationContext,
  useOverlayPresentation,
  usePresentedOverlayFocus,
} from "../overlayPresentation";
import { wrapRenderContent } from "../renderContent";
import {
  type SheetCloseReason,
  SheetOverlayContent,
  SheetPanel,
  useSheetFrame,
} from "../sheetFrame";
import { type WithTooltipProps, withTriggerTooltip } from "../Tooltip/TriggerTooltip";
import { MenuNode, selectHighlighted, selectIsHighlighted } from "./menuNode";
import type { Point } from "./pointerGrace";

const { withRootProvider, withContext } = createSlotRecipeContext(menu);

const StyledArrow = withContext(renderable.div, "arrow");
const StyledArrowTip = withContext(renderable.div, "arrowTip");
const StyledContent = withContext(renderable.div, "content");
const StyledContextTrigger = withContext(renderable.button, "contextTrigger");
const StyledItem = withContext(renderable.div, "item");
const StyledItemGroup = withContext(renderable.div, "itemGroup");
const StyledItemGroupLabel = withContext(renderable.div, "itemGroupLabel");
const StyledItemIndicator = withContext(renderable.div, "itemIndicator");
const ItemText = withContext(renderable.div, "itemText");
const Positioner = createAnchoredPositioner(withContext(renderable.div, "positioner"));
const StyledSeparator = withContext(renderable.hr, "separator");
const StyledTrigger = withContext(renderable.button, "trigger");
const ItemHint = withContext("span", "itemHint");
const ItemDescription = withContext("div", "itemDescription");
const ItemSwitch = withContext("span", "itemSwitch", { defaultProps: { "aria-hidden": true } });
const ItemSwitchThumb = withContext("span", "itemSwitchThumb");
const StyledSegmentGroup = withContext(renderable.div, "segmentGroup");
const SegmentLabel = withContext(renderable.div, "segmentLabel");
const SegmentTrack = withContext("div", "segmentTrack");
const StyledSegmentItem = withContext(renderable.div, "segmentItem");

const floatingArrow = createArrow(StyledArrow, StyledArrowTip);
const Arrow: (props: WithRef<ComponentProps<typeof StyledArrow>>) => ReactNode =
  floatingArrow.Arrow;

const BACK_ITEM_VALUE = "construkt-menu-back";
const LONG_PRESS_DELAY = 700;

const checkedAttributes = (checked: boolean) =>
  checked ? { "data-checked": "" } : { "data-unchecked": "" };

const isMac = () => /^Mac/i.test(navigator.platform);

const isContextMenuEvent = (event: MouseEvent) =>
  event.button === 2 || (isMac() && event.ctrlKey && event.button === 0);

const isTargetDisabled = (element: HTMLElement) =>
  element.hasAttribute("data-disabled") || element.hasAttribute("disabled");

const opensInNewTab = (event: MouseEvent<HTMLElement>) =>
  event.currentTarget.matches("a[href], button[type='submit'], input[type='submit']") &&
  (event.button === 1 || (isMac() ? event.metaKey : event.ctrlKey));

const downloads = (event: MouseEvent<HTMLElement>) =>
  event.altKey && event.currentTarget.matches("a, button[type='submit'], input[type='submit']");

const pointOf = (event: { clientX: number; clientY: number }): Point => ({
  x: event.clientX,
  y: event.clientY,
});

const pointAnchor = ({ x, y }: Point): VirtualElement => ({
  getBoundingClientRect: () => ({
    x,
    y,
    width: 0,
    height: 0,
    top: y,
    left: x,
    right: x,
    bottom: y,
  }),
});

type MenuLayout = "anchored" | "sheet" | "drill-down";

interface ParentMenu {
  node: MenuNode;
  layout: MenuLayout;
  active: boolean;
}

const ParentMenuContext = createContext<ParentMenu | null>(null);

interface MenuContextValue {
  node: MenuNode;
  open: boolean;
  active: boolean;
  layout: MenuLayout;
  returnFocusTo: () => HTMLElement | null;
  ids: { trigger: string; content: string; contextTrigger: string };
  placement: PlacementOption;
  gutter: number;
  anchor: Anchor | null;
  labelledBy: string | undefined;
  triggerEl: HTMLElement | null;
  setTriggerEl: (element: HTMLElement | null) => void;
  contentMounted: boolean;
  setContentEl: (element: HTMLElement | null) => void;
  openFromTrigger: (event: Event, edge?: "first" | "last", reason?: OpenChangeReason) => void;
  openAtPoint: (point: Point, source: HTMLElement, event: Event) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error("Menu parts must be rendered inside Menu.Root.");
  return context;
}

export interface MenuRootProps extends MobileLayoutProps, MenuVariantProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** Called once the menu has closed, left the page and handed focus back. */
  onExitComplete?: (() => void) | undefined;
  /**
   * Where the menu opens against its trigger, the point a context menu opened at, or `anchor`.
   * @default "bottom-start", or "right-start" for a submenu
   */
  placement?: PlacementOption | undefined;
  /** What the menu opens against instead: an element, or `{ getBoundingClientRect }` for a point or a measured box. */
  anchor?: Anchor | null | undefined;
  /** Closes the menu once an item is selected; an item's own `closeOnSelect` wins. @default true */
  closeOnSelect?: boolean | undefined;
  /** Arrow keys wrap from the last item to the first and back. @default false */
  loopFocus?: boolean | undefined;
  /** The value of the highlighted item, or `null` for none. */
  highlightedValue?: string | null | undefined;
  defaultHighlightedValue?: string | null | undefined;
  onHighlightChange?: ((value: string | null) => void) | undefined;
  /** Called with the value of the item selected in this menu, not in its submenus. */
  onSelect?: ((value: string) => void) | undefined;
}

type MenuRootBaseProps = Omit<MenuRootProps, keyof MenuVariantProps>;

/** A nested root is a submenu: it drills down inside its parent's phone sheet, and floats beside an anchored parent. */
function MenuRootBase({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  onExitComplete,
  mobileLayout,
  placement,
  anchor = null,
  closeOnSelect = true,
  loopFocus = false,
  highlightedValue,
  defaultHighlightedValue = null,
  onHighlightChange,
  onSelect,
}: MenuRootBaseProps) {
  const parent = useContext(ParentMenuContext);
  const parentNode = parent?.node ?? null;
  const id = useId();
  const [node] = useState(
    () =>
      new MenuNode(
        `menu:${id}`,
        parentNode,
        highlightedValue === undefined ? defaultHighlightedValue : highlightedValue,
      ),
  );
  const { open, requestOpenChange } = useOpenState({
    open: openProp,
    defaultOpen,
    onOpenChange,
  });
  const presentation = useOverlayPresentation({
    mobileLayout: parent ? "popover" : mobileLayout,
    open,
  });
  const layout: MenuLayout = parent
    ? parent.layout === "anchored"
      ? "anchored"
      : "drill-down"
    : presentation.mode === "sheet"
      ? "sheet"
      : "anchored";
  const active = open && (parent?.active ?? true);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  const [point, setPoint] = useState<Point | null>(null);
  const [pointSource, setPointSource] = useState<HTMLElement | null>(null);
  const rtl = useLocale().dir === "rtl";

  const returnFocusTo = useCallback(() => {
    if (parentNode) return parentNode.props.open ? parentNode.content : null;
    return point ? node.origin : triggerEl;
  }, [parentNode, point, node, triggerEl]);

  const { setReturnFocus, returningFocus } = usePresentedOverlayFocus(presentation, {
    open,
    popup: contentEl,
    autoFocus: true,
    initialFocus: () => node.initialFocus(),
    restoreFocus: true,
    returnFocusTo,
  });
  useOverlayExit(open, contentEl === null && !returningFocus, onExitComplete);

  useLayoutEffect(() => {
    node.update({
      open,
      setOpen: requestOpenChange,
      setReturnFocus,
      closeOnSelect,
      loopFocus,
      rtl,
      highlightControlled: highlightedValue !== undefined,
      onHighlightChange,
      onSelect,
    });
  });

  useLayoutEffect(() => {
    if (highlightedValue !== undefined) node.store.set("highlightedValue", highlightedValue);
  }, [node, highlightedValue]);

  useLayoutEffect(() => {
    if (!parentNode) return;
    parentNode.children.add(node);
    return () => {
      parentNode.children.delete(node);
    };
  }, [parentNode, node]);

  useEffect(() => () => node.dispose(), [node]);

  const wasActive = useRef(active);
  useLayoutEffect(() => {
    if (wasActive.current && !active) node.reset();
    wasActive.current = active;
  }, [node, active]);

  useLayoutEffect(() => {
    if (active && contentEl) node.settleOpen();
  }, [node, active, contentEl]);

  const setContentRef = useCallback(
    (element: HTMLElement | null) => {
      node.setContent(element);
      setContentEl(element);
    },
    [node],
  );

  const openFromTrigger = useCallback(
    (event: Event, edge?: "first" | "last", reason: OpenChangeReason = "trigger-press") => {
      if (!node.props.open) {
        setPoint(null);
        node.open(reason, event, edge ?? null);
      } else if (edge) {
        node.move(edge === "last" ? "prev" : "next");
        node.focusContent();
      } else {
        node.close("trigger-press", event);
      }
    },
    [node],
  );

  const openAtPoint = useCallback(
    (next: Point, source: HTMLElement, event: Event) => {
      setPoint(next);
      setPointSource(source);
      if (node.props.open) {
        node.focusContent();
        return;
      }
      node.captureOrigin(source.ownerDocument);
      node.open("trigger-press", event);
    },
    [node],
  );

  const ids = useMemo(
    () => ({
      trigger: `${node.id}:trigger`,
      content: `${node.id}:content`,
      contextTrigger: `${node.id}:ctx-trigger`,
    }),
    [node],
  );
  const anchorPoint = useMemo(() => (point ? pointAnchor(point) : null), [point]);
  const labelledBy = (point ? pointSource : triggerEl)?.id || undefined;

  const value = useMemo<MenuContextValue>(
    () => ({
      node,
      open,
      active,
      layout,
      returnFocusTo,
      ids,
      placement: placement ?? (parentNode ? (rtl ? "left-start" : "right-start") : "bottom-start"),
      gutter: parentNode ? 0 : 8,
      anchor: anchor ?? anchorPoint ?? triggerEl,
      labelledBy,
      triggerEl,
      setTriggerEl,
      contentMounted: contentEl !== null,
      setContentEl: setContentRef,
      openFromTrigger,
      openAtPoint,
    }),
    [
      node,
      open,
      active,
      layout,
      returnFocusTo,
      ids,
      placement,
      parentNode,
      rtl,
      anchor,
      anchorPoint,
      labelledBy,
      triggerEl,
      contentEl,
      setContentRef,
      openFromTrigger,
      openAtPoint,
    ],
  );

  const provided = <MenuContext value={value}>{children}</MenuContext>;
  if (parent) return provided;
  return <OverlayPresentationContext value={presentation}>{provided}</OverlayPresentationContext>;
}

const MenuRoot: (props: MenuRootProps) => ReactNode = withRootProvider(MenuRootBase);

export interface MenuTriggerProps extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

function TriggerPart({
  ref,
  onClick,
  onPointerDown,
  onKeyDown,
  ...props
}: WithRef<ComponentProps<typeof StyledTrigger>, HTMLButtonElement>) {
  const context = useMenuContext();
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context.setTriggerEl);
  return (
    <StyledTrigger
      type="button"
      id={context.ids.trigger}
      {...getPopupTriggerProps({
        open: context.open,
        contentId: context.ids.content,
        contentMounted: context.contentMounted,
        haspopup: "menu",
      })}
      {...props}
      ref={composedRef}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        if (isTargetDisabled(event.currentTarget) || isContextMenuEvent(event)) return;
        event.preventDefault();
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || isTargetDisabled(event.currentTarget)) return;
        context.openFromTrigger(event.nativeEvent);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const edge =
          event.key === "ArrowUp"
            ? "last"
            : event.key === "ArrowDown" || event.key === "Enter" || event.key === " "
              ? "first"
              : null;
        if (!edge) return;
        event.preventDefault();
        const arrow = event.key === "ArrowUp" || event.key === "ArrowDown";
        context.openFromTrigger(
          event.nativeEvent,
          edge,
          arrow ? "list-navigation" : "trigger-press",
        );
      }}
    />
  );
}

const MenuTrigger = withTriggerTooltip(TriggerPart, () => useMenuContext().open);

function ContextTrigger({
  ref,
  style,
  onContextMenu,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: WithRef<ComponentProps<typeof StyledContextTrigger>, HTMLButtonElement>) {
  const context = useMenuContext();
  const { node } = context;
  const longPress = useRef<ReturnType<typeof setTimeout>>(undefined);
  const register = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      node.contextTriggers.add(element);
      return () => {
        node.contextTriggers.delete(element);
      };
    },
    [node],
  );
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, register);

  useEffect(() => () => clearTimeout(longPress.current), []);

  const cancelLongPress = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") clearTimeout(longPress.current);
  };

  return (
    <StyledContextTrigger
      type={props.render ? undefined : "button"}
      id={context.ids.contextTrigger}
      {...openStateAttributes(context.open)}
      {...props}
      ref={composedRef}
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none", ...style }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        if (event.pointerType === "mouse") return;
        const point = pointOf(event);
        const source = event.currentTarget;
        const native = event.nativeEvent;
        clearTimeout(longPress.current);
        longPress.current = setTimeout(
          () => context.openAtPoint(point, source, native),
          LONG_PRESS_DELAY,
        );
      }}
      onPointerMove={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerMove?.(event);
        cancelLongPress(event);
      }}
      onPointerUp={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerUp?.(event);
        cancelLongPress(event);
      }}
      onPointerCancel={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerCancel?.(event);
        cancelLongPress(event);
      }}
      onContextMenu={(event: MouseEvent<HTMLButtonElement>) => {
        onContextMenu?.(event);
        context.openAtPoint(pointOf(event), event.currentTarget, event.nativeEvent);
        event.preventDefault();
      }}
    />
  );
}

export interface MenuContentProps extends ComponentProps<typeof StyledContent> {
  /** Label of the row that leads back out of a submenu shown inside a phone sheet. */
  backLabel?: string;
}

const isArrow = (child: ReactNode) => isValidElement(child) && child.type === Arrow;

function useSplitArrows(children: ReactNode) {
  return useMemo(() => {
    const nodes = Children.toArray(children);
    return { arrows: nodes.filter(isArrow), items: nodes.filter((child) => !isArrow(child)) };
  }, [children]);
}

interface ContentElementProps extends WithRef<ComponentProps<typeof StyledContent>> {
  status?: TransitionStatus;
}

function ContentElement({
  ref,
  status,
  onKeyDown,
  onPointerEnter,
  children,
  ...props
}: ContentElementProps) {
  const context = useMenuContext();
  const { node, active, layout } = context;
  const highlighted = useStore(node.store, selectHighlighted);
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context.setContentEl);
  const parentMenu = useMemo(() => ({ node, layout, active }), [node, layout, active]);
  return (
    <StyledContent
      id={context.ids.content}
      role="menu"
      tabIndex={0}
      aria-labelledby={props["aria-label"] ? undefined : context.labelledBy}
      aria-activedescendant={highlighted == null ? undefined : node.itemId(highlighted)}
      {...presenceAttributes(status)}
      {...openStateAttributes(context.open)}
      {...props}
      ref={composedRef}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        node.onContentKeyDown(event);
      }}
      onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") node.enterContent();
      }}
    >
      <ParentMenuContext value={parentMenu}>{children}</ParentMenuContext>
    </StyledContent>
  );
}

function AnchoredContent({
  ref,
  backLabel: _onlySheetsHaveBack,
  children,
  ...props
}: WithRef<MenuContentProps>) {
  const context = useMenuContext();
  const { node, active } = context;
  const parentLayer = useContext(LayerContext);

  const dismiss = (reason: DismissReason, event: Event) => {
    if (reason === "focus-out" && node.inContextTrigger(event.target)) return false;
    if (!node.parent) return node.close(reason, event, dismissFocusIntent(reason, event.target));
    if (reason === "escape-key") {
      return node.closeTree(reason, event, { restore: true, focusVisible: true });
    }
    const closed = node.close(reason, event, KEEP_FOCUS);
    // Only the innermost menu gets an outside press, so pass it up while it is outside the parent too.
    const { target } = event;
    if (reason === "outside-press" && parentLayer && target instanceof Node) {
      if (!isWithinLayer(parentLayer, target)) parentLayer.dismiss(reason, event);
    }
    return closed;
  };

  const popup = useAnchoredPopup({
    open: active,
    placement: context.placement,
    anchor: context.anchor,
    gutter: context.gutter,
    trigger: context.triggerEl,
    dismiss,
  });
  const elementRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, popup.setElement);
  const { arrows, items } = useSplitArrows(children);

  useLayoutEffect(() => {
    node.setSide(popup.side);
  }, [node, popup.side]);

  if (!popup.mounted) return null;

  return (
    <Positioner popup={popup}>
      {arrows}
      <ContentElement
        status={popup.status}
        data-side={popup.side}
        data-align={popup.align}
        animation="none"
        {...props}
        ref={elementRef}
      >
        {items}
      </ContentElement>
    </Positioner>
  );
}

function SheetContent({
  backLabel: _rootHasNoBack,
  children,
  ...props
}: WithRef<MenuContentProps>) {
  const context = useMenuContext();
  const { node } = context;
  const api = {
    open: context.open,
    dismiss: (reason: SheetCloseReason, event?: Event) => node.close(reason, event),
    restoreFocus: true,
    returnFocusTo: context.returnFocusTo,
    label: {
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-label"] ? undefined : context.labelledBy,
    },
  };
  return (
    <SheetOverlayContent
      {...(props as Record<string, unknown>)}
      api={api}
      Content={ContentElement}
    >
      {children}
    </SheetOverlayContent>
  );
}

function BackItem({ label }: { label: string }) {
  const { node } = useMenuContext();
  return (
    <ItemPart
      value={BACK_ITEM_VALUE}
      closeOnSelect={false}
      notify={false}
      onSelect={() => node.close("close-press")}
    >
      <ChevronLeftIcon />
      {label}
    </ItemPart>
  );
}

function DrillDownContent({
  ref,
  backLabel = "Back",
  children,
  ...props
}: WithRef<MenuContentProps>) {
  const context = useMenuContext();
  const frame = useSheetFrame();
  const presence = usePresence(context.open);

  if (!presence.mounted || !frame) return null;

  return createPortal(
    <SheetPanel
      Content={ContentElement}
      status={presence.status}
      ref={ref}
      {...props}
    >
      <BackItem label={backLabel} />
      {children}
    </SheetPanel>,
    frame,
  );
}

function MenuContent(props: WithRef<MenuContentProps>) {
  const { layout } = useMenuContext();
  if (layout === "drill-down") return <DrillDownContent {...props} />;
  if (layout === "sheet") return <SheetContent {...props} />;
  return <AnchoredContent {...props} />;
}

interface ItemBehaviourProps {
  value: string;
  disabled?: boolean | undefined;
  /** Overrides the root's `closeOnSelect` for this item. */
  closeOnSelect?: boolean | undefined;
  /** The text typeahead matches, when it differs from the item's own. */
  valueText?: string | undefined;
  /** Called when this item is selected. */
  onSelect?: (() => void) | undefined;
}

interface ItemOptions {
  owner: MenuNode;
  notify?: boolean;
  toggle?: () => void;
  triggerItem?: boolean;
}

function useMenuItem(
  { value, disabled = false, closeOnSelect, valueText, onSelect }: ItemBehaviourProps,
  { owner, notify = true, toggle, triggerItem = false }: ItemOptions,
) {
  const highlighted = useStore(owner.store, selectIsHighlighted, value);
  const register = useCompositeListItem(owner.list, value, valueText);
  return {
    register,
    props: {
      id: owner.itemId(value),
      "aria-disabled": disabled || undefined,
      "data-disabled": disabled ? "" : undefined,
      "data-highlighted": highlighted ? "" : undefined,
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (disabled || event.pointerType !== "mouse" || highlighted) return;
        owner.hoverItem(value, pointOf(event), triggerItem);
      },
      onPointerLeave: (event: PointerEvent<HTMLElement>) => {
        if (disabled || event.pointerType !== "mouse") return;
        owner.leaveItem(triggerItem);
      },
      onPointerDown: () => {
        if (!disabled) owner.highlight(value);
      },
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (disabled || downloads(event) || opensInNewTab(event)) return;
        if (triggerItem) {
          owner.highlight(value);
          return;
        }
        owner.select(value, event.currentTarget, event.nativeEvent, {
          closeOnSelect,
          notify,
          onSelect,
          toggle,
        });
      },
      onDragStart: (event: DragEvent<HTMLElement>) => {
        if (event.currentTarget.matches("a[href]")) event.preventDefault();
      },
    },
  };
}

interface ItemPartProps
  extends Omit<ComponentProps<typeof StyledItem>, "onSelect">, ItemBehaviourProps {
  notify?: boolean;
}

function ItemPart({
  ref,
  value,
  disabled,
  closeOnSelect,
  valueText,
  onSelect,
  notify,
  ...rest
}: WithRef<ItemPartProps>) {
  const { node } = useMenuContext();
  const { register, props: itemProps } = useMenuItem(
    { value, disabled, closeOnSelect, valueText, onSelect },
    { owner: node, notify },
  );
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, register);
  return (
    <StyledItem
      {...mergeProps<ComponentProps<typeof StyledItem>>({ role: "menuitem", ...itemProps }, rest)}
      ref={composedRef}
    />
  );
}

interface MenuItemSlotProps {
  /** Faint text at the end of the row: a count, a shortcut, or why the item is disabled. */
  hint?: ReactNode;
  /** Muted line under the label, clamped to two lines. */
  description?: ReactNode;
}

function useItemSlots({ hint, description }: MenuItemSlotProps, describedBy: string | undefined) {
  const {
    hintId,
    descriptionId,
    describedBy: itemDescribedBy,
  } = useItemSlotIds({ hint, description }, describedBy);

  return {
    describedBy: itemDescribedBy,
    hint: hintId && (
      <ItemHint
        id={hintId}
        aria-hidden
      >
        {hint}
      </ItemHint>
    ),
    description: descriptionId && (
      <ItemDescription
        id={descriptionId}
        aria-hidden
      >
        {description}
      </ItemDescription>
    ),
  };
}

const ItemCheckedContext = createContext(false);

function ItemIndicator(props: ComponentProps<typeof StyledItemIndicator>) {
  return (
    <StyledItemIndicator
      {...checkedAttributes(useContext(ItemCheckedContext))}
      {...props}
    >
      {props.children ?? <CheckIcon />}
    </StyledItemIndicator>
  );
}

interface OptionItemBaseProps
  extends
    Omit<ComponentProps<typeof StyledItem>, "render" | "onSelect">,
    Omit<ItemBehaviourProps, "onSelect">,
    MenuItemSlotProps {}

export interface MenuCheckboxItemProps extends OptionItemBaseProps {
  checked?: boolean | undefined;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
}

export type MenuRadioItemProps = OptionItemBaseProps;

interface OptionItemProps extends WithRef<OptionItemBaseProps> {
  type: "checkbox" | "radio";
  checked: boolean;
  toggle: () => void;
  indicator: ReactNode;
}

function OptionItem({
  ref,
  type,
  checked,
  toggle,
  indicator,
  value,
  disabled,
  closeOnSelect,
  valueText,
  hint,
  description,
  children,
  "aria-describedby": describedBy,
  ...rest
}: OptionItemProps) {
  const { node } = useMenuContext();
  const { register, props: itemProps } = useMenuItem(
    { value, disabled, closeOnSelect, valueText },
    { owner: node, toggle },
  );
  const slots = useItemSlots({ hint, description }, describedBy);
  const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, register);

  return (
    <ItemCheckedContext value={checked}>
      <StyledItem
        {...mergeProps<ComponentProps<typeof StyledItem>>(
          {
            role: `menuitem${type}`,
            "aria-checked": checked,
            ...checkedAttributes(checked),
            ...itemProps,
          },
          rest,
        )}
        aria-describedby={slots.describedBy}
        ref={composedRef}
      >
        <ItemText>
          {children}
          {slots.description}
        </ItemText>
        {slots.hint}
        {indicator}
      </StyledItem>
    </ItemCheckedContext>
  );
}

function MenuCheckboxItem({
  checked = false,
  onCheckedChange,
  ...props
}: WithRef<MenuCheckboxItemProps>) {
  return (
    <OptionItem
      {...props}
      type="checkbox"
      checked={checked}
      toggle={() => onCheckedChange?.(!checked)}
      indicator={<ItemIndicator />}
    />
  );
}

/** A checkbox item drawn as a switch, for a setting that turns on and off; never tinted by `selection="tint"`. */
function MenuSwitchItem({
  checked = false,
  onCheckedChange,
  ...props
}: WithRef<MenuCheckboxItemProps>) {
  return (
    <OptionItem
      data-switch=""
      {...props}
      type="checkbox"
      checked={checked}
      toggle={() => onCheckedChange?.(!checked)}
      indicator={
        <ItemSwitch>
          <ItemSwitchThumb />
        </ItemSwitch>
      }
    />
  );
}

interface RadioGroupContextValue {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioItem(value: string) {
  const group = useContext(RadioGroupContext);
  return {
    checked: group?.value === value,
    toggle: () => group?.onValueChange?.(value),
  };
}

function MenuRadioItem(props: WithRef<MenuRadioItemProps>) {
  const radio = useRadioItem(props.value);
  return (
    <OptionItem
      {...props}
      type="radio"
      checked={radio.checked}
      toggle={radio.toggle}
      indicator={<ItemIndicator />}
    />
  );
}

function useGroupIds(id: string | undefined) {
  const generated = useId();
  const groupId = id ?? `menu-group:${generated}`;
  return { groupId, labelId: `${groupId}:label` };
}

export interface MenuRadioItemGroupProps extends ComponentProps<typeof StyledItemGroup> {
  /** The value of the checked radio item. */
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}

function RadioItemGroup({ id, value, onValueChange, ...rest }: WithRef<MenuRadioItemGroupProps>) {
  const { groupId } = useGroupIds(id);
  const radio = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <RadioGroupContext value={radio}>
      <StyledItemGroup
        id={groupId}
        role="group"
        {...rest}
      />
    </RadioGroupContext>
  );
}

function ItemLabel({
  icon,
  description,
  hint,
  children,
}: {
  icon: ReactNode;
  description: ReactNode;
  hint: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {icon}
      <Box flex="1">
        {children}
        {description}
      </Box>
      {hint}
    </>
  );
}

export interface MenuItemProps
  extends
    Omit<ComponentProps<typeof StyledItem>, "onSelect">,
    ItemBehaviourProps,
    MenuItemSlotProps {
  icon?: ReactNode;
  /** Colors the item with the danger palette, for actions that delete or can't be undone. */
  destructive?: boolean;
}

function MenuItem({
  icon,
  destructive,
  hint,
  description,
  children,
  render,
  ...rest
}: WithRef<MenuItemProps>) {
  const slots = useItemSlots({ hint, description }, rest["aria-describedby"]);
  const content = (label: ReactNode) => (
    <ItemLabel
      icon={icon}
      description={slots.description}
      hint={slots.hint}
    >
      {label}
    </ItemLabel>
  );

  const rendered = wrapRenderContent(render, children, content);
  return (
    <ItemPart
      {...rest}
      render={rendered.render}
      aria-describedby={slots.describedBy}
      data-destructive={destructive ? "" : undefined}
    >
      {rendered.children}
    </ItemPart>
  );
}

export interface MenuItemGroupProps extends ComponentProps<typeof StyledItemGroup> {
  /** Heading shown above the group's items. */
  label?: ReactNode;
  /** `caps` sets the heading as a small uppercase caption. */
  labelVariant?: "default" | "caps";
}

function MenuItemGroup({
  id,
  label,
  labelVariant = "default",
  children,
  ...rest
}: WithRef<MenuItemGroupProps>) {
  const { groupId, labelId } = useGroupIds(id);
  const labelled = isRenderable(label);
  return (
    <StyledItemGroup
      id={groupId}
      role="group"
      aria-labelledby={labelled ? labelId : undefined}
      {...rest}
    >
      {labelled && (
        <StyledItemGroupLabel
          id={labelId}
          userSelect="none"
          data-variant={labelVariant}
        >
          {label}
        </StyledItemGroupLabel>
      )}
      {children}
    </StyledItemGroup>
  );
}

export interface MenuSegment {
  value: string;
  label: ReactNode;
  disabled?: boolean | undefined;
}

export interface MenuSegmentGroupProps extends Omit<
  ComponentProps<typeof StyledSegmentGroup>,
  "children"
> {
  /** Names the choice; shown at the start of the row. */
  label: ReactNode;
  segments: readonly MenuSegment[];
  /** The value of the checked segment. */
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}

function SegmentItem({
  value,
  disabled,
  children,
}: Omit<MenuSegment, "label"> & { children: ReactNode }) {
  const { node } = useMenuContext();
  const radio = useRadioItem(value);
  const { register, props: itemProps } = useMenuItem(
    { value, disabled },
    { owner: node, toggle: radio.toggle },
  );
  return (
    <StyledSegmentItem
      role="menuitemradio"
      aria-checked={radio.checked}
      {...checkedAttributes(radio.checked)}
      {...itemProps}
      ref={register}
    >
      {children}
    </StyledSegmentItem>
  );
}

/** One choice of a few, as a labelled row of segments; each segment stays a menu radio item. */
function MenuSegmentGroup({
  id,
  label,
  segments,
  value,
  onValueChange,
  ...rest
}: WithRef<MenuSegmentGroupProps>) {
  const { groupId, labelId } = useGroupIds(id);
  const radio = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <RadioGroupContext value={radio}>
      <StyledSegmentGroup
        id={groupId}
        role="group"
        aria-labelledby={labelId}
        {...rest}
      >
        <SegmentLabel id={labelId}>{label}</SegmentLabel>
        <SegmentTrack>
          {segments.map((segment) => (
            <SegmentItem
              key={segment.value}
              value={segment.value}
              disabled={segment.disabled}
            >
              {segment.label}
            </SegmentItem>
          ))}
        </SegmentTrack>
      </StyledSegmentGroup>
    </RadioGroupContext>
  );
}

export interface MenuTriggerItemProps
  extends Omit<ComponentProps<typeof StyledItem>, "render">, MenuItemSlotProps {
  icon?: ReactNode;
}

function requireParent(node: MenuNode): MenuNode {
  if (!node.parent) {
    throw new Error("Menu.TriggerItem must be inside the Menu.Content of the menu it opens from.");
  }
  return node.parent;
}

function MenuTriggerItem({
  ref,
  icon,
  hint,
  description,
  children,
  "aria-describedby": describedBy,
  ...rest
}: WithRef<MenuTriggerItemProps>) {
  const context = useMenuContext();
  const { node } = context;
  const parent = requireParent(node);
  const inSheet = useContext(ParentMenuContext)?.layout !== "anchored";
  const { register, props: itemProps } = useMenuItem(
    { value: node.triggerItemValue },
    { owner: parent, triggerItem: true },
  );
  const slots = useItemSlots({ hint, description }, describedBy);
  const itemRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, register);
  const composedRef = useComposedRefs(itemRef, context.setTriggerEl);

  return (
    <StyledItem
      {...mergeProps<ComponentProps<typeof StyledItem>>(
        {
          role: "menuitem",
          ...getPopupTriggerProps({
            open: context.open,
            contentId: context.ids.content,
            contentMounted: context.contentMounted,
            haspopup: "menu",
          }),
          ...itemProps,
        },
        {
          onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
            if (!inSheet && event.pointerType === "mouse") node.hoverTrigger(pointOf(event));
          },
          onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
            if (!inSheet && event.pointerType === "mouse") node.leaveTrigger(pointOf(event));
          },
          onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
            if (!isContextMenuEvent(event)) event.preventDefault();
          },
          onClick: (event: MouseEvent<HTMLDivElement>) => {
            if (!context.open) node.open("trigger-press", event.nativeEvent);
          },
        },
        rest,
      )}
      aria-describedby={slots.describedBy}
      ref={composedRef}
    >
      <ItemLabel
        icon={icon}
        description={slots.description}
        hint={slots.hint}
      >
        {children}
      </ItemLabel>
      <ChevronRightIcon />
    </StyledItem>
  );
}

function Separator(props: ComponentProps<typeof StyledSeparator>) {
  return (
    <StyledSeparator
      role="separator"
      aria-orientation="horizontal"
      {...props}
    />
  );
}

export const Menu = {
  Root: MenuRoot,
  Content: MenuContent,
  Arrow,
  CheckboxItem: MenuCheckboxItem,
  SwitchItem: MenuSwitchItem,
  RadioItem: MenuRadioItem,
  Item: MenuItem,
  ItemGroup: MenuItemGroup,
  TriggerItem: MenuTriggerItem,
  RadioItemGroup,
  SegmentGroup: MenuSegmentGroup,
  ContextTrigger,
  Separator,
  ItemText,
  Trigger: MenuTrigger,
};
