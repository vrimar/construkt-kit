import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { HotkeyInput } from ".";
import { formatShortcut } from "../../foundations/shortcuts";
import { useHotkeys } from "../../hooks";
import { Kbd } from "../Kbd";
import { Box, HStack, Stack } from "../Layout";
import { Text } from "../Text";

const meta: Meta<typeof HotkeyInput> = {
  title: "Components/HotkeyInput",
  component: HotkeyInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HotkeyInput>;

const SHORTCUTS = [
  { id: "palette", label: "Search or run a command", defaultValue: "Mod+K" },
  { id: "ask", label: "Ask the assistant", defaultValue: "Mod+J" },
  { id: "undo", label: "Undo", defaultValue: "Mod+Z" },
];

const KEPT: Record<string, string> = { "Mod+C": "copy", "Mod+V": "paste", "Mod+X": "cut" };

const ShortcutSettings = () => {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(SHORTCUTS.map((item) => [item.id, item.defaultValue])),
  );
  const [ran, setRan] = useState<string | null>(null);

  useHotkeys(Object.values(values), (_, shortcut) =>
    setRan(SHORTCUTS.find((item) => values[item.id] === shortcut)?.label ?? null),
  );

  const clash = (id: string) => (shortcut: string) => {
    if (!shortcut.startsWith("Mod+")) return `Hold ${formatShortcut("Mod")} and press a key`;
    if (KEPT[shortcut]) return `${formatShortcut(shortcut)} stays as ${KEPT[shortcut]}`;
    const other = SHORTCUTS.find((item) => item.id !== id && values[item.id] === shortcut);
    return other ? `${formatShortcut(shortcut)} is already ${other.label}` : null;
  };

  return (
    <Stack
      gap="0"
      maxW="480px"
    >
      {SHORTCUTS.map((item) => (
        <HStack
          key={item.id}
          justifyContent="space-between"
          alignItems="flex-start"
          py="2"
          borderBottomWidth="1px"
          borderColor="border.muted"
        >
          <Text
            id={`${item.id}-label`}
            textStyle="sm"
            pt="0.5"
          >
            {item.label}
          </Text>
          <HotkeyInput
            aria-labelledby={`${item.id}-label`}
            value={values[item.id]}
            validate={clash(item.id)}
            onValueChange={(value) => setValues((prev) => ({ ...prev, [item.id]: value }))}
          />
        </HStack>
      ))}
      <Box
        pt="4"
        textStyle="sm"
        color="fg.muted"
      >
        {ran ? `Ran: ${ran}` : "Press a shortcut to run it."}
      </Box>
    </Stack>
  );
};

export const Default: Story = {
  render: () => <ShortcutSettings />,
};

const EmptyDemo = () => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <HotkeyInput
      aria-label="Toggle sidebar"
      value={value}
      onValueChange={setValue}
    />
  );
};

export const Empty: Story = {
  render: () => <EmptyDemo />,
};

export const Formatting: Story = {
  render: () => (
    <Stack gap="2">
      {["Mod+K", "Mod+Shift+P", "Alt+ArrowUp", "Escape", "Shift+?"].map((shortcut) => (
        <HStack
          key={shortcut}
          gap="4"
        >
          <Text
            textStyle="sm"
            fontFamily="mono"
            w="32"
          >
            {shortcut}
          </Text>
          <Kbd>{formatShortcut(shortcut, { mac: true })}</Kbd>
          <Kbd>{formatShortcut(shortcut, { mac: false })}</Kbd>
        </HStack>
      ))}
    </Stack>
  ),
};
