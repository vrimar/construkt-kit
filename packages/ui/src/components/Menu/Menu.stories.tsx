import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, PencilIcon, ShareIcon, TrashIcon } from "lucide-react";
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
          icon={<PencilIcon />}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          value="copy"
          icon={<CopyIcon />}
        >
          Copy
        </Menu.Item>
        <Menu.Item
          value="share"
          icon={<ShareIcon />}
        >
          Share
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          value="delete"
          icon={<TrashIcon />}
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

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "120px", alignItems: "flex-start", padding: "16px" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Menu.Root
          key={size}
          open
          onOpenChange={() => {}}
          size={size}
        >
          <Menu.Trigger asChild>
            <Button variant="outline">{size}</Button>
          </Menu.Trigger>
          <Menu.Content portalled={false}>
            <Menu.Item value="edit">Edit</Menu.Item>
            <Menu.Item value="duplicate">Duplicate</Menu.Item>
            <Menu.Separator />
            <Menu.Item value="delete">Delete</Menu.Item>
          </Menu.Content>
        </Menu.Root>
      ))}
    </div>
  ),
};
