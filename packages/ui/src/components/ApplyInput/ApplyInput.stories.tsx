import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ApplyInput } from ".";
import { Button } from "../Buttons";

const meta: Meta<typeof ApplyInput> = {
  title: "Components/ApplyInput",
  component: ApplyInput,
  tags: ["autodocs"],
  args: {
    value: "",
    onApply: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ApplyInput>;

export const Default: Story = {
  args: {
    children: (
      <Button
        variant="outline"
        size="sm"
      >
        Filter
      </Button>
    ),
    value: "",
  },
};

export const WithValue: Story = {
  args: {
    children: (
      <Button
        variant="outline"
        size="sm"
      >
        Filter (active)
      </Button>
    ),
    value: "test query",
  },
};
