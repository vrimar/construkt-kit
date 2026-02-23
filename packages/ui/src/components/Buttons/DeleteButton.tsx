import React from "react";
import { FiTrash2 } from "react-icons/fi";

import type { IconButtonProps } from "./IconButton";
import { IconButton } from "./IconButton";

export function DeleteButton({ ref, ...props }: Omit<IconButtonProps, "icon"> & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <IconButton
      ref={ref}
      variant="ghost"
      size="xs"
      color="red.500"
      {...props}
      icon={<FiTrash2 />}
    />
  );
}
