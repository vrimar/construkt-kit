import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tabs } from "#styled-system/recipes";

import { isComposingEvent, isSafari } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import {
  type CompositeItem,
  CompositeList,
  elementList,
  getArrowStep,
  getFirstEnabledIndex,
  getLastEnabledIndex,
  getNextIndex,
  isItemDisabled,
  useCompositeListItem,
} from "../../primitives/composite";
import { getTabbables } from "../../primitives/focus";
import { useLocale } from "../../primitives/locale";
import { PresenceActivity, presenceAttributes, usePresence } from "../../primitives/presence";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";

const { withProvider, withContext } = createSlotRecipeContext(tabs);

const StyledRoot = withProvider(renderable.div, "root");
const StyledList = withContext(renderable.div, "list");
const StyledTrigger = withContext(renderable.button, "trigger");
const StyledContent = withContext(renderable.div, "content");
const StyledIndicator = withContext(renderable.div, "indicator");

export type TabsValueChangeReason = "trigger-press" | "keyboard";

/** Why `onValueChange` was called, and a way to keep the selected tab as it is. */
export type TabsValueChangeDetails = ChangeDetails<TabsValueChangeReason>;

export type TabsOrientation = "horizontal" | "vertical";

export interface TabsRootOptions {
  /** The selected tab's `value`. */
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string, details: TabsValueChangeDetails) => void) | undefined;
  /** @default "horizontal" */
  orientation?: TabsOrientation | undefined;
  /** Whether arrow keys select the tab they move to, or only move focus to it. @default "automatic" */
  activationMode?: "automatic" | "manual" | undefined;
  /** Whether arrow keys wrap from the last tab to the first and back. @default true */
  loopFocus?: boolean | undefined;
}

interface TabsContextValue {
  value: string | null;
  select: (value: string, reason: TabsValueChangeReason, event: Event) => void;
  orientation: TabsOrientation;
  automatic: boolean;
  loopFocus: boolean;
  rtl: boolean;
  triggers: CompositeList;
  syncTabStop: () => void;
  triggerId: (value: string) => string;
  contentId: (value: string) => string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`Tabs.${part} must be placed inside <Tabs.Root>.`);
  return context;
}

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface TabsRootProps
  extends Omit<StyledRootProps, keyof TabsRootOptions>, TabsRootOptions {}

function Root({
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  activationMode = "automatic",
  loopFocus = true,
  ...props
}: TabsRootProps) {
  const uid = useId();
  const rtl = useLocale().dir === "rtl";
  const [triggers] = useState(() => new CompositeList());
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
  });
  const syncTabStop = () => setTabStop(triggers.items(), value);

  useLayoutEffect(syncTabStop);

  const context: TabsContextValue = {
    value,
    select(next, reason, event) {
      if (next === value) return;
      const details = createChangeDetails(reason, event);
      onValueChange?.(next, details);
      if (!details.canceled) setValue(next);
    },
    orientation,
    automatic: activationMode === "automatic",
    loopFocus,
    rtl,
    triggers,
    syncTabStop,
    triggerId: (item) => `tabs:${uid}:trigger-${item}`,
    contentId: (item) => `tabs:${uid}:content-${item}`,
  };

  return (
    <TabsContext.Provider value={context}>
      <StyledRoot
        data-orientation={orientation}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function setTabStop(items: CompositeItem[], value: string | null) {
  const enabled = items.filter((item) => !isItemDisabled(item.element));
  const stop = enabled.find((item) => item.value === value) ?? enabled[0];
  for (const item of items) item.element.setAttribute("tabindex", item === stop ? "0" : "-1");
}

export type TabsListProps = ComponentProps<typeof StyledList>;

function List(props: TabsListProps) {
  const context = useTabs("List");

  return (
    <StyledList
      {...mergeProps<TabsListProps>(
        {
          role: "tablist",
          "aria-orientation": context.orientation,
          "data-orientation": context.orientation,
          onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
            if (event.defaultPrevented || isComposingEvent(event)) return;
            const items = context.triggers.items();
            const current = items.findIndex((item) => item.element.contains(event.target as Node));
            if (current === -1) return;
            const list = elementList(items.map((item) => item.element));
            const step = getArrowStep(event.key, context.orientation, context.rtl);
            let next: number;
            if (step !== 0) {
              next = getNextIndex(list, current, { decrement: step < 0, loop: context.loopFocus });
            } else if (event.key === "Home") {
              next = getFirstEnabledIndex(list);
            } else if (event.key === "End") {
              next = getLastEnabledIndex(list);
            } else {
              return;
            }
            event.preventDefault();
            const target = items[next];
            if (!target) return;
            target.element.focus();
            if (context.automatic) context.select(target.value, "keyboard", event.nativeEvent);
          },
        } as TabsListProps,
        props,
      )}
    />
  );
}

type StyledTriggerProps = ComponentProps<typeof StyledTrigger>;

