import { PencilIcon } from "lucide-react";

import type { WithRef } from "../../types";
import type { IconButtonProps } from "./IconButton";
import { IconButton } from "./IconButton";

export const EditButton = ({
  ref,
  ...props
}: WithRef<Omit<IconButtonProps, "children">, HTMLButtonElement>) => {
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
