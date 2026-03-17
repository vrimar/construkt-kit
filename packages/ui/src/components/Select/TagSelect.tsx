import React, { useLayoutEffect, useRef, useState } from "react";
import { Box } from "styled-system/jsx";
import { Text } from "../Text";

import { TagsInput } from "../TagsInput";
import type {
  SelectContentProps,
  SelectListProps,
  SelectRootProps,
  SelectTriggerProps,
  SelectValue,
} from "./Select";
import { Select } from "./Select";

export interface TagSelectProps<T> extends Omit<
  SelectRootProps<T>,
  "children" | "contentWidth" | "onSelect" | "selected"
> {
  contentProps?: SelectContentProps;
  footer?: React.ReactNode;
  listProps?: SelectListProps;
  renderActions?: (item: T) => React.ReactNode;
  renderLabel?: (item: T) => React.ReactNode;
  searchExtra?: React.ReactNode;
  searchPlaceholder?: string;
  searchable?: boolean;
  selected: SelectValue[];
  onSelect: (items: T) => unknown;
  renderTag?: (item: T) => React.ReactNode;
  placeholder?: string;
  triggerProps?: Omit<SelectTriggerProps, "children">;
}

export const TagSelect = <T,>({
  contentProps,
  footer,
  getLabel,
  getValue,
  items,
  listProps,
  renderActions,
  renderLabel,
  selected,
  searchExtra,
  searchPlaceholder = "Search...",
  searchable = true,
  onSelect,
  placeholder,
  renderTag,
  triggerProps,
  ...props
}: TagSelectProps<T>) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (triggerRef.current) {
      setContentWidth(triggerRef.current.clientWidth);
    }
  }, []);

  const trigger = (
    <Box
      width="full"
      ref={triggerRef}
    >
      <TagsInput.Root
        cursor="pointer"
        value={selected as string[]}
      >
        <TagsInput.Control outline="none">
          {renderTag ? (
            <TagsInput.Context>
              {({ value }) =>
                value.map((id, index) => {
                  const item = items.find((entry) => getValue(entry) === id);

                  if (!item) return null;

                  return (
                    <TagsInput.Item
                      key={index}
                      index={index}
                      value={id}
                    >
                      <TagsInput.ItemPreview>
                        {renderTag(item)}
                        <TagsInput.ItemText>{getLabel(item)}</TagsInput.ItemText>
                      </TagsInput.ItemPreview>
                      <TagsInput.ItemInput />
                    </TagsInput.Item>
                  );
                })
              }
            </TagsInput.Context>
          ) : (
            <TagsInput.Items />
          )}
          {selected.length === 0 && (
            <Text
              ml="1"
              color="fg.subtle"
            >
              {placeholder}
            </Text>
          )}
        </TagsInput.Control>
      </TagsInput.Root>
    </Box>
  );

  return (
    <Select.Root
      {...props}
      contentWidth={contentWidth}
      getLabel={getLabel}
      getValue={getValue}
      items={items}
      onSelect={onSelect}
      selected={selected}
    >
      <Select.Trigger {...triggerProps}>{trigger}</Select.Trigger>
      <Select.Content {...contentProps}>
        {searchable && <Select.Search placeholder={searchPlaceholder}>{searchExtra}</Select.Search>}
        <Select.List {...listProps}>
          <Select.Items>
            {(item: T) => (
              <Select.Item
                key={String(getValue(item))}
                item={item}
              >
                <Select.ItemText>{renderLabel ? renderLabel(item) : undefined}</Select.ItemText>
                {renderActions?.(item)}
                <Select.ItemIndicator />
              </Select.Item>
            )}
          </Select.Items>
          <Select.EmptyState />
        </Select.List>
        {footer}
      </Select.Content>
    </Select.Root>
  );
};
