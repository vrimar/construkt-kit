import {
  Menu as ArkMenu,
  MenuContext,
  useMenuContext,
  useMenuItemContext,
} from "@ark-ui/react/menu";
import { Portal } from "@ark-ui/react/portal";
import { PresenceProvider, usePresence, usePresenceContext } from "@ark-ui/react/presence";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Children,
  type ComponentProps,
  createContext,
  isValidElement,
  type ReactNode,
  type RefObject,
  useContext,
  useState,
} from "react";

import { Box, createSlotRecipeContext } from "#styled-system/jsx";
import { menu } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { wrapAsChildContent } from "../asChildContent";
import { createItemIndicator } from "../itemIndicator";
import { lazyOverlayDefaults } from "../overlayDefaults";
import {
  type MobileLayoutProps,
  guardSheetFrame,
  useOverlayMode,
  useSheetFrameRef,
  withMobileLayout,
} from "../overlayPresentation";
import { createPlacementRoot } from "../placementRoot";
import { SheetOverlayContent } from "../sheetFrame";
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

export interface MenuRootProps extends RootProps, MobileLayoutProps {
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

type ParentMenu =
  | { mode: "popover" }
  | { mode: "sheet"; frameRef: RefObject<HTMLDivElement | null>; closing: boolean };

const ParentMenuContext = createContext<ParentMenu | null>(null);

const ANCHORED_PARENT: ParentMenu = { mode: "popover" };

const BACK_ITEM_VALUE = "construkt-menu-back";

const SheetCapableRoot = withMobileLayout<MenuRootProps>(Root);

function MenuRootBase({ mobileLayout, ...props }: MenuRootProps) {
  const parent = useContext(ParentMenuContext);

  if (parent?.mode !== "sheet") {
    return (
      <SheetCapableRoot
        mobileLayout={parent == null ? mobileLayout : "popover"}
        {...props}
      />
    );
  }

  return (
    <Root
      {...props}
      onInteractOutside={guardSheetFrame(parent.frameRef, props.onInteractOutside)}
      onSelect={(details) => {
        if (details.value !== BACK_ITEM_VALUE) props.onSelect?.(details);
      }}
    />
  );
}

const MenuRoot = createPlacementRoot<MenuRootProps>(MenuRootBase);

export interface MenuTriggerProps extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

const useMenuTriggerId = (value: string) => useMenuContext().getTriggerProps({ value }).id ?? "";

const MenuTrigger = withTriggerTooltip(StyledTrigger, useMenuTriggerId);

export interface MenuContentProps extends ComponentProps<typeof Content>, PortalledProps {
  /** Label of the row that leads back out of a submenu shown inside a phone sheet. */
  backLabel?: string;
}

const isArrow = (child: ReactNode) => isValidElement(child) && child.type === Arrow;

function SheetMenuContent({ children, ...rest }: WithRef<MenuContentProps>) {
  const api = useMenuContext();
  const frameRef = useSheetFrameRef();

  return (
    <SheetOverlayContent
      {...rest}
      api={api}
      Content={Content}
    >
      <ParentMenuContext.Provider
        value={frameRef == null ? null : { mode: "sheet", frameRef, closing: !api.open }}
      >
        {children}
      </ParentMenuContext.Provider>
    </SheetOverlayContent>
  );
}

// zag closes a submenu a render before its root, so the hold keys on presence, not `open`.
function useHeldThroughSheetExit(closing: boolean) {
  const { present } = usePresenceContext();
  const [prev, setPrev] = useState({ present, closing });
  const [held, setHeld] = useState(false);

  if (prev.present !== present || prev.closing !== closing) {
    setPrev({ present, closing });
    if (prev.closing !== closing) setHeld(closing && prev.present);
  }

  return usePresence({ present: present || held, lazyMount: true, unmountOnExit: true });
}

function DrillDownMenuContent({
  ref,
  frameRef,
  closing,
  backLabel = "Back",
  children,
  ...rest
}: WithRef<MenuContentProps> & { frameRef: RefObject<HTMLDivElement | null>; closing: boolean }) {
  const api = useMenuContext();
  const presence = useHeldThroughSheetExit(closing);

  return (
    <Portal container={frameRef}>
      <PresenceProvider value={presence}>
        <Content
          animation="none"
          ref={ref}
          data-overlay-sheet-content=""
          {...rest}
        >
          <Item
            value={BACK_ITEM_VALUE}
            closeOnSelect={false}
            onSelect={() => api.setOpen(false)}
          >
            <ChevronLeftIcon />
            {backLabel}
          </Item>
          {children}
        </Content>
      </PresenceProvider>
    </Portal>
  );
}

function MenuContent({
  ref,
  portalled = true,
  portalRef,
  backLabel,
  children,
  ...rest
}: WithRef<MenuContentProps>) {
  const mode = useOverlayMode();
  const parent = useContext(ParentMenuContext);
  const nodes = Children.toArray(children);
  const items = nodes.filter((node) => !isArrow(node));

  if (parent?.mode === "sheet") {
    return (
      <DrillDownMenuContent
        ref={ref}
        frameRef={parent.frameRef}
        closing={parent.closing}
        backLabel={backLabel}
        {...rest}
      >
        {items}
      </DrillDownMenuContent>
    );
  }

  if (mode === "sheet") {
    return (
      <SheetMenuContent
        ref={ref}
        portalRef={portalRef}
        {...rest}
      >
        {items}
      </SheetMenuContent>
    );
  }

  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <Positioner>
        {nodes.filter(isArrow)}
        <Content
          animation="none"
          ref={ref}
          {...rest}
        >
          <ParentMenuContext.Provider value={ANCHORED_PARENT}>{items}</ParentMenuContext.Provider>
        </Content>
      </Positioner>
    </Portal>
  );
}

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

function MenuTriggerItem({
  ref,
  icon,
  children,
  onPointerMoveCapture,
  ...rest
}: WithRef<MenuTriggerItemProps>) {
  const inSheet = useContext(ParentMenuContext)?.mode === "sheet";

  return (
    <TriggerItem
      ref={ref}
      {...rest}
      onPointerMoveCapture={(event) => {
        onPointerMoveCapture?.(event);
        // In a sheet the submenu replaces the list under the pointer, so a hover must not open it.
        if (inSheet && event.pointerType === "mouse" && event.buttons === 0) {
          event.stopPropagation();
        }
      }}
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
