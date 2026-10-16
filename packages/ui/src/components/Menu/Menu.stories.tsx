import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CopyIcon,
  ExternalLinkIcon,
  PencilIcon,
  SettingsIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

import { menu } from "#styled-system/recipes";

import { Menu } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
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

export const TriggerWithTooltip: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger
        tooltip="Show actions"
        asChild
      >
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

export const Destructive: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Actions</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item
          value="edit"
          icon={<PencilIcon />}
        >
          Edit
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          value="delete"
          icon={<TrashIcon />}
          destructive
        >
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
};

export const Links: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Navigate</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item
          value="settings"
          icon={<SettingsIcon />}
          asChild
        >
          <a href="#settings">Settings</a>
        </Menu.Item>
        <Menu.Item
          value="docs"
          icon={<ExternalLinkIcon />}
          asChild
        >
          <a
            href="https://ark-ui.com"
            target="_blank"
            rel="noreferrer"
          >
            Documentation
          </a>
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={menu.variantMap.size}
      pivot
      renderPreview={(size) => (
        <Menu.Root
          open
          onOpenChange={() => {}}
          size={size}
        >
          <Menu.Trigger asChild>
            <Button
              size={size}
              variant="outline"
            >
              Actions
            </Button>
          </Menu.Trigger>
          <Menu.Content portalled={false}>
            <Menu.Item value="edit">Edit</Menu.Item>
            <Menu.Item value="duplicate">Duplicate</Menu.Item>
            <Menu.Separator />
            <Menu.Item value="delete">Delete</Menu.Item>
          </Menu.Content>
        </Menu.Root>
      )}
    />
  ),
};

function TypesDemo() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  const [underline, setUnderline] = useState(false);
  const [size, setSize] = useState("md");

  return (
    <Flex
      gap="20"
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
            checked={underline}
            onCheckedChange={(checked) => setUnderline(!!checked)}
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

export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Actions</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item
          value="edit"
          icon={<PencilIcon />}
        >
          Edit
        </Menu.Item>
        <Menu.Root>
          <Menu.TriggerItem>Export</Menu.TriggerItem>
          <Menu.Content backLabel="Actions">
            <Menu.Item value="csv">CSV</Menu.Item>
            <Menu.Item value="pdf">PDF</Menu.Item>
          </Menu.Content>
        </Menu.Root>
        <Menu.Separator />
        <Menu.Item
          value="delete"
          icon={<TrashIcon />}
          destructive
        >
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
};
