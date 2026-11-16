import preview from "@construkt-kit/story-kit/preview";
import { CircleHelpIcon, XIcon } from "lucide-react";

import { Tooltip } from ".";
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
  render: () => (
    <Wrap p="16">
      <Tooltip
        label="Keyboard shortcuts"
        shortcut="?"
        showArrow
        defaultOpen
      >
        <IconButton
          variant="outline"
          aria-label="Keyboard shortcuts"
        >
          <CircleHelpIcon />
        </IconButton>
      </Tooltip>
    </Wrap>
  ),
});