export interface TabsTriggerProps extends Omit<StyledTriggerProps, "value"> {
  /** The value the tab selects, which its `Tabs.Content` shares. */
  value: string;
  disabled?: boolean | undefined;
}

const opensInNewTab = (event: MouseEvent<HTMLElement>) =>
  event.currentTarget.matches("a[href]") && (event.button === 1 || event.metaKey || event.ctrlKey);

function Trigger({ ref, value, disabled = false, ...props }: TabsTriggerProps) {
  const context = useTabs("Trigger");
  const selected = context.value === value;
  const register = useCompositeListItem(context.triggers, value);
  const composedRef = useComposedRefs<HTMLButtonElement>(register, ref);
  const { syncTabStop } = context;

  useLayoutEffect(syncTabStop, [disabled, syncTabStop]);

  return (
    <StyledTrigger
      {...mergeProps<StyledTriggerProps>(
        {
          id: context.triggerId(value),
          role: "tab",
          type: "button",
          disabled,
          "aria-disabled": disabled || undefined,
          "aria-selected": selected,
          "aria-controls": selected ? context.contentId(value) : undefined,
          "data-value": value,
          "data-selected": dataAttr(selected),
          "data-disabled": dataAttr(disabled),
          "data-orientation": context.orientation,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (event.defaultPrevented || disabled || opensInNewTab(event)) return;
            if (isSafari()) event.currentTarget.focus();
            context.select(value, "trigger-press", event.nativeEvent);
          },
        } as StyledTriggerProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

type StyledContentProps = ComponentProps<typeof StyledContent>;

export interface TabsContentProps extends Omit<StyledContentProps, "value"> {
  /** The value of the tab that shows this panel. */
  value: string;
  /**
   * Keeps the panel's DOM and state while another tab is selected, hidden in an `<Activity>`,
   * instead of unmounting it.
   * @default false
   */
  keepMounted?: boolean | undefined;
}

function Content({ ref, value, keepMounted = false, ...props }: TabsContentProps) {
  const context = useTabs("Content");
  const selected = context.value === value;
  const presence = usePresence(selected, { immediate: true });
  const elementRef = useRef<HTMLDivElement>(null);
  const ownRef = useComposedRefs<HTMLDivElement>(elementRef, presence.setElement);
  const composedRef = useComposedRefs<HTMLDivElement>(ownRef, ref);
  const ownTabIndex = props.tabIndex !== undefined;

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!selected || !element || ownTabIndex) return;
    if (getTabbables(element).length > 0) element.removeAttribute("tabindex");
    else element.setAttribute("tabindex", "0");
  }, [selected, ownTabIndex]);

  return (
    <PresenceActivity
      mounted={presence.mounted}
      keepMounted={keepMounted}
    >
      <StyledContent
        {...mergeProps<StyledContentProps>(
          {
            id: context.contentId(value),
            role: "tabpanel",
            "aria-labelledby": context.triggerId(value),
            hidden: !presence.mounted,
            "data-selected": dataAttr(selected),
            "data-orientation": context.orientation,
            ...presenceAttributes(presence.status),
          } as StyledContentProps,
          props,
        )}
        ref={composedRef}
      />
    </PresenceActivity>
  );
}

interface IndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const sameRect = (a: IndicatorRect | null, b: IndicatorRect | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height);

const offsetRect = (element: HTMLElement): IndicatorRect => ({
  left: element.offsetLeft,
  top: element.offsetTop,
  width: element.offsetWidth,
  height: element.offsetHeight,
});

export type TabsIndicatorProps = ComponentProps<typeof StyledIndicator>;

/** Slides to the selected tab: it reads the tab's box from `--indicator-left`, `-top`, `-width` and `-height`. */
function Indicator({ ref, style, ...props }: TabsIndicatorProps) {
  const context = useTabs("Indicator");
  const { triggers, value, orientation } = context;
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<IndicatorRect | null>(null);
  const composedRef = useComposedRefs<HTMLDivElement>(setElement, ref);

  useLayoutEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const trigger = triggers.find(value)?.element;
      const next = trigger ? offsetRect(trigger) : null;
      setRect((previous) => (sameRect(previous, next) ? previous : next));
    });
    const list = element.closest<HTMLElement>("[role=tablist]") ?? element.parentElement;
    if (list) observer.observe(list, { box: "border-box" });
    for (const item of triggers.items()) observer.observe(item.element, { box: "border-box" });
    return () => observer.disconnect();
  }, [element, triggers, value, orientation]);

  const empty =
    !rect || (rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0);

  return (
    <StyledIndicator
      hidden={empty}
      data-orientation={orientation}
      {...props}
      style={{
        ...(rect && {
          "--indicator-left": `${rect.left}px`,
          "--indicator-top": `${rect.top}px`,
          "--indicator-width": `${rect.width}px`,
          "--indicator-height": `${rect.height}px`,
        }),
        ...style,
      }}
      ref={composedRef}
    />
  );
}

export const Tabs = {
  Root,
  List,
  Trigger,
  Content,
  Indicator,
};
