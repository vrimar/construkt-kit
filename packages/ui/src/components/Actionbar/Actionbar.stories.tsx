import preview from "@construkt-kit/story-kit/preview";
import { EyeOffIcon, LayersIcon, ListPlusIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { ActionBar } from ".";
import { ResizableFrame } from "../../_shared/ResizableFrame";
import { Button, IconButton } from "../Buttons";
import { Checkbox } from "../Checkbox";
import { Box, HStack, Stack } from "../Layout";
import { Menu } from "../Menu";
import { Text } from "../Text";
import { Toolbar } from "../Toolbar";

const meta = preview.meta({
  title: "Components/Actionbar",
  tags: ["autodocs"],
});

function ControlledActionBarStory() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen((prev) => !prev)}>
        {open ? "Deselect items" : "Select items"}
      </Button>
      <ActionBar.Root
        open={open}
        onOpenChange={(next) => setOpen(next)}
      >
        <ActionBar.Content>
          <ActionBar.SelectionTrigger>2 selected</ActionBar.SelectionTrigger>
          <ActionBar.Separator />
          <Button
            variant="outline"
            size="sm"
          >
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            Move
          </Button>
          <ActionBar.CloseTrigger />
        </ActionBar.Content>
      </ActionBar.Root>
    </>
  );
}

export const Default = meta.story({
  render: () => <ControlledActionBarStory />,
});

const TASKS = [
  { id: "copy", label: "Update onboarding copy" },
  { id: "login", label: "Fix login redirect" },
  { id: "release", label: "Release 2.4" },
  { id: "beta", label: "Beta launch" },
];

function InlineActionBarStory() {
  const [selected, setSelected] = useState<string[]>(["copy", "release"]);
  const mergeable = !selected.some((id) => id === "release" || id === "beta");
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  return (
    <ResizableFrame w="2xl">
      <Box position="relative">
        <HStack
          h="11"
          px="4"
          gap="4"
          borderBottomWidth="1px"
          borderColor="border"
        >
          <Text
            fontWeight="semibold"
            flex="1"
          >
            Sprint 14
          </Text>
          <Text
            color="fg.muted"
            textStyle="sm"
          >
            Design team
          </Text>
        </HStack>
        <ActionBar.Root
          placement="inline"
          open={selected.length > 0}
          onOpenChange={(open) => {
            if (!open) setSelected([]);
          }}
        >
          <ActionBar.Content aria-label="Selected tasks">
            <ActionBar.Lead>
              {selected.length} {selected.length === 1 ? "task" : "tasks"}
              <ActionBar.Scope>Design team</ActionBar.Scope>
            </ActionBar.Lead>
            <Toolbar.Root
              aria-label="Task actions"
              collapseBelow={360}
              flex="1"
            >
              <Toolbar.Button
                variant="plain"
                size="sm"
                icon={<LayersIcon />}
                label="Merge"
                disabled={!mergeable}
                focusableWhenDisabled
                tooltip={mergeable ? undefined : "Milestones can't be merged"}
              />
              <Toolbar.Button
                variant="plain"
                size="sm"
                icon={<ListPlusIcon />}
                label="Add to list"
                disabled={!mergeable}
                focusableWhenDisabled
                tooltip={mergeable ? undefined : "Milestones can't be added to a list"}
              />
              <Toolbar.Button
                variant="plain"
                size="sm"
                icon={<EyeOffIcon />}
                label="Hide"
              />
              <Toolbar.Button
                variant="plain"
                size="sm"
                colorPalette="danger"
                icon={<Trash2Icon />}
                label="Delete"
              />
              <Menu.Root>
                <Menu.Trigger
                  tooltip="More"
                  render={
                    <IconButton
                      variant="plain"
                      size="sm"
                      aria-label="More"
                      icon={<MoreHorizontalIcon />}
                    />
                  }
                />
                <Menu.Content>
                  <Menu.Item value="copy">Copy to another project</Menu.Item>
                  <Menu.Item value="board">Start a board from these</Menu.Item>
                </Menu.Content>
              </Menu.Root>
            </Toolbar.Root>
            <ActionBar.CloseTrigger aria-label="Clear selection" />
          </ActionBar.Content>
        </ActionBar.Root>
      </Box>
      <Stack
        gap="0"
        py="1"
      >
        {TASKS.map((task) => (
          <Checkbox
            key={task.id}
            px="4"
            py="2"
            checked={selected.includes(task.id)}
            onCheckedChange={() => toggle(task.id)}
          >
            {task.label}
          </Checkbox>
        ))}
      </Stack>
    </ResizableFrame>
  );
}

export const Inline = meta.story({
  render: () => <InlineActionBarStory />,
});
