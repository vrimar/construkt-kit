import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Columns3Icon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  KeyboardIcon,
  PlusIcon,
  SearchIcon,
  SunMoonIcon,
  TableIcon,
  Undo2Icon,
  UsersIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { CommandPalette, type CommandPalettePage } from ".";
import { formatShortcut } from "../../foundations/shortcuts";
import { Button } from "../Buttons";
import { Kbd } from "../Kbd";
import { Stack } from "../Layout";
import { Text } from "../Text";

const meta: Meta = {
  title: "Components/CommandPalette",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

interface Command {
  value: string;
  label: string;
  icon: ReactNode;
  description?: string;
  meta?: string;
  shortcut?: string;
  disabledReason?: string;
  opensPage?: string;
}

const THEMES = ["System", "Light", "Dark"];

const RECENT: Command[] = [
  { value: "orders", label: "Open orders", icon: <TableIcon />, meta: "1,204" },
  { value: "invoices", label: "Unpaid invoices", icon: <TableIcon />, meta: "1,180" },
  { value: "team-design", label: "Design team", icon: <UsersIcon />, meta: "12" },
  { value: "doc-roadmap", label: "Product roadmap", icon: <FileTextIcon />, meta: "8 pages" },
  { value: "customers", label: "Customers", icon: <TableIcon />, meta: "1,204" },
];

const CREATE: Command[] = [
  { value: "new-table", label: "New table", icon: <TableIcon /> },
  { value: "new-team", label: "New team", icon: <UsersIcon /> },
  { value: "new-board", label: "New board", icon: <Columns3Icon /> },
  { value: "new-document", label: "New document", icon: <FileTextIcon /> },
];

const RECENT_LIMIT = 3;

const matches = (command: Command, query: string) => {
  const text = `${command.label} ${command.description ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => text.includes(word));
};

export const Default: Story = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [pages, setPages] = useState<CommandPalettePage[]>([]);
    const [theme, setTheme] = useState(THEMES[0]);
    const [lastRun, setLastRun] = useState<string | null>(null);

    const openPalette = () => {
      setQuery("");
      setPages([]);
      setOpen(true);
    };

    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
        event.preventDefault();
        setQuery("");
        setPages([]);
        setOpen(true);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const actions: Command[] = [
      { value: "add-task", label: "Add task", icon: <PlusIcon />, shortcut: "T" },
      {
        value: "theme",
        label: "Change theme",
        icon: <SunMoonIcon />,
        meta: theme,
        opensPage: "themes",
      },
      {
        value: "filter",
        label: "Change filter",
        icon: <FilterIcon />,
        description: "Show only the items that match a rule",
      },
      {
        value: "export-document",
        label: "Export this document",
        icon: <DownloadIcon />,
        disabledReason: "Open a document to export it",
      },
      { value: "undo", label: "Undo", icon: <Undo2Icon />, shortcut: formatShortcut("Mod+Z") },
      { value: "shortcuts", label: "Keyboard shortcuts", icon: <KeyboardIcon />, shortcut: "?" },
    ];

    const search = query.trim();
    const renderCommand = (command: Command) => (
      <CommandPalette.Item
        key={command.value}
        value={command.value}
        label={command.label}
        icon={command.icon}
        description={command.description}
        meta={command.meta}
        shortcut={command.shortcut}
        disabled={command.disabledReason != null}
        disabledReason={command.disabledReason}
        opensPage={command.opensPage}
        onSelect={command.opensPage == null ? () => setLastRun(command.label) : undefined}
      />
    );

    const renderRootPage = () => {
      const groups = [
        { label: "Actions", items: actions.filter((command) => matches(command, search)) },
        { label: "Recent", items: RECENT.filter((command) => matches(command, search)) },
        { label: "Create", items: CREATE.filter((command) => matches(command, search)) },
      ];

      return groups.map(({ label, items }) => {
        if (items.length === 0) return null;
        const limited = label === "Recent" ? items.slice(0, RECENT_LIMIT) : items;
        return (
          <CommandPalette.Group
            key={label}
            label={label}
            count={limited.length < items.length ? items.length : undefined}
          >
            {limited.map(renderCommand)}
          </CommandPalette.Group>
        );
      });
    };

    const renderThemesPage = () =>
      THEMES.filter((name) => name.toLowerCase().includes(search.toLowerCase())).map((name) => (
        <CommandPalette.Item
          key={name}
          value={name}
          label={name}
          icon={<SunMoonIcon />}
          checked={name === theme}
          onSelect={() => setTheme(name)}
        />
      ));

    const page = pages.at(-1);

    return (
      <Stack
        gap="3"
        alignItems="flex-start"
      >
        <Button
          variant="outline"
          onClick={openPalette}
        >
          <SearchIcon />
          Search or run a command
          <Kbd size="sm">{formatShortcut("Mod+K")}</Kbd>
        </Button>
        <Text color="fg.muted">
          Theme: {theme}
          {lastRun && ` · Last run: ${lastRun}`}
        </Text>
        <CommandPalette.Root
          open={open}
          onOpenChange={({ open: next }) => setOpen(next)}
          query={query}
          onQueryChange={setQuery}
          pages={pages}
          onPagesChange={setPages}
        >
          <CommandPalette.Input
            placeholder={page == null ? "Search or run a command" : "Search themes"}
          />
          <CommandPalette.List>
            {page == null ? renderRootPage() : renderThemesPage()}
            <CommandPalette.Empty>Nothing matches “{search}”.</CommandPalette.Empty>
          </CommandPalette.List>
        </CommandPalette.Root>
      </Stack>
    );
  },
};
