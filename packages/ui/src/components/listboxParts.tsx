import { CheckIcon } from "lucide-react";
import { type ComponentProps, type JSX, createContext, useContext, useId, useMemo } from "react";

import type { SlotRecipeConsumerComponent } from "#styled-system/jsx";

import { useComposedRefs } from "../hooks/useComposedRefs";
import {
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../hooks/useRenderedParts";
import { type ListboxNode, type ListboxOptionState, useListboxOption } from "../primitives/listbox";
import { checkedStateAttributes, type renderable } from "../primitives/render";

type StyledDiv = SlotRecipeConsumerComponent<typeof renderable.div, never>;

/** A recipe's styled `item`, `itemText`, `itemIndicator`, `itemGroup` and `itemGroupLabel` slots. */
export interface ListboxPartSlots {
  Item: StyledDiv;
  ItemText: SlotRecipeConsumerComponent<typeof renderable.span, never>;
  ItemIndicator: StyledDiv;
  ItemGroup: StyledDiv;
  ItemGroupLabel: StyledDiv;
}

export type ListboxPartProps<K extends keyof ListboxPartSlots> = ComponentProps<
  ListboxPartSlots[K]
>;

export type ListboxItemPartProps = ListboxPartProps<"Item"> &
  ListboxOptionState & { node: ListboxNode };

export interface ListboxParts {
  Item: (props: ListboxItemPartProps) => JSX.Element;
  ItemText: (props: ListboxPartProps<"ItemText">) => JSX.Element;
  ItemIndicator: (props: ListboxPartProps<"ItemIndicator">) => JSX.Element;
  ItemGroup: (props: ListboxPartProps<"ItemGroup">) => JSX.Element;
  ItemGroupLabel: (props: ListboxPartProps<"ItemGroupLabel">) => JSX.Element;
}

/** Set while the options hold interactive actions: options become rows, their text and actions cells. */
export const ListboxGridContext = createContext(false);

/** The option and group parts of a list of options, on a recipe's styled `slots`; `groupIdPrefix` starts the id of a group given none. */
export function createListboxParts(slots: ListboxPartSlots, groupIdPrefix: string): ListboxParts {
  const { Item: StyledItem, ItemText: StyledItemText, ItemIndicator: StyledItemIndicator } = slots;
  const { ItemGroup: StyledItemGroup, ItemGroupLabel: StyledItemGroupLabel } = slots;

  const ItemSelectedContext = createContext(false);
  const GroupLabelContext = createContext<{
    id: string;
    reportRendered: ReportRendered<"label">;
  } | null>(null);

  /** An option of `node`, carrying the id and state attributes the list reads. */
  function Item({ ref, node, value, selected, disabled, ...props }: ListboxItemPartProps) {
    const grid = useContext(ListboxGridContext);
    const option = useListboxOption(node, { value, selected, disabled });
    const composedRef = useComposedRefs(ref, option.ref);
    return (
      <ItemSelectedContext value={selected}>
        <StyledItem
          {...option.props}
          role={grid ? "row" : "option"}
          {...props}
          ref={composedRef}
        />
      </ItemSelectedContext>
    );
  }

  function ItemText(props: ComponentProps<typeof StyledItemText>) {
    return (
      <StyledItemText
        role={useContext(ListboxGridContext) ? "gridcell" : undefined}
        {...props}
      />
    );
  }

  function ItemIndicator({ children, ...props }: ComponentProps<typeof StyledItemIndicator>) {
    const selected = useContext(ItemSelectedContext);
    return (
      <StyledItemIndicator
        aria-hidden
        {...checkedStateAttributes(selected)}
        {...props}
      >
        {children ?? <CheckIcon />}
      </StyledItemIndicator>
    );
  }

  function ItemGroup({ id, ...props }: ComponentProps<typeof StyledItemGroup>) {
    const generated = useId();
    const groupId = id ?? `${groupIdPrefix}:${generated}`;
    const [rendered, reportRendered] = useRenderedParts<"label">();
    const label = useMemo(
      () => ({ id: `${groupId}:label`, reportRendered }),
      [groupId, reportRendered],
    );
    return (
      <GroupLabelContext value={label}>
        <StyledItemGroup
          id={groupId}
          role={useContext(ListboxGridContext) ? "rowgroup" : "group"}
          aria-labelledby={rendered.label}
          {...props}
        />
      </GroupLabelContext>
    );
  }

  function ItemGroupLabel({ id, children, ...props }: ComponentProps<typeof StyledItemGroupLabel>) {
    const grid = useContext(ListboxGridContext);
    const group = useContext(GroupLabelContext);
    const labelId = useReportRendered(group?.reportRendered, "label", id ?? group?.id);
    return (
      <StyledItemGroupLabel
        id={labelId}
        role={grid ? "row" : "presentation"}
        {...props}
      >
        {grid ? <span role="rowheader">{children}</span> : children}
      </StyledItemGroupLabel>
    );
  }

  return { Item, ItemText, ItemIndicator, ItemGroup, ItemGroupLabel };
}
