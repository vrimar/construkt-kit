import { usePopoverContext } from "@ark-ui/react/popover";
import type { KeyboardEvent, ReactNode } from "react";

import { Box, type BoxProps } from "#styled-system/jsx";

import type { Unstyled } from "../../types";
import type { SelectionValue } from "../Listbox/types";
import { TagsInput } from "../TagsInput";
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

interface TagSelectTriggerProps<T> extends BoxProps {
  renderTag?: (item: T) => ReactNode;
}

function TagSelectTrigger<T>({ renderTag, onKeyDown, ...props }: TagSelectTriggerProps<T>) {
  const { managed, hasValue, triggerValue } = useSelectContext();
  const popover = usePopoverContext();
  const { controller } = managed;
  const selectedItems = controller.selectedItems as T[];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      popover.setOpen(true);
    }
  };

  return (
    <Box
      width="full"
      role="button"
      tabIndex={0}
      borderRadius="md"
      focusVisibleRing="outside"
      {...props}
      onKeyDown={handleKeyDown}
    >
      <TagsInput.Root
        cursor="pointer"
        readOnly
        value={controller.encodedValue}
      >
        <TagsInput.Control
          outline="none"
          tabIndex={-1}
        >
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
              color={hasValue ? undefined : "fg.subtle"}
            >
              {triggerValue}
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
