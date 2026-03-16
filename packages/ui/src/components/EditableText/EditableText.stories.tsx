import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EditableText } from ".";

const meta: Meta<typeof EditableText> = {
  title: "Components/EditableText",
  component: EditableText,
  tags: ["autodocs"],
  args: {
    text: "Editable value",
    onEdit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EditableText>;

export const Default: Story = {
  args: {
    children: "Click to edit this text",
  },
};

export const Loading: Story = {
  args: {
    children: "Saving...",
    isLoading: true,
  },
};
