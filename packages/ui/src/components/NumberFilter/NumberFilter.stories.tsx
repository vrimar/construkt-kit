import type { NumberFilterValue } from "@construkt-kit/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { NumberFilter, type NumberFilterProps } from ".";
import { Box } from "../Layout";
import { Text } from "../Text";

const meta: Meta<typeof NumberFilter> = {
  title: "Components/NumberFilter",
  component: NumberFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NumberFilter>;

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

export const Default: Story = {
  render: () => <NumberFilterStory />,
};

export const RestrictedOperators: Story = {
  render: () => <NumberFilterStory operators={["gte", "lte", "between"]} />,
};

export const Between: Story = {
  render: () => <NumberFilterStory value={{ operator: "between", value: 100, to: 200 }} />,
};
