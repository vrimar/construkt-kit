import { AbsoluteCenter, Box, Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import React from "react";
import { LuCheck, LuChevronRight } from "react-icons/lu";

export interface MenuRootProps extends ChakraMenu.RootProps {
  placement?: NonNullable<ChakraMenu.RootProps["positioning"]>["placement"];
}

function MenuRoot({ placement, ...props }: MenuRootProps) {
  return (
    <ChakraMenu.Root
      lazyMount
      unmountOnExit
      positioning={{ placement }}
      {...props}
    />
  );
}

export interface MenuContentProps extends ChakraMenu.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

function MenuContent({ ref, portalled = true, portalRef, ...rest }: MenuContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <ChakraMenu.Positioner>
        <ChakraMenu.Content
          animation="none"
          ref={ref}
          {...rest}
        />
      </ChakraMenu.Positioner>
    </Portal>
  );
}

function MenuArrow({ ref, ...props }: ChakraMenu.ArrowProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraMenu.Arrow
      ref={ref}
      {...props}
    >
      <ChakraMenu.ArrowTip />
    </ChakraMenu.Arrow>
  );
}

function MenuCheckboxItem({ ref, children, ...props }: ChakraMenu.CheckboxItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraMenu.CheckboxItem
      ref={ref}
      {...props}
    >
      <ChakraMenu.ItemIndicator hidden={false}>
        <LuCheck />
      </ChakraMenu.ItemIndicator>
      {children}
    </ChakraMenu.CheckboxItem>
  );
}

function MenuRadioItem({ ref, children, ...rest }: ChakraMenu.RadioItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraMenu.RadioItem
      cursor="pointer"
      ps="8"
      ref={ref}
      {...rest}
    >
      <AbsoluteCenter
        axis="horizontal"
        left="4"
        asChild
      >
        <ChakraMenu.ItemIndicator>
          <LuCheck />
        </ChakraMenu.ItemIndicator>
      </AbsoluteCenter>
      <ChakraMenu.ItemText>{children}</ChakraMenu.ItemText>
    </ChakraMenu.RadioItem>
  );
}

export interface MenuItemProps extends ChakraMenu.ItemProps {
  icon?: React.ReactNode;
}

function MenuItem({ ref, icon, children, ...rest }: MenuItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraMenu.Item
      cursor="pointer"
      {...rest}
      ref={ref}
    >
      {icon}
      <Box flex="1">{children}</Box>
    </ChakraMenu.Item>
  );
}

function MenuItemGroup({ ref, title, children, ...rest }: ChakraMenu.ItemGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraMenu.ItemGroup
      ref={ref}
      {...rest}
    >
      {title && <ChakraMenu.ItemGroupLabel userSelect="none">{title}</ChakraMenu.ItemGroupLabel>}
      {children}
    </ChakraMenu.ItemGroup>
  );
}

export interface MenuTriggerItemProps extends ChakraMenu.ItemProps {
  startIcon?: React.ReactNode;
}

function MenuTriggerItem({ ref, startIcon, children, ...rest }: MenuTriggerItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraMenu.TriggerItem
      ref={ref}
      {...rest}
    >
      {startIcon}
      {children}
      <LuChevronRight />
    </ChakraMenu.TriggerItem>
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
  RadioItemGroup: ChakraMenu.RadioItemGroup,
  ContextTrigger: ChakraMenu.ContextTrigger,
  Separator: ChakraMenu.Separator,
  ItemText: ChakraMenu.ItemText,
  ItemCommand: ChakraMenu.ItemCommand,
  Trigger: ChakraMenu.Trigger,
};
