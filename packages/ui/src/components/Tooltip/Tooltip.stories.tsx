import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleHelpIcon, XIcon } from "lucide-react";

import { Tooltip } from ".";
import { Button, IconButton } from "../Buttons";
import { VStack, Wrap } from "../Layout";
import { Span } from "../Span";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    label: "This is a tooltip",
    children: <Button>Hover me</Button>,
  },
};

export const WithArrow: Story = {
  args: {
    label: "Tooltip with arrow",
    showArrow: true,
    children: <Button variant="outline">With Arrow</Button>,
  },
};

export const Placements: Story = {
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
};

export const ShowWhenTruncated: Story = {
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
};

export const WithShortcut: Story = {
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
};
