import type { KeyboardEvent, ReactNode } from "react";

import { Box, type BoxProps, createSlotRecipeContext } from "#styled-system/jsx";
import { tagsInput } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import type { Unstyled } from "../../types";
import { type SelectionValue, encodeSelectionValue } from "../selection";
import { Text } from "../Text";
import { Select } from "./Select";
import { useSelectContext } from "./Select.context";
import type {
  SelectMultipleValueProps,
  SelectSimpleProps,
  SelectTriggerProps,
} from "./Select.types";

export interface TagSelectProps<T, V extends SelectionValue = SelectionValue>
  extends Omit<SelectSimpleProps<T, V>, "triggerProps">, SelectMultipleValueProps<V> {
  renderTag?: (item: T) => ReactNode;
  triggerProps?: Unstyled<Omit<SelectTriggerProps, "buttonProps" | "children">>;
}

const { withProvider, withContext } = createSlotRecipeContext(tagsInput);

const TagList = withProvider(renderable.div, "root");
const TagListControl = withContext(renderable.div, "control");
const Tag = withContext(renderable.div, "item");
const TagPreview = withContext(renderable.div, "itemPreview");
const TagText = withContext(renderable.span, "itemText");

interface TagSelectTriggerProps<T> extends BoxProps {
  renderTag?: (item: T) => ReactNode;
}

function TagSelectTrigger<T>({ renderTag, onKeyDown, ...props }: TagSelectTriggerProps<T>) {
  const { managed, appliedItems, hasValue, triggerValue } = useSelectContext();
  const { getItemValue, getItemLabel } = managed.controller;
  const tags = (appliedItems as T[]).map((item) => ({
    item,
    value: encodeSelectionValue(getItemValue(item)),
  }));

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <Box
      width="full"
      role="button"
      tabIndex={0}
      borderRadius="md"
      cursor="pointer"
      focusVisibleRing="outside"
      {...props}
      onKeyDown={handleKeyDown}
    >
      <TagList>
        <TagListControl>
          {tags.map(({ item, value }) => (
            <Tag key={value}>
              <TagPreview>
                {renderTag?.(item)}
                <TagText>{getItemLabel(item)}</TagText>
              </TagPreview>
            </Tag>
          ))}
          {tags.length === 0 && (
            <Text
              ml="1"
              color={hasValue ? undefined : "fg.subtle"}
            >
              {triggerValue}
            </Text>
          )}
        </TagListControl>
      </TagList>
    </Box>
  );
}

export function TagSelect<T, V extends SelectionValue>({
  renderTag,
  search = true,
  triggerProps,
  ...selectProps
}: TagSelectProps<T, V>) {
  return (
    <Select
      {...selectProps}
      selectionMode="multiple"
      search={search}
      triggerProps={{
        ...triggerProps,
        children: <TagSelectTrigger renderTag={renderTag} />,
      }}
    />
  );
}
