import { ChevronDownIcon } from "lucide-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  createContext,
  useContext,
  useId,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { accordion } from "#styled-system/recipes";

import { isSafari } from "../../foundations/dom";
import { useControllableState } from "../../hooks/useControllableState";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import {
  CompositeList,
  elementList,
  getArrowStep,
  getFirstEnabledIndex,
  getLastEnabledIndex,
  getNextIndex,
  useCompositeListItem,
} from "../../primitives/composite";
import { useLocale } from "../../primitives/locale";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { useMergedRefs } from "../../primitives/render/useMergedRefs";
import {
  type CollapsibleChangeReason,
  CollapsiblePresence,
  CollapsibleProvider,
  collapsibleStateAttributes,
  panelAttributes,
  useCollapsible,
  useCollapsibleContext,
  useCollapsiblePanel,
} from "../collapsiblePanel";

/** Why `onValueChange` was called, and a way to keep the open items as they are. */
export type AccordionValueChangeDetails = ChangeDetails<CollapsibleChangeReason>;

export type AccordionOrientation = "horizontal" | "vertical";

const { withProvider, withContext } = createSlotRecipeContext(accordion);

const StyledRoot = withProvider(renderable.div, "root");
const StyledItem = withContext(renderable.div, "item");
const StyledItemTrigger = withContext(renderable.button, "itemTrigger");
const StyledItemContent = withContext(renderable.div, "itemContent");
const StyledItemIndicator = withContext(renderable.div, "itemIndicator", {
  defaultProps: { children: <ChevronDownIcon /> },
});
const ItemBody = withContext(renderable.div, "itemBody");

interface AccordionContextValue {
  value: string[];
  toggle: (item: string, event: Event) => void;
  disabled: boolean;
  orientation: AccordionOrientation;
  rtl: boolean;
  id: string;
  triggers: CompositeList;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(part: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) throw new Error(`Accordion.${part} must be placed inside <Accordion.Root>.`);
  return context;
}

const orientationAttribute = (orientation: AccordionOrientation) => ({
  "data-orientation": orientation,
});

const ItemValueContext = createContext<string | null>(null);

function useItemValue(part: string): string {
  const value = useContext(ItemValueContext);
  if (value === null) throw new Error(`Accordion.${part} must be placed inside <Accordion.Item>.`);
  return value;
}

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface AccordionRootProps extends Omit<StyledRootProps, "defaultValue"> {
  /** The open items' values. */
  value?: string[] | undefined;
  /** @default [] */
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[], details: AccordionValueChangeDetails) => void) | undefined;
  /** Lets more than one item be open at once. */
  multiple?: boolean | undefined;
  /** Lets the open item close, leaving none open. */
  collapsible?: boolean | undefined;
  disabled?: boolean | undefined;
  /** The direction the arrow keys move between triggers. @default "vertical" */
  orientation?: AccordionOrientation | undefined;
}

const EMPTY: string[] = [];

function Root({
  value: valueProp,
  defaultValue = EMPTY,
  onValueChange,
  multiple = false,
  collapsible = false,
  disabled = false,
  orientation = "vertical",
  ...props
}: AccordionRootProps) {
  const id = useId();
  const { dir } = useLocale();
  const [triggers] = useState(() => new CompositeList());
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });

  const toggle = (item: string, event: Event) => {
    const open = value.includes(item);
    if (open && !collapsible && !multiple) return;
    const next = open
      ? value.filter((entry) => entry !== item)
      : multiple
        ? [...value, item]
        : [item];
    const details = createChangeDetails<CollapsibleChangeReason>("trigger-press", event);
    onValueChange?.(next, details);
    if (!details.canceled) setValue(next);
  };

  return (
    <AccordionContext
      value={{ value, toggle, disabled, orientation, rtl: dir === "rtl", id, triggers }}
    >
      <StyledRoot
        id={`accordion:${id}`}
        data-orientation={orientation}
        {...props}
      />
    </AccordionContext>
  );
}

type StyledItemProps = ComponentProps<typeof StyledItem>;

export interface AccordionItemProps extends StyledItemProps {
  value: string;
  disabled?: boolean | undefined;
}

