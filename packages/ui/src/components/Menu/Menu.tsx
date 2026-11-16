import { Menu as ArkMenu, MenuContext, useMenuContext } from "@ark-ui/react/menu";
import { Portal } from "@ark-ui/react/portal";
import { PresenceProvider, usePresence, usePresenceContext } from "@ark-ui/react/presence";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Children,
  type ComponentProps,
  createContext,
  type ElementType,
  isValidElement,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Box, createSlotRecipeContext } from "#styled-system/jsx";
import { menu } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { wrapAsChildContent } from "../asChildContent";
import { isRenderable, useItemSlotIds } from "../itemSlots";
import { lazyOverlayDefaults } from "../overlayDefaults";
import {
  type MobileLayoutProps,
  useOverlayMode,
  useSheetPresentation,
  withMobileLayout,
} from "../overlayPresentation";
import { createPlacementRoot } from "../placementRoot";
import { SheetOverlayContent, SheetPanel } from "../sheetFrame";
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
const StyledContextTrigger = withContext(ArkMenu.ContextTrigger, "contextTrigger");
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
const ItemHint = withContext("span", "itemHint", {
  defaultProps: { "data-scope": "menu", "data-part": "item-hint" },
});
const ItemDescription = withContext("div", "itemDescription", {
  defaultProps: { "data-scope": "menu", "data-part": "item-description" },
});

// zag skips returning focus for menus anchored at a point, so a keyboard-opened context menu would drop it.
function ContextTrigger({
  ref,
  onContextMenu,
  ...props
}: WithRef<ComponentProps<typeof StyledContextTrigger>>) {
  const api = useMenuContext();
  const { open } = api;
  const contentId = api.getContentProps().id;
  const returnFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = returnFocusTo.current;
    if (open || !target) return;
    returnFocusTo.current = null;
    queueMicrotask(() => {
      const active = document.activeElement;
      const content = contentId ? document.getElementById(contentId) : null;
      const lost = active == null || active === document.body || !!content?.contains(active);
      if (target.isConnected && lost) target.focus({ preventScroll: true });
    });
  }, [open, contentId]);

  return (
    <StyledContextTrigger
      ref={ref}
      {...props}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        const active = document.activeElement;
        returnFocusTo.current =
          active instanceof HTMLElement && event.currentTarget.contains(active) ? active : null;
      }}
    />
  );
}

export type { MenuSelectionDetails } from "@ark-ui/react/menu";

// zag hides an unchecked indicator; the recipe keeps it in the layout so the check column stays.
const ItemIndicator = withContext(ArkMenu.ItemIndicator, "itemIndicator", {
  defaultProps: { hidden: false, children: <CheckIcon /> },
});

export interface MenuRootProps extends RootProps, MobileLayoutProps {
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

type ParentMenu = { mode: "popover" } | { mode: "sheet"; closing: boolean };

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
      onSelect={(details) => {
        if (details.value !== BACK_ITEM_VALUE) props.onSelect?.(details);
      }}
    />
  );
}

const MenuRoot = createPlacementRoot<MenuRootProps>(MenuRootBase);

export interface MenuTriggerProps extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

const MenuTrigger = withTriggerTooltip(StyledTrigger, useMenuContext);

export interface MenuContentProps extends ComponentProps<typeof Content>, PortalledProps {
  /** Label of the row that leads back out of a submenu shown inside a phone sheet. */
  backLabel?: string;
}

const isArrow = (child: ReactNode) => isValidElement(child) && child.type === Arrow;

