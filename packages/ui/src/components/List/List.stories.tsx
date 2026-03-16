import type { Meta, StoryObj } from "@storybook/react-vite";
import { List } from ".";

const meta: Meta = {
  title: "Components/List",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <List.Root>
      <List.Item>First item</List.Item>
      <List.Item>Second item</List.Item>
      <List.Item>Third item</List.Item>
    </List.Root>
  ),
};
