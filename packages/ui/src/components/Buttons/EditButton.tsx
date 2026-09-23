import { PencilIcon } from "lucide-react";

import type { WithRef } from "../../types";
import type { IconButtonProps } from "./IconButton";
import { IconButton } from "./IconButton";

export type EditButtonProps = Omit<IconButtonProps, "children">;

export const EditButton = ({ ref, ...props }: WithRef<EditButtonProps, HTMLButtonElement>) => {
  return (
    <IconButton
      ref={ref}
      aria-label="Edit"
      variant="plain"
      size="xs"
      {...props}
    >
      <PencilIcon />
    </IconButton>
  );
};