function SheetMenuContent({ children, ...rest }: WithRef<MenuContentProps>) {
  const api = useMenuContext();

  return (
    <SheetOverlayContent
      {...rest}
      api={api}
      Content={Content}
    >
      <ParentMenuContext.Provider value={{ mode: "sheet", closing: !api.open }}>
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
  closing,
  backLabel = "Back",
  children,
  ...rest
}: WithRef<MenuContentProps> & { closing: boolean }) {
  const api = useMenuContext();
  const frameRef = useSheetPresentation()?.frameRef;
  const presence = useHeldThroughSheetExit(closing);

  return (
    <Portal container={frameRef}>
      <PresenceProvider value={presence}>
        <SheetPanel
          Content={Content}
          ref={ref}
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
        </SheetPanel>
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

interface MenuItemSlotProps {
  /** Faint text at the end of the row: a count, a shortcut, or why the item is disabled. */
  hint?: ReactNode;
  /** Muted line under the label, clamped to two lines. */
  description?: ReactNode;
}

function useItemSlots({ hint, description }: MenuItemSlotProps, describedBy: string | undefined) {
  const {
    hintId,
    descriptionId,
    describedBy: itemDescribedBy,
  } = useItemSlotIds({ hint, description }, describedBy);

  return {
    describedBy: itemDescribedBy,
    hint: hintId && (
      <ItemHint
        id={hintId}
        aria-hidden
      >
        {hint}
      </ItemHint>
    ),
    description: descriptionId && (
      <ItemDescription
        id={descriptionId}
        aria-hidden
      >
        {description}
      </ItemDescription>
    ),
  };
}

type MenuOptionItemProps<T extends typeof CheckboxItem | typeof RadioItem> = WithRef<
  Omit<ComponentProps<T>, "asChild"> & MenuItemSlotProps
>;

interface OptionItemSlots extends MenuItemSlotProps {
  children?: ReactNode;
  "aria-describedby"?: string | undefined;
}

function createOptionItem<P extends OptionItemSlots>(Part: ElementType) {
  return function MenuOptionItem({
    hint,
    description,
    children,
    "aria-describedby": describedBy,
    ...rest
  }: P) {
    const slots = useItemSlots({ hint, description }, describedBy);

    return (
      <Part
        {...rest}
        aria-describedby={slots.describedBy}
      >
        <ItemText>
          {children}
          {slots.description}
        </ItemText>
        {slots.hint}
        <ItemIndicator />
      </Part>
    );
  };
}

const MenuCheckboxItem = createOptionItem<MenuOptionItemProps<typeof CheckboxItem>>(CheckboxItem);
const MenuRadioItem = createOptionItem<MenuOptionItemProps<typeof RadioItem>>(RadioItem);

function ItemLabel({
  icon,
  description,
  hint,
  children,
}: {
  icon: ReactNode;
  description: ReactNode;
  hint: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {icon}
      <Box flex="1">
        {children}
        {description}
      </Box>
      {hint}
    </>
  );
}

export interface MenuItemProps extends ComponentProps<typeof Item>, MenuItemSlotProps {
  icon?: ReactNode;
  /** Colors the item with the danger palette, for actions that delete or can't be undone. */
  destructive?: boolean;
}

function MenuItem({
  ref,
  icon,
  destructive,
  hint,
  description,
  children,
  ...rest
}: WithRef<MenuItemProps>) {
  const slots = useItemSlots({ hint, description }, rest["aria-describedby"]);
  const content = (label: ReactNode) => (
    <ItemLabel
      icon={icon}
      description={slots.description}
      hint={slots.hint}
    >
      {label}
    </ItemLabel>
  );

  return (
    <Item
      {...rest}
      ref={ref}
      aria-describedby={slots.describedBy}
      data-destructive={destructive ? "" : undefined}
    >
      {rest.asChild ? wrapAsChildContent(children, content) : content(children)}
    </Item>
  );
}

export interface MenuItemGroupProps extends ComponentProps<typeof ItemGroup> {
  /** Heading shown above the group's items. */
  label?: ReactNode;
}

function MenuItemGroup({ ref, label, children, ...rest }: WithRef<MenuItemGroupProps>) {
  return (
    <ItemGroup
      ref={ref}
      {...rest}
    >
      {isRenderable(label) && <ItemGroupLabel userSelect="none">{label}</ItemGroupLabel>}
      {children}
    </ItemGroup>
  );
}

export interface MenuTriggerItemProps
  extends Omit<ComponentProps<typeof TriggerItem>, "asChild">, MenuItemSlotProps {
  icon?: ReactNode;
}

function MenuTriggerItem({
  ref,
  icon,
  hint,
  description,
  children,
  onPointerMoveCapture,
  ...rest
}: WithRef<MenuTriggerItemProps>) {
  const inSheet = useContext(ParentMenuContext)?.mode === "sheet";
  const slots = useItemSlots({ hint, description }, rest["aria-describedby"]);

  return (
    <TriggerItem
      ref={ref}
      {...rest}
      aria-describedby={slots.describedBy}
      onPointerMoveCapture={(event) => {
        onPointerMoveCapture?.(event);
        // In a sheet the submenu replaces the list under the pointer, so a hover must not open it.
        if (inSheet && event.pointerType === "mouse" && event.buttons === 0) {
          event.stopPropagation();
        }
      }}
    >
      <ItemLabel
        icon={icon}
        description={slots.description}
        hint={slots.hint}
      >
        {children}
      </ItemLabel>
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
