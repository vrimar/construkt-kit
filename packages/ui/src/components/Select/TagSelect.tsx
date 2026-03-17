import React, { useLayoutEffect, useRef, useState } from "react";
import { Box } from "styled-system/jsx";
import { Text } from "../Text";

import { TagsInput } from "../TagsInput";
import { Select, type SelectProps, type SelectValue } from "./Select";

export interface TagSelectProps<T> extends Omit<
  SelectProps<T>,
  "trigger" | "selected" | "onSelect"
> {
  selected: SelectValue[];
  onSelect: (items: T) => unknown;
  renderTag?: (item: T) => React.ReactNode;
  placeholder?: string;
}

export const TagSelect = <T,>({
  selected,
  onSelect,
  placeholder,
  renderTag,
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
                  const item = props.items.find((i) => props.getValue(i) === id);

                  if (!item) return null;

                  return (
                    <TagsInput.Item
                      key={index}
                      index={index}
                      value={id}
                    >
                      <TagsInput.ItemPreview>
                        {renderTag(item)}
                        <TagsInput.ItemText>{props.getLabel(item)}</TagsInput.ItemText>
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
    <Select
      {...props}
      trigger={trigger}
      selected={selected}
      onSelect={onSelect}
      contentWidth={contentWidth}
    />
  );
};
