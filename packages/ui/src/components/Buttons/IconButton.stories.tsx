import preview from "@construkt-kit/story-kit/preview";
import { InfoIcon, PencilIcon, SearchIcon, SettingsIcon } from "lucide-react";

import { button } from "#styled-system/recipes";

import { CloseButton, DeleteButton, EditButton, IconButton, TooltipIconButton } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { HStack } from "../Layout";

const meta = preview.meta({
  title: "Components/Buttons/IconButton",
  component: IconButton,
  tags: ["autodocs"],
});

export const Default = meta.story({
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
});

export const IconButtonSizes = meta.story({
  name: "IconButton Sizes",
  render: () => (
    <SizePreviewTable
      sizes={button.variantMap.size}
      renderPreview={(size) => (
        <IconButton
          size={size}
          aria-label={`Search ${size}`}
        >
          <SearchIcon />
        </IconButton>
      )}
    />
  ),
});

export const TooltipIconButtonStory = meta.story({
  name: "TooltipIconButton",
  render: () => (
    <TooltipIconButton label="Edit item">
      <PencilIcon />
    </TooltipIconButton>
  ),
});

export const DeleteButtonStory = meta.story({
  name: "DeleteButton",
  render: () => <DeleteButton />,
});

export const EditButtonStory = meta.story({
  name: "EditButton",
  render: () => <EditButton />,
});

export const CloseButtonStory = meta.story({
  name: "CloseButton",
  render: () => <CloseButton />,
});
