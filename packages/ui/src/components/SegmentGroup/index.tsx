import { type ComponentProps, type ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { segmentGroup } from "#styled-system/recipes";

import { mergeProps, renderable } from "../../primitives/render";
import {
  type RadioGroupRootOptions,
  type RadioItemOptions,
  type RadioValueChangeDetails,
  RadioGroupProvider,
  RadioItemHiddenInput,
  RadioItemProvider,
  createRadioGroupParts,
  useRadioGroupRoot,
  useRadioItem,
} from "../radioGroup";

export type { RadioValueChangeDetails as SegmentGroupValueChangeDetails };

const { withProvider, withContext } = createSlotRecipeContext(segmentGroup);

const StyledRoot = withProvider(renderable.div, "root");
const StyledItem = withContext(renderable.label, "item");

const { Label, Indicator, ItemControl, ItemText } = createRadioGroupParts(
  {
    Label: withContext(renderable.span, "label"),
    Indicator: withContext(renderable.div, "indicator"),
    ItemControl: withContext(renderable.div, "itemControl"),
    ItemText: withContext(renderable.span, "itemText"),
  },
  "SegmentGroup",
);

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface SegmentGroupRootProps
  extends Omit<StyledRootProps, keyof RadioGroupRootOptions>, RadioGroupRootOptions {}

function Root(props: SegmentGroupRootProps) {
  const { context, rootProps } = useRadioGroupRoot(props, { orientation: "horizontal" });

  return (
    <RadioGroupProvider value={context}>
      <StyledRoot {...rootProps} />
    </RadioGroupProvider>
  );
}

type StyledItemProps = ComponentProps<typeof StyledItem>;

export interface SegmentGroupItemProps
  extends Omit<StyledItemProps, keyof RadioItemOptions>, RadioItemOptions {}

/** One option, a `<label>` around its text and its `SegmentGroup.ItemHiddenInput` radio. */
function Item({ value, disabled, invalid, ...props }: SegmentGroupItemProps) {
  const { item, itemProps } = useRadioItem({ value, disabled, invalid, id: props.id });

  return (
    <RadioItemProvider value={item}>
      <StyledItem {...mergeProps<StyledItemProps>(itemProps, props)} />
    </RadioItemProvider>
  );
}

interface SegmentItem {
  value: string;
  label: ReactNode;
  disabled?: boolean | undefined;
}

export interface SegmentGroupItemsProps extends Omit<SegmentGroupItemProps, "value"> {
  items: Array<SegmentItem>;
}

function Items({ items, disabled, ...rest }: SegmentGroupItemsProps) {
  return items.map((item) => (
    <Item
      key={item.value}
      value={item.value}
      disabled={item.disabled || disabled}
      {...rest}
    >
      <ItemText>{item.label}</ItemText>
      <RadioItemHiddenInput />
    </Item>
  ));
}

/**
 * Picks exactly one of a few values: arrow keys select, and its radios submit with a form. For buttons that each
 * turn something on or off, use `ToggleGroup`.
 */
export const SegmentGroup = {
  Root,
  Indicator,
  Item,
  ItemControl,
  /** The item's native radio, which takes focus and submits the group's value with a form. */
  ItemHiddenInput: RadioItemHiddenInput,
  Items,
  ItemText,
  Label,
};
