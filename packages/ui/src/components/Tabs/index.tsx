import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tabs } from "#styled-system/recipes";

import { isComposingEvent, opensLinkNatively } from "../../foundations/dom";
import { isSafari } from "../../foundations/platform";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import {
  type RenderedParts,
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../../hooks/useRenderedParts";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import {
  CompositeList,
  elementList,
  getKeyTarget,
  getTargetIndex,
  syncRovingTabStop,
  useCompositeListItem,
} from "../../primitives/composite";
import { useHasTabbable } from "../../primitives/focus";
import { useLocale } from "../../primitives/locale";
import { PresenceActivity, presenceAttributes, usePresence } from "../../primitives/presence";
import { dataAttr, mergeProps, renderable } from "../../primitives/render";
import { createPartContext } from "../partContext";
import { useSlidingIndicator } from "../slidingIndicator";

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
  /** The ids a tab's trigger and content render with unless given their own. */
  ids: { trigger: (value: string) => string; content: (value: string) => string };
  rendered: RenderedParts<TabsPart>;
  reportRendered: ReportRendered<TabsPart>;
}

type TabsPart = `trigger:${string}` | `content:${string}`;

const [TabsContext, useTabs] = createPartContext<TabsContextValue>("<Tabs.Root>");

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
  const [rendered, reportRendered] = useRenderedParts<TabsPart>();
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
  });
  const syncTabStop = () => syncRovingTabStop(triggers, value);

  useLayoutEffect(syncTabStop);

  const context: TabsContextValue = {
    value,
    select(next, reason, event) {
      if (next === value) return;
      if (emitChange(onValueChange, next, reason, event)) setValue(next);
    },
    orientation,
    automatic: activationMode === "automatic",
    loopFocus,
    rtl,
    triggers,
    syncTabStop,
    ids: {
      trigger: (item) => `tabs:${uid}:trigger-${item}`,
      content: (item) => `tabs:${uid}:content-${item}`,
    },
    rendered,
    reportRendered,
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

export type TabsListProps = ComponentProps<typeof StyledList>;

function List(props: TabsListProps) {
  const context = useTabs("Tabs.List");

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
            const keyTarget = getKeyTarget(event.key, context.orientation, context.rtl);
            if (!keyTarget) return;
            event.preventDefault();
            const list = elementList(items.map((item) => item.element));
            const target = items[getTargetIndex(list, current, keyTarget, context.loopFocus)];
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

function Trigger({ ref, value, disabled = false, ...props }: TabsTriggerProps) {
  const context = useTabs("Tabs.Trigger");
  const selected = context.value === value;
  const register = useCompositeListItem(context.triggers, value);
  const composedRef = useComposedRefs<HTMLButtonElement>(register, ref);
  const { syncTabStop } = context;
  const triggerId = useReportRendered(
    context.reportRendered,
    `trigger:${value}`,
    props.id ?? context.ids.trigger(value),
  );

  useLayoutEffect(syncTabStop, [disabled, syncTabStop]);

  return (
    <StyledTrigger
      {...mergeProps<StyledTriggerProps>(
        {
          id: triggerId,
          role: "tab",
          type: props.render ? undefined : "button",
          disabled,
          "aria-disabled": disabled || undefined,
          "aria-selected": selected,
          "aria-controls": selected ? context.rendered[`content:${value}`] : undefined,
          "data-value": value,
          "data-selected": dataAttr(selected),
          "data-disabled": dataAttr(disabled),
          "data-orientation": context.orientation,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (event.defaultPrevented || disabled || opensLinkNatively(event)) return;
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
  const context = useTabs("Tabs.Content");
  const selected = context.value === value;
  const presence = usePresence(selected, { immediate: true });
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, setElement, presence.setElement);
  const hasTabbable = useHasTabbable(element, selected && props.tabIndex === undefined);
  const contentId = useReportRendered(
    context.reportRendered,
    `content:${value}`,
    props.id ?? context.ids.content(value),
  );

  return (
    <PresenceActivity
      mounted={presence.mounted}
      keepMounted={keepMounted}
    >
      <StyledContent
        {...mergeProps<StyledContentProps>(
          {
            id: contentId,
            role: "tabpanel",
            tabIndex: selected && !hasTabbable ? 0 : undefined,
            "aria-labelledby": context.rendered[`trigger:${value}`],
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

export type TabsIndicatorProps = ComponentProps<typeof StyledIndicator>;

/** Slides to the selected tab: it reads the tab's box from `--indicator-left`, `-top`, `-width` and `-height`. */
function Indicator({ ref, style, ...props }: TabsIndicatorProps) {
  const { triggers, value, orientation } = useTabs("Tabs.Indicator");
  const elementRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(elementRef, ref);
  const indicator = useSlidingIndicator(
    {
      selected: () => triggers.find(value)?.element,
      observed: () => {
        const element = elementRef.current;
        const list = element?.closest<HTMLElement>("[role=tablist]") ?? element?.parentElement;
        return [...(list ? [list] : []), ...triggers.items().map((item) => item.element)];
      },
    },
    value,
    orientation,
  );

  return (
    <StyledIndicator
      hidden={indicator.hidden}
      data-orientation={orientation}
      {...props}
      style={{ ...indicator.style, ...style }}
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
