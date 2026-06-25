import type { Meta, StoryObj } from "@storybook/react-vite";

import type { DisplayValueProps } from ".";
import { DisplayValue } from ".";

const meta: Meta<typeof DisplayValue> = {
  title: "Components/DisplayValue",
  component: DisplayValue,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DisplayValue>;

export const WithValue: Story = {
  args: { value: "Hello World" },
};

export const Empty: Story = {
  args: { value: null },
};

export const WithFormat: StoryObj<DisplayValueProps<number>> = {
  args: {
    value: 1234.56,
    formatValue: (v) => `$${v.toFixed(2)}`,
  },
};
