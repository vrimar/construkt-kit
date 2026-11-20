import {
  type ComponentProps,
  type InputHTMLAttributes,
  type ReactNode,
  createContext,
  useContext,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { segmentGroup } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import {
  type RadioGroupRootOptions,
  type RadioItem,
  type RadioItemOptions,
  type RadioValueChangeDetails,
  RadioGroupProvider,
  RadioItemProvider,
  useRadioGroupLabelProps,
  useRadioGroupRoot,
  useRadioIndicator,
  useRadioItem,
  useRadioItemContext,
} from "../radioGroup";

export type { RadioValueChangeDetails as SegmentGroupValueChangeDetails };

const { withProvider, withContext } = createSlotRecipeContext(segmentGroup);

const StyledRoot = withProvider(renderable.div, "root");
const StyledLabel = withContext(renderable.span, "label");
const StyledIndicator = withContext(renderable.div, "indicator");
const StyledItem = withContext(renderable.label, "item");
const StyledItemControl = withContext(renderable.div, "itemControl");
const StyledItemText = withContext(renderable.span, "itemText");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface SegmentGroupRootProps
  extends Omit<StyledRootProps, keyof RadioGroupRootOptions>, RadioGroupRootOptions {}

function Root({
  ref,
  value,
  defaultValue,
  onValueChange,
  name,
  form,
  disabled,
  readOnly,
  invalid,
  required,
  orientation = "horizontal",
  id,
  ...props
}: SegmentGroupRootProps) {
  const { context, rootProps } = useRadioGroupRoot({
    value,
    defaultValue,
    onValueChange,
    name,
    form,
    disabled,
    readOnly,
    invalid,
    required,
    orientation,
    id,
  });
  const composedRef = useComposedRefs(rootProps.ref, ref);

  return (
    <RadioGroupProvider value={context}>
      <StyledRoot
        {...rootProps}
        {...props}
        ref={composedRef}
      />
    </RadioGroupProvider>
  );
}

function Label(props: ComponentProps<typeof StyledLabel>) {
  return (
    <StyledLabel
      {...mergeProps<ComponentProps<typeof StyledLabel>>(useRadioGroupLabelProps(), props)}
    />
  );
}

/** Slides to the checked item. */
function Indicator(props: ComponentProps<typeof StyledIndicator>) {
  const { style, ...indicator } = useRadioIndicator();
  return (
    <StyledIndicator
      {...indicator}
      {...props}
      style={{ ...style, ...props.style }}
    />
  );
}

interface SegmentItemContextValue {
  item: RadioItem;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
}

const SegmentItemContext = createContext<SegmentItemContextValue | null>(null);

function useSegmentItem(part: string): SegmentItemContextValue {
  const context = useContext(SegmentItemContext);
  if (!context) throw new Error(`SegmentGroup.${part} must be placed inside <SegmentGroup.Item>.`);
  return context;
}

type StyledItemProps = ComponentProps<typeof StyledItem>;

export interface SegmentGroupItemProps
  extends Omit<StyledItemProps, keyof RadioItemOptions>, RadioItemOptions {}

/** One option, a `<label>` around its text and its `SegmentGroup.ItemHiddenInput` radio. */
function Item({ value, disabled, invalid, ...props }: SegmentGroupItemProps) {
  const { item, itemProps, inputProps } = useRadioItem({ value, disabled, invalid });

  return (
    <SegmentItemContext.Provider value={{ item, inputProps }}>
      <RadioItemProvider value={item}>
        <StyledItem {...mergeProps<StyledItemProps>(itemProps, props)} />
      </RadioItemProvider>
    </SegmentItemContext.Provider>
  );
}

function ItemText(props: ComponentProps<typeof StyledItemText>) {
  const { attributes, textId } = useRadioItemContext("SegmentGroup.ItemText");
  return (
    <StyledItemText
      id={textId}
      {...attributes}
      {...props}
    />
  );
}

function ItemControl(props: ComponentProps<typeof StyledItemControl>) {
  const { attributes } = useRadioItemContext("SegmentGroup.ItemControl");
  return (
    <StyledItemControl
      aria-hidden
      {...attributes}
      {...props}
    />
  );
}

type ItemHiddenInputProps = ComponentProps<typeof renderable.input>;

/** The item's native radio, which takes focus and submits the group's value with a form. */
function ItemHiddenInput(props: ItemHiddenInputProps) {
  const { inputProps } = useSegmentItem("ItemHiddenInput");
  return <renderable.input {...mergeProps<ItemHiddenInputProps>(inputProps, props)} />;
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
      <ItemHiddenInput />
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
  ItemHiddenInput,
  Items,
  ItemText,
  Label,
};
