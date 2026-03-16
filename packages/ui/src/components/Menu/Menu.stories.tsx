import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Menu",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Open Menu</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item value="edit">Edit</Menu.Item>
        <Menu.Item value="duplicate">Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item value="delete">Delete</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button>Actions</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item
          value="edit"
          icon={<span>✏️</span>}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          value="copy"
          icon={<span>📋</span>}
        >
          Copy
        </Menu.Item>
        <Menu.Item
          value="share"
          icon={<span>📤</span>}
        >
          Share
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          value="delete"
          icon={<span>🗑️</span>}
        >
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Grouped Menu</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.ItemGroup title="Actions">
          <Menu.Item value="edit">Edit</Menu.Item>
          <Menu.Item value="duplicate">Duplicate</Menu.Item>
        </Menu.ItemGroup>
        <Menu.Separator />
        <Menu.ItemGroup title="Danger Zone">
          <Menu.Item value="delete">Delete</Menu.Item>
        </Menu.ItemGroup>
      </Menu.Content>
    </Menu.Root>
  ),
};
