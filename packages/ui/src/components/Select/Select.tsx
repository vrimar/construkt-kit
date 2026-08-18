import { css as cssFn } from "@construkt-kit/styled-system/css";
import { Box, HStack, type HTMLStyledProps } from "@construkt-kit/styled-system/jsx";
import {
  type ChangeEvent,
  type ComponentProps,
  createContext,
  type JSX,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import type { SelectButtonProps } from "../Buttons";
import { SelectButton } from "../Buttons";
import { SearchInput } from "../Input";
import { Listbox, ManagedList } from "../Listbox/Listbox";
import type {
  SelectionIndicatorPosition,
  SelectionItemState,
  SelectionItemsProps,
  SelectionProps,
  SelectionSearchOptions,
  SelectionValue,
  SelectionValueRenderContext,
  SingleSelectionProps,
  MultipleSelectionProps,
} from "../Listbox/types";
import {
  type SelectionController,
  useSelectionController,
} from "../Listbox/useSelectionController";
import { Popover, type PopoverTriggerProps } from "../Popover";

export type SelectValue = SelectionValue;

type PopoverContentProps = ComponentProps<typeof Popover.Content>;
type PopoverRootProps = ComponentProps<typeof Popover.Root>;
type ManagedItemProps = Partial<Omit<ComponentProps<typeof Listbox.Item>, "children" | "item">>;

interface SelectContextValue {
  controller: SelectionController<unknown, SelectionValue>;
  contentWidth?: number;
  matchTriggerWidth: boolean;
  indicatorPosition: SelectionIndicatorPosition;
  placeholder: ReactNode;
  triggerValue: ReactNode;
  hasValue: boolean;
  loading?: boolean;
  emptyMessage?: ReactNode;
  virtual?: boolean;
  scrollToIndexRef: { current: ((index: number) => void) | undefined };
  renderItem?: (item: unknown, state: SelectionItemState<SelectionValue>) => ReactNode;
  renderItemActions?: (item: unknown, state: SelectionItemState<SelectionValue>) => ReactNode;
  getItemProps?: (item: unknown) => ManagedItemProps;
}

const SelectContext = createContext<SelectContextValue | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (context == null) {
    throw new Error("Select compound components must be used within Select.Root");
  }
  return context;
};

interface SelectRenderProps<T, V extends SelectionValue> {
  renderItem?: (item: T, state: SelectionItemState<V>) => ReactNode;
  renderItemActions?: (item: T, state: SelectionItemState<V>) => ReactNode;
  getItemProps?: (item: T) => ManagedItemProps;
}

interface SelectRootBaseProps<T, V extends SelectionValue>
  extends SelectionItemsProps<T, V>, SelectRenderProps<T, V> {
  children: ReactNode;
  placeholder?: ReactNode;
  renderValue?: (context: SelectionValueRenderContext<T, V>) => ReactNode;
  indicatorPosition?: SelectionIndicatorPosition;
  contentWidth?: number;
  /** Match content width to the trigger. @default true */
  matchTriggerWidth?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => unknown;
  placement?: PopoverRootProps["placement"];
  actionsVisibility?: "hover" | "always";
  listboxProps?: Partial<ComponentProps<typeof Listbox.Root>>;
  search?: boolean | SelectionSearchOptions<T>;
  loading?: boolean;
  emptyMessage?: ReactNode;
  virtual?: boolean;
}

export type SelectRootProps<T, V extends SelectionValue = SelectionValue> = SelectRootBaseProps<
  T,
  V
> &
  SelectionProps<V>;

export interface SelectTriggerProps extends Omit<PopoverTriggerProps, "children"> {
  children?: ReactElement;
  buttonProps?: Partial<SelectButtonProps>;
}

type SearchInputProps = ComponentProps<typeof SearchInput>;

export interface SelectSearchProps extends Omit<
  SearchInputProps,
  "defaultValue" | "onChange" | "value"
> {
  children?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type SelectContentProps = Partial<PopoverContentProps>;
export type SelectListProps = HTMLStyledProps<"div">;
export type SelectItemProps<T> = Omit<ComponentProps<typeof Listbox.Item>, "item"> & { item: T };
export type SelectItemTextProps = ComponentProps<typeof Listbox.ItemText>;
export type SelectItemIndicatorProps = ComponentProps<typeof Listbox.ItemIndicator>;
export type SelectItemActionsProps = ComponentProps<typeof Listbox.ItemActions>;
export type SelectFooterProps = ComponentProps<typeof Box>;

const MIN_CONTENT_WIDTH = 140;

function getDefaultValueLabel<T, V extends SelectionValue>(
  selectedValues: readonly V[],
  selectedItems: readonly T[],
  getItemLabel: (item: T) => string,
  placeholder: ReactNode,
): ReactNode {
  if (selectedValues.length === 0) return placeholder;
  if (selectedValues.length === 1) {
    return selectedItems[0] == null ? "1 selected" : getItemLabel(selectedItems[0]);
  }
  return `${selectedValues.length} selected`;
}

interface SelectPopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverRootProps["placement"];
  matchTriggerWidth?: boolean;
  contentWidth?: number;
  children: ReactNode;
}

