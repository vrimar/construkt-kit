import { XIcon } from "lucide-react";
import { type ComponentProps, createContext, useContext, useLayoutEffect, useRef } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tagsInput } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import {
  type TagsInputApi,
  type TagsInputOptions,
  TagsInputProvider,
  useTagsInput,
  useTagsInputContext,
} from "./useTagsInput";

export type {
  TagsInputInputValueChangeDetails,
  TagsInputInputValueChangeReason,
  TagsInputInvalidReason,
  TagsInputTranslations,
  TagsInputValueChangeDetails,
  TagsInputValueChangeReason,
} from "./useTagsInput";

const { withProvider, withContext } = createSlotRecipeContext(tagsInput);

const StyledRoot = withProvider(renderable.div, "root");
const StyledLabel = withContext(renderable.label, "label");
const StyledControl = withContext(renderable.div, "control");
const StyledInput = withContext(renderable.input, "input");
const StyledClearTrigger = withContext(renderable.button, "clearTrigger", {
  defaultProps: { children: <XIcon /> },
});
const StyledItem = withContext(renderable.div, "item");
const StyledItemPreview = withContext(renderable.div, "itemPreview");
const StyledItemText = withContext(renderable.span, "itemText");
const StyledItemInput = withContext(renderable.input, "itemInput");
const StyledItemDeleteTrigger = withContext(renderable.button, "itemDeleteTrigger", {
  defaultProps: { children: <XIcon /> },
});

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface TagsInputRootProps
  extends Omit<StyledRootProps, keyof TagsInputOptions>, TagsInputOptions {}

function Root({
  value,
  defaultValue,
  onValueChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  onHighlightChange,
  onValueInvalid,
  validate,
  sanitizeValue,
  allowDuplicates,
  max,
  allowOverflow,
  delimiter,
  addOnPaste,
  blurBehavior,
  editable,
  maxLength,
  placeholder,
  autoFocus,
  translations,
  name,
  form,
  disabled,
  readOnly,
  invalid,
  required,
  id,
  children,
  ...props
}: TagsInputRootProps) {
  const api = useTagsInput({
    value,
    defaultValue,
    onValueChange,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    onHighlightChange,
    onValueInvalid,
    validate,
    sanitizeValue,
    allowDuplicates,
    max,
    allowOverflow,
    delimiter,
    addOnPaste,
    blurBehavior,
    editable,
    maxLength,
    placeholder,
    autoFocus,
    translations,
    name,
    form,
    disabled,
    readOnly,
    invalid,
    required,
    id,
  });

  return (
    <TagsInputProvider value={api}>
      <StyledRoot {...mergeProps<StyledRootProps>(api.rootProps, props)}>
        {children}
        {api.liveRegion}
      </StyledRoot>
    </TagsInputProvider>
  );
}

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label(props: LabelProps) {
  const { labelProps } = useTagsInputContext("TagsInput.Label");
  return <StyledLabel {...mergeProps<LabelProps>(labelProps, props)} />;
}

type ControlProps = ComponentProps<typeof StyledControl>;

function Control(props: ControlProps) {
  const { controlProps } = useTagsInputContext("TagsInput.Control");
  return <StyledControl {...mergeProps<ControlProps>(controlProps, props)} />;
}

type InputProps = ComponentProps<typeof StyledInput>;

function Input({ ref, ...props }: InputProps) {
  const { inputProps } = useTagsInputContext("TagsInput.Input");
  const composedRef = useComposedRefs(inputProps.ref, ref);
  return (
    <StyledInput
      {...mergeProps<InputProps>(inputProps, props)}
      ref={composedRef}
    />
  );
}

type HiddenInputProps = ComponentProps<typeof renderable.input>;

function HiddenInput({ ref, ...props }: HiddenInputProps) {
  const { hiddenInputProps } = useTagsInputContext("TagsInput.HiddenInput");
  const composedRef = useComposedRefs(hiddenInputProps.ref, ref);
  return (
    <renderable.input
      {...mergeProps<HiddenInputProps>(hiddenInputProps, props)}
      ref={composedRef}
    />
  );
}

