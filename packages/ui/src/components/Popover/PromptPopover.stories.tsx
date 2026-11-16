import preview from "@construkt-kit/story-kit/preview";
import { PencilIcon, PlusIcon } from "lucide-react";
import { fn } from "storybook/test";

import { PromptPopover } from ".";
import { Button } from "../Buttons";

const meta = preview.meta({
  title: "Components/Popover/PromptPopover",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <PromptPopover
      title="New folder"
      defaultValue="Untitled folder"
      submitLabel="Create"
      onSubmit={fn()}
    >
      <Button
        variant="outline"
        leftIcon={<PlusIcon />}
      >
        New folder
      </Button>
    </PromptPopover>
  ),
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <PromptPopover
      defaultOpen
      title="Rename board"
      defaultValue="Q3 planning"
      placeholder="Board name"
      submitLabel="Rename"
      onSubmit={fn()}
    >
      <Button
        variant="outline"
        leftIcon={<PencilIcon />}
      >
        Rename
      </Button>
    </PromptPopover>
  ),
});
