import { SegmentGroup as ArkSegmentGroup, SegmentGroupContext } from "@ark-ui/react/segment-group";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { segmentGroup } from "@construkt-kit/styled-system/recipes";
import { type ComponentProps, type ReactNode } from "react";

const { withProvider, withContext } = createStyleContext(segmentGroup);

const Root = withProvider(ArkSegmentGroup.Root, "root", {
  defaultProps: { orientation: "horizontal" },
  forwardProps: ["orientation"],
});
const RootProvider = withProvider(ArkSegmentGroup.RootProvider, "root");
const Indicator = withContext(ArkSegmentGroup.Indicator, "indicator");
const Item = withContext(ArkSegmentGroup.Item, "item");
const ItemControl = withContext(ArkSegmentGroup.ItemControl, "itemControl");
const ItemHiddenInput = ArkSegmentGroup.ItemHiddenInput;
const ItemText = withContext(ArkSegmentGroup.ItemText, "itemText");
const Label = withContext(ArkSegmentGroup.Label, "label");

interface SegmentItem {
  value: string;
  label: ReactNode;
  disabled?: boolean | undefined;
}

export interface SegmentGroupItemsProps extends Omit<ComponentProps<typeof Item>, "value"> {
  items: Array<SegmentItem>;
}

function Items(props: SegmentGroupItemsProps) {
  const { items, ...rest } = props;
  return items.map((item) => (
    <Item
      key={item.value}
      value={item.value}
      disabled={item.disabled}
      {...rest}
    >
      <ItemControl />
      <ItemText>{item.label}</ItemText>
      <ItemHiddenInput />
    </Item>
  ));
}

export type SegmentGroupRootProps = ComponentProps<typeof Root>;

export const SegmentGroup = {
  Root,
  RootProvider,
  Indicator,
  Item,
  ItemControl,
  ItemHiddenInput,
  Items,
  ItemText,
  Label,
  Context: SegmentGroupContext,
};