function SelectPopover({
  open,
  onOpenChange,
  placement,
  matchTriggerWidth = true,
  contentWidth,
  children,
}: SelectPopoverProps) {
  return (
    <Popover.Root
      lazyMount
      open={open}
      onOpenChange={({ open: nextOpen }) => onOpenChange?.(nextOpen)}
      positioning={{ placement, sameWidth: matchTriggerWidth && contentWidth == null }}
    >
      {children}
    </Popover.Root>
  );
}

function SelectPopoverContent({
  contentWidth,
  matchTriggerWidth = true,
  children,
  ...props
}: SelectContentProps & { contentWidth?: number; matchTriggerWidth?: boolean }) {
  return (
    <Popover.Content
      minW={contentWidth == null ? MIN_CONTENT_WIDTH : undefined}
      {...(contentWidth != null
        ? { width: contentWidth }
        : matchTriggerWidth
          ? { width: "full" }
          : {})}
      p="0"
      {...props}
    >
      {children}
    </Popover.Content>
  );
}

function SelectRoot<T, V extends SelectionValue>(props: SelectRootProps<T, V>) {
  const {
    actionsVisibility,
    children,
    contentWidth,
    defaultOpen = false,
    emptyMessage,
    getItemLabel,
    getItemProps,
    getItemValue,
    indicatorPosition = "end",
    isItemDisabled,
    items,
    listboxProps,
    loading,
    matchTriggerWidth = true,
    onOpenChange,
    open,
    placeholder = "Select item",
    placement,
    renderItem,
    renderItemActions,
    renderValue,
    search,
    selectionMode = "single",
    value,
    virtual,
    onValueChange,
  } = props;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const resolvedOpen = open ?? internalOpen;
  const scrollToIndexRef = useRef<((index: number) => void) | undefined>(undefined);

  function handleOpenChange(nextOpen: boolean) {
    if (open == null) setInternalOpen(nextOpen);
    if (!nextOpen) controller.search.reset();
    onOpenChange?.(nextOpen);
  }

  const controller = useSelectionController<T, V>({
    items,
    getItemValue,
    getItemLabel,
    isItemDisabled,
    selectionMode,
    value,
    onValueChange: (nextValue) => {
      (onValueChange as (value: V | V[] | null) => unknown)(nextValue);
      if (selectionMode === "single") handleOpenChange(false);
    },
    search,
  });

  const triggerValue = renderValue
    ? renderValue({ value, selectedItems: controller.selectedItems })
    : getDefaultValueLabel(
        controller.selectedValues,
        controller.selectedItems,
        getItemLabel,
        placeholder,
      );

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      controller: controller as SelectionController<unknown, SelectionValue>,
      contentWidth,
      matchTriggerWidth,
      indicatorPosition,
      placeholder,
      triggerValue,
      hasValue: controller.selectedValues.length > 0,
      loading,
      emptyMessage,
      virtual,
      scrollToIndexRef,
      renderItem: renderItem as SelectContextValue["renderItem"],
      renderItemActions: renderItemActions as SelectContextValue["renderItemActions"],
      getItemProps: getItemProps as SelectContextValue["getItemProps"],
    }),
    [
      contentWidth,
      controller,
      emptyMessage,
      getItemProps,
      indicatorPosition,
      loading,
      matchTriggerWidth,
      placeholder,
      renderItem,
      renderItemActions,
      triggerValue,
      virtual,
    ],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <SelectPopover
        open={resolvedOpen}
        onOpenChange={handleOpenChange}
        placement={placement}
        matchTriggerWidth={matchTriggerWidth}
        contentWidth={contentWidth}
      >
        <Listbox.Root
          {...listboxProps}
          actionsVisibility={actionsVisibility}
          indicatorPosition={indicatorPosition}
          collection={controller.collection}
          value={controller.encodedValue}
          onValueChange={controller.handleValueChange}
          selectionMode={selectionMode}
          deselectable={selectionMode === "single" ? false : undefined}
          scrollToIndexFn={
            virtual
              ? (details) => scrollToIndexRef.current?.(details.index)
              : listboxProps?.scrollToIndexFn
          }
        >
          {children}
        </Listbox.Root>
      </SelectPopover>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children, buttonProps, ...triggerProps }: SelectTriggerProps) {
  const { hasValue, triggerValue } = useSelectContext();

  return (
    <Popover.Trigger
      {...triggerProps}
      asChild
    >
      {children ?? (
        <SelectButton
          {...buttonProps}
          hasValue={buttonProps?.hasValue ?? hasValue}
          label={buttonProps?.label ?? triggerValue}
        />
      )}
    </Popover.Trigger>
  );
}

