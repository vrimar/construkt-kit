import preview from "@construkt-kit/story-kit/preview";
import { Trash2Icon } from "lucide-react";
import { fn } from "storybook/test";

import { ConfirmPopover } from ".";
import { Button } from "../Buttons";

const meta = preview.meta({
  title: "Components/Popover/ConfirmPopover",
  tags: ["autodocs"],
});

export const Destructive = meta.story({
  render: () => (
    <ConfirmPopover
      title="Delete Q3 planning?"
      description="2 tasks go back to the backlog. You can undo this."
      confirmLabel="Delete project"
      destructive
      onConfirm={fn()}
    >
      <Button
        variant="outline"
        leftIcon={<Trash2Icon />}
      >
        Delete project
      </Button>
    </ConfirmPopover>
  ),
});

export const NonDestructive = meta.story({
  render: () => (
    <ConfirmPopover
      title="Switch the project to v3?"
      description="Charts refresh with the new data."
      confirmLabel="Switch"
      onConfirm={fn()}
    >
      <Button variant="outline">Switch to v3</Button>
    </ConfirmPopover>
  ),
});

export const Async = meta.story({
  render: () => (
    <ConfirmPopover
      title="Delete Weekly sync?"
      confirmLabel="Delete meeting"
      destructive
      onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
    >
      <Button variant="outline">Delete meeting</Button>
    </ConfirmPopover>
  ),
});

export const Phone = meta.story({
  ...Destructive.input,
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <ConfirmPopover
      defaultOpen
      title="Delete Q3 planning?"
      description="2 tasks go back to the backlog. You can undo this."
      confirmLabel="Delete project"
      destructive
      onConfirm={fn()}
    >
      <Button
        variant="outline"
        leftIcon={<Trash2Icon />}
      >
        Delete project
      </Button>
    </ConfirmPopover>
  ),
});
