import preview from "@construkt-kit/story-kit/preview";

import { ThemeToggle } from ".";
import { ColorModeProvider } from "../../color-mode";

const meta = preview.meta({
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
});

export const Light = meta.story({
  globals: { theme: "light" },
  render: (args) => (
    <ColorModeProvider
      defaultMode="light"
      storageKey="construkt-story-theme-toggle-light"
    >
      <ThemeToggle {...args} />
    </ColorModeProvider>
  ),
});

export const Dark = meta.story({
  globals: { theme: "dark" },
  render: (args) => (
    <ColorModeProvider
      defaultMode="dark"
      storageKey="construkt-story-theme-toggle-dark"
    >
      <ThemeToggle {...args} />
    </ColorModeProvider>
  ),
});
