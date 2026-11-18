import preview from "@construkt-kit/story-kit/preview";
import {
  ClipboardPasteIcon,
  CopyIcon,
  ExternalLinkIcon,
  FolderInputIcon,
  GlobeIcon,
  LockIcon,
  MessageSquareIcon,
  PencilIcon,
  ScissorsIcon,
  SettingsIcon,
  ShareIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";

import { menu } from "#styled-system/recipes";

import { Menu } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { Kbd } from "../Kbd";
import { Box, Flex } from "../Layout";

const meta = preview.meta({
  title: "Components/Menu",
  tags: ["autodocs"],
});

export const Default = meta.story({
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
});

export const TriggerWithTooltip = meta.story({
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
});

export const WithIcons = meta.story({
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
});

export const WithGroups = meta.story({
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Grouped Menu</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.ItemGroup label="Actions">
          <Menu.Item value="edit">Edit</Menu.Item>
          <Menu.Item value="duplicate">Duplicate</Menu.Item>
        </Menu.ItemGroup>
        <Menu.Separator />
        <Menu.ItemGroup label="Danger Zone">
          <Menu.Item value="delete">Delete</Menu.Item>
        </Menu.ItemGroup>
      </Menu.Content>
    </Menu.Root>
  ),
});

export const Destructive = meta.story({
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
});

export const Hints = meta.story({
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Edit</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item
          value="cut"
          icon={<ScissorsIcon />}
          hint={<Kbd size="sm">⌘X</Kbd>}
        >
          Cut
        </Menu.Item>
        <Menu.Item
          value="copy"
          icon={<CopyIcon />}
          hint={<Kbd size="sm">⌘C</Kbd>}
        >
          Copy
        </Menu.Item>
        <Menu.Item
          value="paste"
          icon={<ClipboardPasteIcon />}
          hint={<Kbd size="sm">⌘V</Kbd>}
        >
          Paste
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          value="comments"
          icon={<MessageSquareIcon />}
          hint={12}
        >
          Comments
        </Menu.Item>
        <Menu.Item
          value="move"
          icon={<FolderInputIcon />}
          hint="›"
        >
          Move to…
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
});

export const Descriptions = meta.story({
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Visibility</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item
          value="public"
          icon={<GlobeIcon />}
          description="Anyone with the link can view."
        >
          Public
        </Menu.Item>
        <Menu.Item
          value="team"
          icon={<UsersIcon />}
          description="Members of your workspace can view. Guests need an invite before they can open it."
        >
          Team
        </Menu.Item>
        <Menu.Item
          value="private"
          icon={<LockIcon />}
          description="Only you and the people you invite can view or edit this board, its comments and its full revision history."
        >
          Private
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
});

export const DisabledWithReason = meta.story({
  render: () => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline">Assign</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.ItemGroup label="Team members">
          <Menu.Item
            value="ada"
            disabled
            hint="Already assigned"
          >
            Ada Lovelace
          </Menu.Item>
          <Menu.Item
            value="grace"
            hint="8 tasks"
          >
            Grace Hopper
          </Menu.Item>
          <Menu.Item
            value="alan"
            disabled
            hint="On leave"
          >
            Alan Turing
          </Menu.Item>
        </Menu.ItemGroup>
      </Menu.Content>
    </Menu.Root>
  ),
});

export const Links = meta.story({
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
});

export const Sizes = meta.story({
  tags: ["desktop-only"],
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
});

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

export const Types = meta.story({
  tags: ["desktop-only"],
  render: () => <TypesDemo />,
});

function FilterDemo() {
  const [kind, setKind] = useState("");
  const [sort, setSort] = useState("recent");
  const [grouped, setGrouped] = useState(true);

  return (
    <Box p="4">
      <Menu.Root
        open
        onOpenChange={() => {}}
        closeOnSelect={false}
        selection="tint"
      >
        <Menu.Trigger asChild>
          <Button variant="outline">Filter</Button>
        </Menu.Trigger>
        <Menu.Content
          portalled={false}
          width="64"
        >
          <Menu.ItemGroup
            label="File type"
            labelVariant="caps"
          >
            <Menu.RadioItemGroup
              value={kind}
              onValueChange={({ value }) => setKind(value)}
            >
              <Menu.RadioItem
                value=""
                hint={42}
              >
                All files
              </Menu.RadioItem>
              <Menu.RadioItem
                value="docs"
                hint={30}
              >
                Documents
              </Menu.RadioItem>
              <Menu.RadioItem
                value="images"
                hint={12}
              >
                Images
              </Menu.RadioItem>
            </Menu.RadioItemGroup>
          </Menu.ItemGroup>
          <Menu.Separator />
          <Menu.SegmentGroup
            label="Sort"
            value={sort}
            onValueChange={({ value }) => setSort(value)}
            segments={[
              { value: "recent", label: "Recent" },
              { value: "name", label: "Name" },
            ]}
          />
          <Menu.Separator />
          <Menu.SwitchItem
            value="group"
            checked={grouped}
            onCheckedChange={(checked) => setGrouped(!!checked)}
          >
            Group by type
          </Menu.SwitchItem>
        </Menu.Content>
      </Menu.Root>
    </Box>
  );
}

export const FilterAndSort = meta.story({
  tags: ["desktop-only"],
  render: () => <FilterDemo />,
});

export const ContextMenu = meta.story({
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
});

export const ContextAndButtonTriggers = meta.story({
  render: () => (
    <Menu.Root>
      <Menu.ContextTrigger asChild>
        <Flex
          align="center"
          justify="space-between"
          gap="4"
          p="4"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
          userSelect="none"
        >
          Right-click this row, or open its menu from the button
          <Menu.Trigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              More
            </Button>
          </Menu.Trigger>
        </Flex>
      </Menu.ContextTrigger>
      <Menu.Content>
        <Menu.Item value="rename">Rename</Menu.Item>
        <Menu.Item value="duplicate">Duplicate</Menu.Item>
        <Menu.Separator />
        <Menu.Item
          value="delete"
          destructive
        >
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
});

export const Phone = meta.story({
  tags: ["phone-only"],
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
});

export const Open = meta.story({
  tags: ["open-state"],
  // The phone sheet traps focus, so the trigger behind its aria-hidden page is unreachable.
  parameters: { a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } } },
  render: () => (
    <Menu.Root defaultOpen>
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
        <Menu.Item
          value="duplicate"
          icon={<CopyIcon />}
          hint={<Kbd size="sm">⌘D</Kbd>}
        >
          Duplicate
        </Menu.Item>
        <Menu.Item
          value="share"
          icon={<ShareIcon />}
        >
          Share
        </Menu.Item>
        <Menu.Item
          value="move"
          icon={<FolderInputIcon />}
        >
          Move to…
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
});
