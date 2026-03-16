import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContextMenu } from ".";

const meta: Meta = {
  title: "Components/ContextMenu",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        style={{
          padding: "40px",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        Right-click here
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item value="cut">Cut</ContextMenu.Item>
        <ContextMenu.Item value="copy">Copy</ContextMenu.Item>
        <ContextMenu.Item value="paste">Paste</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item value="delete">Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  ),
};
