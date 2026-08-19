import { Menu as ArkMenu, useMenuContext, useMenuItemContext } from "@ark-ui/react/menu";
import { Box, createStyleContext } from "@construkt-kit/styled-system/jsx";
import { menu } from "@construkt-kit/styled-system/recipes";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import type { PortalledProps, WithRef } from "../../types";
import { createItemIndicator } from "../itemIndicator";
import { createPlacementRoot } from "../placementRoot";
import { createPortalledContent } from "../portalledContent";
import { type WithTooltipProps, withTriggerTooltip } from "../Tooltip/TriggerTooltip";

const { withRootProvider, withContext } = createStyleContext(menu);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider(ArkMenu.Root, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
export const Arrow = withContext(ArkMenu.Arrow, "arrow");
export const ArrowTip = withContext(ArkMenu.ArrowTip, "arrowTip");
export const CheckboxItem = withContext(ArkMenu.CheckboxItem, "item");
export const Content = withContext(ArkMenu.Content, "content");
export const ContextTrigger = withContext(ArkMenu.ContextTrigger, "contextTrigger");
export const Indicator = withContext(ArkMenu.Indicator, "indicator", {
  defaultProps: { children: <ChevronDownIcon /> },
});
export const Item = withContext(ArkMenu.Item, "item");
export const ItemGroup = withContext(ArkMenu.ItemGroup, "itemGroup");
export const ItemGroupLabel = withContext(ArkMenu.ItemGroupLabel, "itemGroupLabel");
export const ItemText = withContext(ArkMenu.ItemText, "itemText");
export const Positioner = withContext(ArkMenu.Positioner, "positioner");
export const RadioItem = withContext(ArkMenu.RadioItem, "item");
export const RadioItemGroup = withContext(ArkMenu.RadioItemGroup, "itemGroup");
export const Separator = withContext(ArkMenu.Separator, "separator");
const StyledTrigger = withContext(ArkMenu.Trigger, "trigger");
export const TriggerItem = withContext(ArkMenu.TriggerItem, "item");

export {
  MenuContext as Context,
  type MenuSelectionDetails as SelectionDetails,
} from "@ark-ui/react/menu";

const StyledItemIndicator = withContext(ArkMenu.ItemIndicator, "itemIndicator");

export const ItemIndicator = createItemIndicator(
  StyledItemIndicator,
  () => useMenuItemContext().checked === true,
);

export interface MenuRootProps extends RootProps {
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

const MenuRoot = createPlacementRoot<MenuRootProps>(Root);

export interface MenuTriggerProps extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

const useMenuTriggerId = (value: string) => useMenuContext().getTriggerProps({ value }).id ?? "";

const MenuTrigger = withTriggerTooltip(StyledTrigger, useMenuTriggerId);

export const Trigger = MenuTrigger;

export interface MenuContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const MenuContent = createPortalledContent(Positioner, Content);

function MenuArrow({ ref, ...props }: WithRef<ComponentProps<typeof Arrow>>) {
  return (
    <Arrow
      ref={ref}
      {...props}
    />
  );
}

function MenuCheckboxItem({
  ref,
  children,
  ...props
}: WithRef<ComponentProps<typeof CheckboxItem>>) {
  return (
    <CheckboxItem
      ref={ref}
      {...props}
    >
      <ItemText>{children}</ItemText>
      <ItemIndicator />
    </CheckboxItem>
  );
}

function MenuRadioItem({ ref, children, ...rest }: WithRef<ComponentProps<typeof RadioItem>>) {
  return (
    <RadioItem
      ref={ref}
      {...rest}
    >
      <ItemText>{children}</ItemText>
      <ItemIndicator />
    </RadioItem>
  );
}

export interface MenuItemProps extends ComponentProps<typeof Item> {
  icon?: ReactNode;
}

function MenuItem({ ref, icon, children, ...rest }: WithRef<MenuItemProps>) {
  return (
    <Item
      {...rest}
      ref={ref}
    >
      {icon}
      <Box flex="1">{children}</Box>
    </Item>
  );
}

function MenuItemGroup({
  ref,
  title,
  children,
  ...rest
}: WithRef<ComponentProps<typeof ItemGroup>>) {
  return (
    <ItemGroup
      ref={ref}
      {...rest}
    >
      {title && <ItemGroupLabel userSelect="none">{title}</ItemGroupLabel>}
      {children}
    </ItemGroup>
  );
}

export interface MenuTriggerItemProps extends ComponentProps<typeof Item> {
  startIcon?: ReactNode;
}

function MenuTriggerItem({ ref, startIcon, children, ...rest }: WithRef<MenuTriggerItemProps>) {
  return (
    <TriggerItem
      ref={ref}
      {...rest}
    >
      {startIcon}
      <Box flex="1">{children}</Box>
      <ChevronRightIcon />
    </TriggerItem>
  );
}

export const Menu = {
  Root: MenuRoot,
  Content: MenuContent,
  Arrow: MenuArrow,
  CheckboxItem: MenuCheckboxItem,
  RadioItem: MenuRadioItem,
  Item: MenuItem,
  ItemGroup: MenuItemGroup,
  TriggerItem: MenuTriggerItem,
  RadioItemGroup,
  ContextTrigger,
  Separator,
  ItemText,
  Trigger,
};
