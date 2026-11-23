import {
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { toolbar } from "#styled-system/recipes";

import { isEditingControl, isModifierKey } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { getKeyTarget, getTargetIndex } from "../../primitives/composite";
import { getFocusables } from "../../primitives/focus";
import { useLocale } from "../../primitives/locale";
import { dataAttr, renderable } from "../../primitives/render";
import { Button, type ButtonProps } from "../Buttons";
import { Tooltip } from "../Tooltip";
import {
  type ToolbarOrientation as Orientation,
  ToolbarContext,
  useToolbarContext,
} from "./toolbarContext";

const { withProvider, withContext } = createSlotRecipeContext(toolbar);

const StyledRoot = withProvider(renderable.div, "root");
const StyledSeparator = withContext(renderable.div, "separator");

function getItems(root: HTMLElement, demoted: ReadonlyMap<HTMLElement, string | null>) {
  return getFocusables(root).filter(
    (el) =>
      (el.tabIndex >= 0 || demoted.has(el)) &&
      el.closest("[role=toolbar], [popover], dialog") === root,
  );
}

const isRadio = (element: HTMLElement): element is HTMLInputElement =>
  element instanceof HTMLInputElement && element.type === "radio";

// Browsers tab to a radio group's checked radio, so the whole group shares the tab stop.
function tabStopGroup(stop: HTMLElement | null, items: HTMLElement[]): HTMLElement[] {
  if (!stop) return [];
  if (!isRadio(stop) || !stop.name) return [stop];
  return items.filter(
    (element) => isRadio(element) && element.name === stop.name && element.form === stop.form,
  );
}

function restoreTabIndex(element: HTMLElement, original: string | null) {
  if (original === null) element.removeAttribute("tabindex");
  else element.setAttribute("tabindex", original);
}

function useRovingTabStop(rootRef: RefObject<HTMLElement | null>) {
  const stopRef = useRef<HTMLElement | null>(null);
  const demotedRef = useRef(new Map<HTMLElement, string | null>());
  const syncRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const demoted = demotedRef.current;
    const mutationObserver = new MutationObserver(() => sync());
    // CSS alone can hide or show an item without a mutation, so Tab re-syncs before it moves focus.
    const syncBeforeTab = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Tab") sync();
    };

    function sync() {
      if (!root) return;
      const items = getItems(root, demoted);
      const current = stopRef.current;
      const stop = current && items.includes(current) ? current : (items[0] ?? null);
      stopRef.current = stop;
      const stopGroup = tabStopGroup(stop, items);
      for (const [element, original] of demoted) {
        if (stopGroup.includes(element) || !items.includes(element)) {
          demoted.delete(element);
          restoreTabIndex(element, original);
        }
      }
      for (const element of items) {
        if (stopGroup.includes(element)) continue;
        if (!demoted.has(element)) demoted.set(element, element.getAttribute("tabindex"));
        if (element.getAttribute("tabindex") !== "-1") element.setAttribute("tabindex", "-1");
      }
    }

    syncRef.current = sync;
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "hidden", "inert", "tabindex"],
    });
    root.ownerDocument.addEventListener("keydown", syncBeforeTab, true);
    sync();

    return () => {
      syncRef.current = () => {};
      mutationObserver.disconnect();
      root.ownerDocument.removeEventListener("keydown", syncBeforeTab, true);
      for (const [element, original] of demoted) restoreTabIndex(element, original);
      demoted.clear();
    };
  }, [rootRef]);

  return {
    items: (root: HTMLElement) => getItems(root, demotedRef.current),
    moveTo: (root: HTMLElement, element: HTMLElement) => {
      if (element === stopRef.current || !getItems(root, demotedRef.current).includes(element)) {
        return;
      }
      stopRef.current = element;
      syncRef.current();
    },
  };
}

function minContentWidth(node: HTMLElement): number {
  const { flex, width } = node.style;
  node.style.flex = "none";
  node.style.width = "min-content";
  const measured = node.offsetWidth;
  node.style.flex = flex;
  node.style.width = width;
  return measured;
}

