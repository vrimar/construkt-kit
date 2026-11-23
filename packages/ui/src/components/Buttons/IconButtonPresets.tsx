import { PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { type ReactElement, cloneElement } from "react";

import { IconButton, type IconButtonProps } from "./IconButton";

type IconButtonPresetProps = Omit<IconButtonProps, "children">;

export type CloseButtonProps = IconButtonPresetProps;
export type DeleteButtonProps = IconButtonPresetProps;
export type EditButtonProps = IconButtonPresetProps;

// A preset is a JSX literal, not a props object, so Panda extracts its style props.
function createIconButtonPreset(preset: ReactElement<IconButtonProps>) {
  return function IconButtonPreset(props: IconButtonPresetProps) {
    return cloneElement(preset, props);
  };
}

export const CloseButton = createIconButtonPreset(
  <IconButton
    aria-label="Close"
    variant="plain"
    colorPalette="neutral"
  >
    <XIcon />
  </IconButton>,
);

export const DeleteButton = createIconButtonPreset(
  <IconButton
    aria-label="Delete"
    variant="plain"
    size="xs"
    color="fg.error"
  >
    <Trash2Icon />
  </IconButton>,
);

export const EditButton = createIconButtonPreset(
  <IconButton
    aria-label="Edit"
    variant="plain"
    size="xs"
  >
    <PencilIcon />
  </IconButton>,
);
