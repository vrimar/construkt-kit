import { Box } from "@construkt-kit/styled-system/jsx";
import { type ReactNode, useMemo } from "react";

import type { SelectionSearchOptions, SelectionValue } from "../Listbox/types";
import { encodeSelectionValue } from "../Listbox/useSelectionController";
import { TagsInput } from "../TagsInput";
import { Text } from "../Text";
import type {
  SelectContentProps,
  SelectListProps,
  SelectRootProps,
  SelectTriggerProps,
} from "./Select";
import { Select } from "./Select";

type TagSelectRootProps<T, V extends SelectionValue> = Omit<
  SelectRootProps<T, V>,
  "children" | "onValueChange" | "selectionMode" | "value"
>;

export interface TagSelectProps<
  T,
  V extends SelectionValue = SelectionValue,
> extends TagSelectRootProps<T, V> {
  value: readonly V[];
  onValueChange: (value: V[]) => unknown;
  contentProps?: SelectContentProps;
  footer?: ReactNode;
  listProps?: SelectListProps;
  renderTag?: (item: T) => ReactNode;
  tagPlaceholder?: ReactNode;
  triggerProps?: Omit<SelectTriggerProps, "children">;
  /** Search defaults to enabled. */
  search?: boolean | SelectionSearchOptions<T>;
}

export function TagSelect<T, V extends SelectionValue>({
  contentProps,
  footer,
  getItemLabel,
  getItemValue,
  items,
  listProps,
  onValueChange,
  renderTag,
  search = true,
  tagPlaceholder,
  triggerProps,
  value,
  ...rootProps
}: TagSelectProps<T, V>) {
  const itemByValue = useMemo(
    () => new Map(items.map((item) => [encodeSelectionValue(getItemValue(item)), item])),
    [getItemValue, items],
  );

  const trigger = (
    <Box width="full">
      <TagsInput.Root
        cursor="pointer"
        value={value.map(encodeSelectionValue)}
      >
        <TagsInput.Control outline="none">
          {value.map((nativeValue, index) => {
            const encodedValue = encodeSelectionValue(nativeValue);
            const item = itemByValue.get(encodedValue);
            if (item == null) return null;

            return (
              <TagsInput.Item
                key={encodedValue}
                index={index}
                value={encodedValue}
              >
                <TagsInput.ItemPreview>
                  {renderTag?.(item)}
                  <TagsInput.ItemText>{getItemLabel(item)}</TagsInput.ItemText>
                </TagsInput.ItemPreview>
                <TagsInput.ItemInput />
              </TagsInput.Item>
            );
          })}
          {value.length === 0 && (
            <Text
              ml="1"
              color="fg.subtle"
            >
              {tagPlaceholder}
            </Text>
          )}
        </TagsInput.Control>
      </TagsInput.Root>
    </Box>
  );

  return (
    <Select.Root
      {...rootProps}
      items={items}
      getItemLabel={getItemLabel}
      getItemValue={getItemValue}
      value={value}
      onValueChange={onValueChange}
      selectionMode="multiple"
      search={search}
    >
      <Select.Trigger {...triggerProps}>{trigger}</Select.Trigger>
      <Select.Content {...contentProps}>
        {search !== false && <Select.Search />}
        <Select.List {...listProps} />
        {footer}
      </Select.Content>
    </Select.Root>
  );
}