function Item({ value, disabled, ...props }: AccordionItemProps) {
  const root = useAccordionContext("Item");
  const open = root.value.includes(value);
  const itemDisabled = disabled ?? root.disabled;
  const state = useCollapsible({
    open,
    disabled: itemDisabled,
    contentId: `accordion:${root.id}:content:${value}`,
    triggerId: `accordion:${root.id}:trigger:${value}`,
    onToggle: (event) => root.toggle(value, event),
  });

  return (
    <ItemValueContext value={value}>
      <CollapsibleProvider value={state}>
        <StyledItem
          {...mergeProps<StyledItemProps>(
            {
              id: `accordion:${root.id}:item:${value}`,
              ...orientationAttribute(root.orientation),
              ...collapsibleStateAttributes(open, itemDisabled),
            },
            props,
          )}
        />
      </CollapsibleProvider>
    </ItemValueContext>
  );
}

type ItemTriggerProps = ComponentProps<typeof StyledItemTrigger>;

function ItemTrigger({ ref, ...props }: ItemTriggerProps) {
  const root = useAccordionContext("ItemTrigger");
  const value = useItemValue("ItemTrigger");
  const state = useCollapsibleContext("Accordion.ItemTrigger");
  const register = useCompositeListItem(root.triggers, value);
  const triggerRef = useMergedRefs(register, ref);

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>) => {
    const elements = root.triggers.items().map((item) => item.element);
    const list = elementList(elements);
    const current = elements.indexOf(event.currentTarget);
    const step = getArrowStep(event.key, root.orientation, root.rtl);
    let index: number | undefined;
    if (step !== 0) {
      index = getNextIndex(list, current, { decrement: step < 0, loop: true });
    } else if (event.key === "Home") {
      index = getFirstEnabledIndex(list);
    } else if (event.key === "End") {
      index = getLastEnabledIndex(list);
    }
    if (index === undefined) return;
    event.preventDefault();
    elements[index]?.focus();
  };

  return (
    <StyledItemTrigger
      {...mergeProps<ItemTriggerProps>(
        {
          id: state.triggerId,
          type: "button",
          disabled: state.disabled,
          "aria-controls": state.visible ? state.contentId : undefined,
          "aria-expanded": state.open,
          ...orientationAttribute(root.orientation),
          ...collapsibleStateAttributes(state.open, state.disabled),
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (state.disabled) return;
            if (isSafari()) event.currentTarget.focus();
            state.toggle(event.nativeEvent);
          },
          onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
            if (event.defaultPrevented || state.disabled) return;
            moveFocus(event);
          },
        },
        props,
      )}
      ref={triggerRef}
    />
  );
}

export interface AccordionItemContentProps extends ComponentProps<typeof StyledItemContent> {
  /** Keeps the content in the DOM, hidden, while its item is closed, along with its state. */
  keepMounted?: boolean | undefined;
}

function ItemContent({ ref, keepMounted = false, ...props }: AccordionItemContentProps) {
  const root = useAccordionContext("ItemContent");
  const state = useCollapsibleContext("Accordion.ItemContent");
  const panelRef = useCollapsiblePanel(state, ref);

  return (
    <CollapsiblePresence
      state={state}
      keepMounted={keepMounted}
    >
      <StyledItemContent
        {...mergeProps<ComponentProps<typeof StyledItemContent>>(
          {
            ...panelAttributes(state),
            role: "region",
            "aria-labelledby": state.triggerId,
            ...orientationAttribute(root.orientation),
          },
          props,
        )}
        ref={panelRef}
      />
    </CollapsiblePresence>
  );
}

function ItemIndicator(props: ComponentProps<typeof StyledItemIndicator>) {
  const root = useAccordionContext("ItemIndicator");
  const state = useCollapsibleContext("Accordion.ItemIndicator");
  return (
    <StyledItemIndicator
      {...mergeProps<ComponentProps<typeof StyledItemIndicator>>(
        {
          "aria-hidden": true,
          ...orientationAttribute(root.orientation),
          ...collapsibleStateAttributes(state.open, state.disabled),
        },
        props,
      )}
    />
  );
}

/** Sections that each open from a trigger; one at a time unless `multiple`. */
export const Accordion = {
  Root,
  Item,
  ItemContent,
  ItemIndicator,
  ItemTrigger,
  ItemBody,
};