function SelectContent({ children, ...props }: SelectContentProps) {
  const { contentWidth, matchTriggerWidth } = useSelectContext();
  return (
    <SelectPopoverContent
      contentWidth={contentWidth}
      matchTriggerWidth={matchTriggerWidth}
      {...props}
    >
      {children}
    </SelectPopoverContent>
  );
}

function SelectSearch({
  children,
  css,
  onChange,
  placeholder,
  size = "sm",
  variant = "plain",
  ...props
}: SelectSearchProps) {
  const { controller } = useSelectContext();
  if (!controller.search.showInput) return null;
  const resolvedPlaceholder = placeholder ?? controller.search.placeholder;

  return (
    <HStack
      gap="0"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <SearchInput
        aria-label={resolvedPlaceholder}
        {...props}
        autoFocus={props.autoFocus ?? controller.search.autoFocus}
        placeholder={resolvedPlaceholder}
        value={controller.search.query}
        onChange={(event) => {
          controller.search.setQuery(event.target.value);
          onChange?.(event);
        }}
        onClear={() => controller.search.setQuery("")}
        size={size}
        css={cssFn.raw({ flex: 1 }, css)}
        variant={variant}
      />
      {children ?? controller.search.endElement}
    </HStack>
  );
}

function SelectList(props: SelectListProps) {
  const {
    controller,
    emptyMessage,
    getItemProps,
    indicatorPosition,
    loading,
    renderItem,
    renderItemActions,
    scrollToIndexRef,
    virtual,
  } = useSelectContext();

  return (
    <ManagedList
      controller={controller}
      loading={loading}
      emptyMessage={emptyMessage}
      indicatorPosition={indicatorPosition}
      renderItem={renderItem}
      renderItemActions={renderItemActions}
      getItemProps={getItemProps}
      contentProps={props}
      virtual={virtual}
      scrollToIndexRef={scrollToIndexRef}
    />
  );
}

const SelectItem = Listbox.Item;
const SelectItemText = Listbox.ItemText;
const SelectItemActions = Listbox.ItemActions;

function SelectItemIndicator(props: SelectItemIndicatorProps) {
  const { indicatorPosition } = useSelectContext();
  if (indicatorPosition === "none") return null;
  return <Listbox.ItemIndicator {...props} />;
}

function SelectEmptyState({ children = "No items available" }: { children?: ReactNode }) {
  const { controller } = useSelectContext();
  if (controller.collection.items.length > 0) return null;
  return <Listbox.EmptyState>{children}</Listbox.EmptyState>;
}

function SelectFooter({ children, ...props }: SelectFooterProps) {
  return <Box {...props}>{children}</Box>;
}

interface SelectSimpleProps<T, V extends SelectionValue> extends Omit<
  SelectRootBaseProps<T, V>,
  "children"
> {
  triggerProps?: SelectTriggerProps;
  contentProps?: SelectContentProps;
  listProps?: SelectListProps;
  footer?: ReactNode;
}

export type SelectProps<T, V extends SelectionValue = SelectionValue> = SelectSimpleProps<T, V> &
  SelectionProps<V>;

function SelectSimple<T, V extends SelectionValue>(
  props: SelectSimpleProps<T, V> & SingleSelectionProps<V>,
): JSX.Element;
function SelectSimple<T, V extends SelectionValue>(
  props: SelectSimpleProps<T, V> & MultipleSelectionProps<V>,
): JSX.Element;
function SelectSimple<T, V extends SelectionValue>({
  triggerProps,
  contentProps,
  listProps,
  footer,
  search,
  ...rootProps
}: SelectProps<T, V>) {
  return (
    <SelectRoot
      {...rootProps}
      search={search}
    >
      <SelectTrigger {...triggerProps} />
      <SelectContent {...contentProps}>
        {search !== false && search != null && <SelectSearch />}
        <SelectList {...listProps} />
        {footer != null && <SelectFooter>{footer}</SelectFooter>}
      </SelectContent>
    </SelectRoot>
  );
}

export const Select = Object.assign(SelectSimple, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Search: SelectSearch,
  List: SelectList,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  ItemActions: SelectItemActions,
  EmptyState: SelectEmptyState,
  Footer: SelectFooter,
});