function useCollapsed(ref: RefObject<HTMLElement | null>, below: number | undefined): boolean {
  const [collapsed, setCollapsed] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (below === undefined || !node) {
      setCollapsed(false);
      return;
    }
    // An unlaid-out toolbar (display: none, jsdom) measures 0 and keeps its labels.
    const update = (width: number) => {
      if (width <= 0) return;
      // A collapsed toolbar can't shrink past its icons, so at that width the space it is given is unknown.
      const pinned = node.hasAttribute("data-collapsed") && width <= minContentWidth(node);
      setCollapsed(width < below || pinned);
    };
    update(node.offsetWidth);
    const observer = new ResizeObserver(([entry]) =>
      update(entry?.borderBoxSize[0]?.inlineSize ?? node.offsetWidth),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, below]);

  return collapsed;
}

export interface ToolbarRootProps extends ComponentProps<typeof StyledRoot> {
  /** Arrow keys move between items along it: Left/Right when horizontal, Up/Down when vertical. */
  orientation?: Orientation | undefined;
  /**
   * Width in px below which `Toolbar.Button` labels collapse to icons, each label becoming its
   * button's `aria-label` and tooltip. It measures the toolbar itself, so let the toolbar take its
   * width from its container (`flex="1"`, a full-width row) rather than from its items.
   */
  collapseBelow?: number | undefined;
}

function Root({
  ref,
  orientation = "horizontal",
  collapseBelow,
  onKeyDown,
  onFocus,
  ...rest
}: ToolbarRootProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, nodeRef);
  const tabStop = useRovingTabStop(nodeRef);
  const collapsed = useCollapsed(nodeRef, collapseBelow);
  const rtl = useLocale().dir === "rtl";

  const navigate = (event: KeyboardEvent<HTMLElement>) => {
    const root = nodeRef.current;
    const target = event.target as HTMLElement;
    if (!root || event.defaultPrevented || !root.contains(target)) return;
    // A toolbar's arrows step through its radios too, so only editing controls keep them.
    if (isModifierKey(event) || isEditingControl(target)) return;
    const keyTarget = getKeyTarget(event.key, orientation, rtl);
    if (!keyTarget) return;
    const items = tabStop.items(root);
    const index = items.indexOf(target);
    if (index === -1) return;
    const list = { length: items.length, isDisabled: () => false };
    const nextItem = items[getTargetIndex(list, index, keyTarget, true)];
    if (!nextItem) return;
    event.preventDefault();
    if (nextItem !== target) nextItem.focus();
  };
  const state = useMemo(() => ({ orientation, collapsed }), [orientation, collapsed]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    navigate(event);
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    tabStop.moveTo(event.currentTarget, event.target);
  };

  return (
    <ToolbarContext.Provider value={state}>
      <StyledRoot
        ref={composedRef}
        role="toolbar"
        aria-orientation={orientation}
        data-orientation={orientation}
        data-collapsed={dataAttr(collapsed)}
        data-collapsible={dataAttr(collapseBelow !== undefined)}
        {...rest}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />
    </ToolbarContext.Provider>
  );
}

export interface ToolbarButtonProps extends Omit<ButtonProps, "children"> {
  icon: ReactNode;
  label: string;
  /** Shown on hover and focus whether or not the label has collapsed, e.g. why it is disabled. */
  tooltip?: ReactNode;
}

function ToolbarButton({ ref, icon, label, tooltip, ...rest }: ToolbarButtonProps) {
  const collapsed = useToolbarContext()?.collapsed ?? false;

  return (
    <Tooltip
      label={tooltip ?? label}
      disabled={tooltip == null && !collapsed}
    >
      <Button
        ref={ref}
        aria-label={collapsed ? label : undefined}
        {...rest}
        px={collapsed ? "0" : rest.px}
        py={collapsed ? "0" : rest.py}
      >
        {icon}
        {!collapsed && label}
      </Button>
    </Tooltip>
  );
}

export type ToolbarSeparatorProps = ComponentProps<typeof StyledSeparator>;

function Separator(props: ToolbarSeparatorProps) {
  const orientation = useToolbarContext()?.orientation ?? "horizontal";
  const own = orientation === "horizontal" ? "vertical" : "horizontal";
  return (
    <StyledSeparator
      role="separator"
      aria-orientation={own}
      data-orientation={own}
      {...props}
    />
  );
}

export const Toolbar = {
  Root,
  Button: ToolbarButton,
  Separator,
};
