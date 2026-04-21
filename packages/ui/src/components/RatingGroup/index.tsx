import {
  RatingGroup as ArkRatingGroup,
  useRatingGroupContext,
  useRatingGroupItemContext,
} from "@ark-ui/react/rating-group";
import { StarIcon } from "lucide-react";
import { type ComponentProps, type ReactElement, cloneElement, isValidElement } from "react";
import { type HTMLStyledProps, createStyleContext } from "styled-system/jsx";
import { ratingGroup } from "styled-system/recipes";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(ratingGroup);

const Root = withProvider(ArkRatingGroup.Root, "root");
const RootProvider = withProvider(ArkRatingGroup.RootProvider, "root");
const Item = withContext(ArkRatingGroup.Item, "item");
const Label = withContext(ArkRatingGroup.Label, "label");
const HiddenInput = ArkRatingGroup.HiddenInput;

export {
  RatingGroupContext as Context,
  RatingGroupItemContext as ItemContext,
} from "@ark-ui/react/rating-group";

interface ItemIndicatorProps extends HTMLStyledProps<"span"> {
  icon?: ReactElement | undefined;
}

const StyledItemIndicator = withContext("span", "itemIndicator");

const cloneIcon = (icon: ReactElement, type: string) => {
  if (!isValidElement(icon)) return null;
  const props = { [`data-${type}`]: "", "aria-hidden": true, fill: "currentColor" };
  return cloneElement(icon, props);
};

function ItemIndicator({
  ref,
  icon = <StarIcon />,
  ...rest
}: WithRef<ItemIndicatorProps, HTMLSpanElement>) {
  const item = useRatingGroupItemContext();

  return (
    <StyledItemIndicator
      ref={ref}
      cursor="pointer"
      {...rest}
      data-highlighted={item.highlighted ? "" : undefined}
      data-checked={item.checked ? "" : undefined}
      data-half={item.half ? "" : undefined}
    >
      {cloneIcon(icon, "bg")}
      {cloneIcon(icon, "fg")}
    </StyledItemIndicator>
  );
}

interface ItemsProps extends Omit<ComponentProps<typeof Item>, "index"> {
  icon?: ReactElement | undefined;
}

function Items(props: ItemsProps) {
  const { icon, ...rest } = props;
  const ratingGroupCtx = useRatingGroupContext();

  return ratingGroupCtx.items.map((item) => (
    <Item
      key={item}
      index={item}
      {...rest}
    >
      <ItemIndicator icon={icon} />
    </Item>
  ));
}

const Control = withContext(ArkRatingGroup.Control, "control", {
  defaultProps: { children: <Items /> },
});

export type RatingGroupRootProps = ComponentProps<typeof Root>;

export const RatingGroup = {
  Root,
  RootProvider,
  Control,
  Item,
  ItemIndicator,
  Items,
  Label,
  HiddenInput,
};
