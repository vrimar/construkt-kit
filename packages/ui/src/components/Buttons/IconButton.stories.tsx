import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfoIcon, PencilIcon, SearchIcon, SettingsIcon } from "lucide-react";

import { CloseButton, DeleteButton, EditButton, IconButton, TooltipIconButton } from ".";
import { HStack } from "../Layout";

const meta: Meta<typeof IconButton> = {
  title: "Components/Buttons/IconButton",
  component: IconButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  render: () => (
    <HStack gap="2">
      <IconButton aria-label="Search">
        <SearchIcon />
      </IconButton>
      <IconButton
        variant="outline"
        aria-label="Settings"
      >
        <SettingsIcon />
      </IconButton>
      <IconButton
        variant="subtle"
        aria-label="Info"
      >
        <InfoIcon />
      </IconButton>
    </HStack>
  ),
};

export const IconButtonSizes: Story = {
  name: "IconButton Sizes",
  render: () => (
    <HStack gap="2">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <IconButton
          key={size}
          size={size}
          aria-label={`Search ${size}`}
        >
          <SearchIcon />
        </IconButton>
      ))}
    </HStack>
  ),
};

export const TooltipIconButtonStory: Story = {
  name: "TooltipIconButton",
  render: () => (
    <TooltipIconButton label="Edit item">
      <PencilIcon />
    </TooltipIconButton>
  ),
};

export const DeleteButtonStory: Story = {
  name: "DeleteButton",
  render: () => <DeleteButton />,
};

export const EditButtonStory: Story = {
  name: "EditButton",
  render: () => <EditButton />,
};

export const CloseButtonStory: Story = {
  name: "CloseButton",
  render: () => <CloseButton />,
};
