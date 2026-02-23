import React from "react";
import { FiEdit3 } from "react-icons/fi";

import type { IconButtonProps } from "./IconButton";
import { IconButton } from "./IconButton";

export function EditButton({ ref, ...props }: Omit<IconButtonProps, "icon"> & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <IconButton
      ref={ref}
      variant="ghost"
      size="xs"
      {...props}
      icon={<FiEdit3 />}
    />
  );
}
