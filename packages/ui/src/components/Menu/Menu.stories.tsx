import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, PencilIcon, ShareIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Menu } from ".";
import { Button } from "../Buttons";
import { Flex } from "../Layout";

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
    <Flex
      gap="30"
      align="flex-start"
      p="4"
    >
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
    </Flex>
  ),
};

function TypesDemo() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  const [size, setSize] = useState("md");

  return (
    <Flex
      gap="30"
      align="flex-start"
      p="4"
    >
      <Menu.Root
        open
        onOpenChange={() => {}}
      >
        <Menu.Trigger asChild>
          <Button variant="outline">Checkbox</Button>
        </Menu.Trigger>
        <Menu.Content portalled={false}>
          <Menu.CheckboxItem
            value="bold"
            checked={bold}
            onCheckedChange={(checked) => setBold(!!checked)}
          >
            Bold
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            value="italic"
            checked={italic}
            onCheckedChange={(checked) => setItalic(!!checked)}
          >
            Italic
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            value="underline"
            checked={false}
          >
            Underline
          </Menu.CheckboxItem>
        </Menu.Content>
      </Menu.Root>

      <Menu.Root
        open
        onOpenChange={() => {}}
      >
        <Menu.Trigger asChild>
          <Button variant="outline">Radio</Button>
        </Menu.Trigger>
        <Menu.Content portalled={false}>
          <Menu.RadioItemGroup
            value={size}
            onValueChange={({ value }) => setSize(value)}
          >
            <Menu.RadioItem value="sm">Small</Menu.RadioItem>
            <Menu.RadioItem value="md">Medium</Menu.RadioItem>
            <Menu.RadioItem value="lg">Large</Menu.RadioItem>
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Root>
    </Flex>
  );
}

export const Types: Story = {
  render: () => <TypesDemo />,
};

export const ContextMenu: Story = {
  render: () => (
    <Menu.Root>
      <Menu.ContextTrigger
        p="10"
        border="2px dashed"
        borderRadius="md"
        textAlign="center"
        userSelect="none"
        borderColor="border"
      >
        Right-click here
      </Menu.ContextTrigger>
      <Menu.Content>
        <Menu.Item value="cut">Cut</Menu.Item>
        <Menu.Item value="copy">Copy</Menu.Item>
        <Menu.Item value="paste">Paste</Menu.Item>
        <Menu.Separator />
        <Menu.Item value="delete">Delete</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
};
