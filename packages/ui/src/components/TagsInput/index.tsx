import {
  TagsInput as ArkTagsInput,
  TagsInputContext,
  useTagsInputContext,
} from "@ark-ui/react/tags-input";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { createStyleContext } from "styled-system/jsx";
import { tagsInput } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(tagsInput);

type ItemProps = ComponentProps<typeof Item>;

const Root = withProvider(ArkTagsInput.Root, "root");
const RootProvider = withProvider(ArkTagsInput.RootProvider, "root");
const ClearTrigger = withContext(ArkTagsInput.ClearTrigger, "clearTrigger", {
  defaultProps: { children: <XIcon /> },
});
const Control = withContext(ArkTagsInput.Control, "control");
const HiddenInput = ArkTagsInput.HiddenInput;
const Input = withContext(ArkTagsInput.Input, "input");
const Item = withContext(ArkTagsInput.Item, "item");
const ItemDeleteTrigger = withContext(ArkTagsInput.ItemDeleteTrigger, "itemDeleteTrigger", {
  defaultProps: { children: <XIcon /> },
});
const ItemInput = withContext(ArkTagsInput.ItemInput, "itemInput");
const ItemPreview = withContext(ArkTagsInput.ItemPreview, "itemPreview");
const ItemText = withContext(ArkTagsInput.ItemText, "itemText");
const Label = withContext(ArkTagsInput.Label, "label");

export interface TagsInputItemsProps extends Omit<ItemProps, "value" | "index"> {}

function Items(props: TagsInputItemsProps) {
  const context = useTagsInputContext();

  return context.value.map((item, index) => (
    <Item
      key={item}
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

export type TagsInputRootProps = ComponentProps<typeof Root>;

export const TagsInput = {
  Root,
  RootProvider,
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
  Context: TagsInputContext,
};