type ClearTriggerProps = ComponentProps<typeof StyledClearTrigger>;

function ClearTrigger(props: ClearTriggerProps) {
  const { clearTriggerProps } = useTagsInputContext("TagsInput.ClearTrigger");
  return <StyledClearTrigger {...mergeProps<ClearTriggerProps>(clearTriggerProps, props)} />;
}

type ItemParts = ReturnType<TagsInputApi["getItemParts"]>;

const ItemContext = createContext<ItemParts | null>(null);

function useItemParts(part: string): ItemParts {
  const parts = useContext(ItemContext);
  if (!parts) throw new Error(`${part} must be placed inside <TagsInput.Item>.`);
  return parts;
}

type StyledItemProps = ComponentProps<typeof StyledItem>;

export interface TagsInputItemProps extends StyledItemProps {
  /** The tag's position in the root's `value`. */
  index: number;
  /** The tag. */
  value: string;
  disabled?: boolean | undefined;
}

function Item({ ref, index, value, disabled, ...props }: TagsInputItemProps) {
  const { getItemParts, registerItem } = useTagsInputContext("TagsInput.Item");
  const parts = getItemParts(value, index, disabled);
  const itemRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(itemRef, ref);

  useLayoutEffect(() => {
    const item = itemRef.current;
    if (item) return registerItem(item);
  }, [registerItem]);

  return (
    <ItemContext value={parts}>
      <StyledItem
        {...mergeProps<StyledItemProps>(parts.itemProps, props)}
        ref={composedRef}
      />
    </ItemContext>
  );
}

type ItemPreviewProps = ComponentProps<typeof StyledItemPreview>;

function ItemPreview(props: ItemPreviewProps) {
  const { previewProps } = useItemParts("TagsInput.ItemPreview");
  return <StyledItemPreview {...mergeProps<ItemPreviewProps>(previewProps, props)} />;
}

type ItemTextProps = ComponentProps<typeof StyledItemText>;

function ItemText(props: ItemTextProps) {
  const { textProps } = useItemParts("TagsInput.ItemText");
  return <StyledItemText {...mergeProps<ItemTextProps>(textProps, props)} />;
}

type ItemInputProps = ComponentProps<typeof StyledItemInput>;

function ItemInput(props: ItemInputProps) {
  const { inputProps } = useItemParts("TagsInput.ItemInput");
  return <StyledItemInput {...mergeProps<ItemInputProps>(inputProps, props)} />;
}

type ItemDeleteTriggerProps = ComponentProps<typeof StyledItemDeleteTrigger>;

function ItemDeleteTrigger(props: ItemDeleteTriggerProps) {
  const { deleteTriggerProps } = useItemParts("TagsInput.ItemDeleteTrigger");
  return (
    <StyledItemDeleteTrigger {...mergeProps<ItemDeleteTriggerProps>(deleteTriggerProps, props)} />
  );
}

export interface TagsInputItemsProps extends Omit<TagsInputItemProps, "value" | "index"> {}

/** A preview, delete trigger and edit input for each tag in the root's `value`. */
function Items(props: TagsInputItemsProps) {
  const { value } = useTagsInputContext("TagsInput.Items");

  return value.map((item, index) => (
    <Item
      key={`${index}:${item}`}
      index={index}
      value={item}
      {...props}
    >
      <ItemPreview>
        <ItemText>{item}</ItemText>
        <ItemDeleteTrigger />
      </ItemPreview>
      <ItemInput />
    </Item>
  ));
}

export const TagsInput = {
  Root,
  ClearTrigger,
  Control,
  HiddenInput,
  Input,
  Item,
  ItemDeleteTrigger,
  ItemInput,
  ItemPreview,
  ItemText,
  Items,
  Label,
};
