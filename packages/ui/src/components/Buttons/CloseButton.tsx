import { XIcon } from "lucide-react";

import type { WithRef } from "../../types";
import { IconButton, type IconButtonProps } from "./IconButton";

export type CloseButtonProps = IconButtonProps;

export const CloseButton = ({ ref, ...props }: WithRef<CloseButtonProps, HTMLButtonElement>) => {
  return (
    <IconButton
      variant="plain"
      colorPalette="neutral"
      aria-label="Close"
      ref={ref}
      {...props}
    >
      {props.children ?? <XIcon />}
    </IconButton>
  );
};
