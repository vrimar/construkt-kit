import { Box, type BoxProps } from "@construkt-kit/styled-system/jsx";
import type { ReactNode } from "react";

import type { SelectionSearchOptions, SelectionValue } from "../Listbox/types";
import { TagsInput } from "../TagsInput";
import { Text } from "../Text";
import type {
  SelectContentProps,
  SelectListProps,
  SelectRootProps,
  SelectTriggerProps,
} from "./Select";
import { Select } from "./Select";
import { useSelectContext } from "./Select.context";

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

interface TagSelectTriggerProps<T> extends BoxProps {
  renderTag?: (item: T) => ReactNode;
  tagPlaceholder?: ReactNode;
}

function TagSelectTrigger<T>({ renderTag, tagPlaceholder, ...props }: TagSelectTriggerProps<T>) {
  const { controller } = useSelectContext();
  const selectedItems = controller.selectedItems as T[];

  return (
    <Box
      width="full"
      {...props}
    >
      <TagsInput.Root
        cursor="pointer"
        readOnly
        value={controller.encodedValue}
      >
        <TagsInput.Control outline="none">
          {selectedItems.map((item) => {
            const encodedValue = controller.collection.getItemValue(item) ?? "";

            return (
              <TagsInput.Item
                key={encodedValue}
                index={controller.encodedValue.indexOf(encodedValue)}
                value={encodedValue}
              >
                <TagsInput.ItemPreview>
                  {renderTag?.(item)}
                  <TagsInput.ItemText>
                    {controller.collection.stringifyItem(item)}
                  </TagsInput.ItemText>
                </TagsInput.ItemPreview>
              </TagsInput.Item>
            );
          })}
          {selectedItems.length === 0 && (
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
}

export function TagSelect<T, V extends SelectionValue>({
  renderTag,
  search = true,
  tagPlaceholder,
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
        children: (
          <TagSelectTrigger
            renderTag={renderTag}
            tagPlaceholder={tagPlaceholder}
          />
        ),
      }}
    />
  );
}
