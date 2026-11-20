import preview from "@construkt-kit/story-kit/preview";
import { CircleHelpIcon, Redo2Icon, Undo2Icon, XIcon } from "lucide-react";
import { fn } from "storybook/test";

import { Tooltip, TooltipGroup } from ".";
import { Button, IconButton } from "../Buttons";
import { VStack, Wrap } from "../Layout";
import { Span } from "../Span";

const meta = preview.meta({
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
});

export const Default = meta.story({
  args: {
    label: "This is a tooltip",
    children: <Button>Hover me</Button>,
  },
});

export const WithArrow = meta.story({
  args: {
    label: "Tooltip with arrow",
    showArrow: true,
    children: <Button variant="outline">With Arrow</Button>,
  },
});

export const Placements = meta.story({
  render: () => (
    <Wrap
      gap="4"
      p="16"
    >
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Tooltip
          key={placement}
          label={`${placement} tooltip`}
          placement={placement}
        >
          <Button variant="outline">{placement}</Button>
        </Tooltip>
      ))}
    </Wrap>
  ),
});

export const ShowWhenTruncated = meta.story({
  render: () => (
    <VStack
      alignItems="start"
      gap="3"
      p="16"
    >
      {["Revenue", "Quarterly revenue by region and product line"].map((text) => (
        <Tooltip
          key={text}
          label={text}
          showWhenTruncated
        >
          <Button
            variant="outline"
            maxW="48"
          >
            <Span truncate>{text}</Span>
          </Button>
        </Tooltip>
      ))}
    </VStack>
  ),
});

export const WithShortcut = meta.story({
  render: () => (
    <Wrap
      gap="4"
      p="16"
    >
      <Tooltip
        label="Help"
        shortcut="?"
      >
        <IconButton
          variant="outline"
          aria-label="Help"
        >
          <CircleHelpIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        label="Close"
        shortcut="Esc"
      >
        <IconButton
          variant="outline"
          aria-label="Close"
        >
          <XIcon />
        </IconButton>
      </Tooltip>
    </Wrap>
  ),
});

export const Open = meta.story({
  tags: ["open-state"],
  args: {
    label: "Keyboard shortcuts",
    shortcut: "?",
    showArrow: true,
    open: true,
    onOpenChange: fn(),
    children: (
      <IconButton
        variant="outline"
        aria-label="Keyboard shortcuts"
      >
        <CircleHelpIcon />
      </IconButton>
    ),
  },
  render: (args) => (
    <Wrap p="16">
      <Tooltip {...args} />
    </Wrap>
  ),
});

export const DefaultOpen = meta.story({
  tags: ["open-state"],
  render: () => (
    <Wrap
      gap="2"
      p="16"
    >
      <Tooltip
        label="Undo"
        shortcut="⌘Z"
        defaultOpen
      >
        <IconButton
          variant="outline"
          aria-label="Undo"
        >
          <Undo2Icon />
        </IconButton>
      </Tooltip>
      <Tooltip
        label="Redo"
        shortcut="⇧⌘Z"
      >
        <IconButton
          variant="outline"
          aria-label="Redo"
        >
          <Redo2Icon />
        </IconButton>
      </Tooltip>
    </Wrap>
  ),
});

export const Group = meta.story({
  render: () => (
    <TooltipGroup placement="right">
      <VStack
        alignItems="start"
        gap="1"
        p="16"
        maxW="48"
      >
        {[
          "Revenue",
          "Quarterly revenue by region and product line",
          "Customer satisfaction score by store",
        ].map((text) => (
          <Tooltip
            key={text}
            label={text}
            showWhenTruncated
          >
            <Span
              truncate
              maxW="full"
            >
              {text}
            </Span>
          </Tooltip>
        ))}
      </VStack>
    </TooltipGroup>
  ),
});
