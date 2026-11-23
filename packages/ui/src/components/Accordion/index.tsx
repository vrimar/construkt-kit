import { ChevronDownIcon } from "lucide-react";
import { type ComponentProps, type KeyboardEvent, useId, useState } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { accordion } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import {
  CompositeList,
  elementList,
  getKeyTarget,
  getTargetIndex,
  useCompositeListItem,
} from "../../primitives/composite";
import { useLocale } from "../../primitives/locale";
import { PresenceActivity } from "../../primitives/presence";
import { mergeProps, renderable } from "../../primitives/render";
import {
  type CollapsibleChangeReason,
  CollapsibleProvider,
  collapsibleIndicatorProps,
  collapsibleStateAttributes,
  useCollapsible,
  useCollapsibleContent,
  useCollapsibleTriggerProps,
  useCollapsibleContext,
} from "../collapsiblePanel";
import { createPartContext } from "../partContext";
import { toggleMember } from "../toggleMember";

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

const [AccordionContext, useAccordionContext] =
  createPartContext<AccordionContextValue>("<Accordion.Root>");

const orientationAttribute = (orientation: AccordionOrientation) => ({
  "data-orientation": orientation,
});

const [ItemValueContext, useItemValue] = createPartContext<string>("<Accordion.Item>");

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
    const next = toggleMember(value, item, { multiple, removable: collapsible });
    if (next === value) return;
    if (emitChange(onValueChange, next, "trigger-press", event)) setValue(next);
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
  const root = useAccordionContext("Accordion.Item");
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
  const root = useAccordionContext("Accordion.ItemTrigger");
  const value = useItemValue("Accordion.ItemTrigger");
  const state = useCollapsibleContext("Accordion.ItemTrigger");
  const register = useCompositeListItem(root.triggers, value);
  const triggerRef = useComposedRefs(register, ref);
  const triggerProps = useCollapsibleTriggerProps(state, props);

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>) => {
    const target = getKeyTarget(event.key, root.orientation, root.rtl);
    if (!target) return;
    event.preventDefault();
    const elements = root.triggers.items().map((item) => item.element);
    const current = elements.indexOf(event.currentTarget);
    elements[getTargetIndex(elementList(elements), current, target, true)]?.focus();
  };

  return (
    <StyledItemTrigger
      {...mergeProps<ItemTriggerProps>(
        {
          ...triggerProps,
          ...orientationAttribute(root.orientation),
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
  const root = useAccordionContext("Accordion.ItemContent");
  const state = useCollapsibleContext("Accordion.ItemContent");
  const content = useCollapsibleContent(state, ref, props.id);

  return (
    <PresenceActivity
      mounted={state.visible}
      keepMounted={keepMounted}
    >
      <StyledItemContent
        {...mergeProps<ComponentProps<typeof StyledItemContent>>(
          {
            ...content,
            role: "region",
            "aria-labelledby": state.triggerId,
            ...orientationAttribute(root.orientation),
          },
          props,
        )}
      />
    </PresenceActivity>
  );
}

function ItemIndicator(props: ComponentProps<typeof StyledItemIndicator>) {
  const root = useAccordionContext("Accordion.ItemIndicator");
  const state = useCollapsibleContext("Accordion.ItemIndicator");
  return (
    <StyledItemIndicator
      {...mergeProps<ComponentProps<typeof StyledItemIndicator>>(
        { ...collapsibleIndicatorProps(state), ...orientationAttribute(root.orientation) },
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
