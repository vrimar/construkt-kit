import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfoIcon, PencilIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { Button, ButtonGroup } from "./Button";
import { CloseButton } from "./CloseButton";
import { DeleteButton } from "./DeleteButton";
import { EditButton } from "./EditButton";
import { IconButton } from "./IconButton";
import { SelectButton } from "./SelectButton";
import { TooltipIconButton } from "./TooltipIconButton";

const meta: Meta = {
  title: "Components/Buttons/IconButton",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
    </div>
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

export const SelectButtonStory: Story = {
  name: "SelectButton",
  render: () => (
    <div style={{ display: "flex", gap: "8px", flexDirection: "column", maxWidth: 300 }}>
      <SelectButton
        label="Select an option"
        hasValue={false}
      />
      <SelectButton
        label="Selected value"
        hasValue
        onClear={() => {}}
      />
    </div>
  ),
};

export const ButtonGroupStory: Story = {
  name: "ButtonGroup",
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
};
