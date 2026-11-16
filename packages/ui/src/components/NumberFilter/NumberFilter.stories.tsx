import preview from "@construkt-kit/story-kit/preview";
import type { NumberFilterValue } from "@construkt-kit/utils";
import { useState } from "react";

import { NumberFilter, type NumberFilterProps } from ".";
import { Box } from "../Layout";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/NumberFilter",
  component: NumberFilter,
  tags: ["autodocs"],
});

function NumberFilterStory(props: Partial<NumberFilterProps>) {
  const [value, setValue] = useState<NumberFilterValue | undefined>(props.value);

  return (
    <Box maxW="320px">
      <NumberFilter
        placeholder="Amount"
        {...props}
        value={value}
        onValueChange={setValue}
      />
      <Text
        mt="2"
        color="fg.muted"
      >
        {value ? JSON.stringify(value) : "No active filter"}
      </Text>
    </Box>
  );
}

export const Default = meta.story({
  render: () => <NumberFilterStory />,
});

export const RestrictedOperators = meta.story({
  render: () => <NumberFilterStory operators={["gte", "lte", "between"]} />,
});

export const Between = meta.story({
  render: () => <NumberFilterStory value={{ operator: "between", value: 100, to: 200 }} />,
});
