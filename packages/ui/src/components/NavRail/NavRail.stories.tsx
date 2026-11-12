import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FileTextIcon,
  FolderKanbanIcon,
  InboxIcon,
  LayoutGridIcon,
  ListChecksIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { NavRail } from ".";
import { Button } from "../Buttons";
import { Box, HStack, Stack } from "../Layout";
import { Text } from "../Text";

const meta: Meta = {
  title: "Components/NavRail",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const PLACES: Array<{ id: string; label: string; icon: ReactNode }> = [
  { id: "overview", label: "Overview", icon: <LayoutGridIcon /> },
  { id: "projects", label: "Projects", icon: <FolderKanbanIcon /> },
  { id: "documents", label: "Documents", icon: <FileTextIcon /> },
  { id: "tasks", label: "Tasks", icon: <ListChecksIcon /> },
  { id: "team", label: "Team", icon: <UsersIcon /> },
  { id: "inbox", label: "Inbox", icon: <InboxIcon /> },
];

const UNREAD_TIP = "3 unread messages";

function RailBesidePane() {
  const [place, setPlace] = useState("projects");
  const [tucked, setTucked] = useState(false);
  const current = [...PLACES, { id: "settings", label: "Settings" }].find((p) => p.id === place);

  const open = (id: string) => {
    setPlace(id);
    setTucked(false);
  };

  return (
    <HStack
      alignItems="stretch"
      gap="0"
      h="lg"
      py="2.5"
      bg="bg.muted"
    >
      <NavRail.Root aria-label="Main">
        {PLACES.map((p) => {
          const isTucked = tucked && p.id === place;
          const unread = p.id === "inbox" && !isTucked;
          const tip = isTucked
            ? `${p.label} list tucked away while the assistant is open · click to show`
            : UNREAD_TIP;
          return (
            <NavRail.Item
              key={p.id}
              icon={p.icon}
              label={p.label}
              active={p.id === place}
              tucked={isTucked}
              dot={unread}
              aria-label={unread ? `Inbox, ${UNREAD_TIP}` : undefined}
              tooltip={isTucked || unread ? tip : undefined}
              onClick={() => open(p.id)}
            />
          );
        })}
        <NavRail.Footer>
          <NavRail.Item
            icon={<SettingsIcon />}
            label="Settings"
            active={place === "settings"}
            onClick={() => open("settings")}
          />
        </NavRail.Footer>
      </NavRail.Root>
      {!tucked && (
        <Box
          w="64"
          p="4"
          bg="bg"
          borderWidth="1px"
          borderColor="border"
          borderRadius="md"
        >
          <Text fontWeight="semibold">{current?.label}</Text>
          <Text
            color="fg.muted"
            textStyle="sm"
          >
            The pane for this section.
          </Text>
        </Box>
      )}
      <Stack
        flex="1"
        mx="2.5"
        p="4"
        bg="bg"
        borderWidth="1px"
        borderColor="border"
        borderRadius="md"
        alignItems="flex-start"
      >
        <Text color="fg.muted">Canvas</Text>
        <Button
          variant="outline"
          size="sm"
          disabled={tucked}
          onClick={() => setTucked(true)}
        >
          Open the assistant
        </Button>
      </Stack>
    </HStack>
  );
}

export const Default: Story = {
  render: () => <RailBesidePane />,
};
