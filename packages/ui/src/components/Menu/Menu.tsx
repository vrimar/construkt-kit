import {
  Menu as ArkMenu,
  MenuContext,
  useMenuContext,
  useMenuItemContext,
} from "@ark-ui/react/menu";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Box, createSlotRecipeContext } from "#styled-system/jsx";
import { menu } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { wrapAsChildContent } from "../asChildContent";
import { createItemIndicator } from "../itemIndicator";
import { lazyOverlayDefaults } from "../overlayDefaults";
import { createPlacementRoot } from "../placementRoot";
import { createPortalledContent } from "../portalledContent";
import { type WithTooltipProps, withTriggerTooltip } from "../Tooltip/TriggerTooltip";

const { withRootProvider, withContext } = createSlotRecipeContext(menu);

type RootProps = ComponentProps<typeof Root>;
const Root = withRootProvider(ArkMenu.Root, {
  defaultProps: {
    ...lazyOverlayDefaults,
    // zag's default dispatches a non-bubbling click, which React's root listener never sees.
    navigate: ({ node }: { node: HTMLAnchorElement }) => queueMicrotask(() => node.click()),
  },
});
const ArrowTip = withContext(ArkMenu.ArrowTip, "arrowTip");
const Arrow = withContext(ArkMenu.Arrow, "arrow", {
  defaultProps: { children: <ArrowTip /> },
});
const CheckboxItem = withContext(ArkMenu.CheckboxItem, "item");
const Content = withContext(ArkMenu.Content, "content");
const ContextTrigger = withContext(ArkMenu.ContextTrigger, "contextTrigger");
const Item = withContext(ArkMenu.Item, "item");
const ItemGroup = withContext(ArkMenu.ItemGroup, "itemGroup");
const ItemGroupLabel = withContext(ArkMenu.ItemGroupLabel, "itemGroupLabel");
const ItemText = withContext(ArkMenu.ItemText, "itemText");
const Positioner = withContext(ArkMenu.Positioner, "positioner");
const RadioItem = withContext(ArkMenu.RadioItem, "item");
const RadioItemGroup = withContext(ArkMenu.RadioItemGroup, "itemGroup");
const Separator = withContext(ArkMenu.Separator, "separator");
const StyledTrigger = withContext(ArkMenu.Trigger, "trigger");
const TriggerItem = withContext(ArkMenu.TriggerItem, "item");

export type { MenuSelectionDetails } from "@ark-ui/react/menu";

const StyledItemIndicator = withContext(ArkMenu.ItemIndicator, "itemIndicator");

const ItemIndicator = createItemIndicator(
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

export interface MenuContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const MenuContent = createPortalledContent(Positioner, Content);

function MenuCheckboxItem({
  ref,
  children,
  ...props
}: WithRef<Omit<ComponentProps<typeof CheckboxItem>, "asChild">>) {
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

function MenuRadioItem({
  ref,
  children,
  ...rest
}: WithRef<Omit<ComponentProps<typeof RadioItem>, "asChild">>) {
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

function ItemLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <>
      {icon}
      <Box flex="1">{children}</Box>
    </>
  );
}

export interface MenuItemProps extends ComponentProps<typeof Item> {
  icon?: ReactNode;
  /** Colors the item with the danger palette, for actions that delete or can't be undone. */
  destructive?: boolean;
}

function MenuItem({ ref, icon, destructive, children, ...rest }: WithRef<MenuItemProps>) {
  const content = (label: ReactNode) => <ItemLabel icon={icon}>{label}</ItemLabel>;

  return (
    <Item
      {...rest}
      ref={ref}
      data-destructive={destructive ? "" : undefined}
    >
      {rest.asChild ? wrapAsChildContent(children, content) : content(children)}
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

export interface MenuTriggerItemProps extends Omit<ComponentProps<typeof TriggerItem>, "asChild"> {
  icon?: ReactNode;
}

function MenuTriggerItem({ ref, icon, children, ...rest }: WithRef<MenuTriggerItemProps>) {
  return (
    <TriggerItem
      ref={ref}
      {...rest}
    >
      <ItemLabel icon={icon}>{children}</ItemLabel>
      <ChevronRightIcon />
    </TriggerItem>
  );
}

export const Menu = {
  Root: MenuRoot,
  Content: MenuContent,
  Arrow,
  CheckboxItem: MenuCheckboxItem,
  RadioItem: MenuRadioItem,
  Item: MenuItem,
  ItemGroup: MenuItemGroup,
  TriggerItem: MenuTriggerItem,
  RadioItemGroup,
  ContextTrigger,
  Separator,
  ItemText,
  Trigger: MenuTrigger,
  Context: MenuContext,
};
