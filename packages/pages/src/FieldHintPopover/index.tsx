import { Popover, type PopoverRootProps } from "@construkt-kit/ui";
import type { ReactElement, ReactNode } from "react";

const besideFieldPlacement = [
  "right",
  "top",
  "bottom",
] as const satisfies PopoverRootProps["placement"];

export interface FieldHintPopoverProps {
  open: boolean;
  hint: ReactNode;
  children: ReactElement;
}

export function FieldHintPopover({ open, hint, children }: FieldHintPopoverProps) {
  return (
    <Popover.Root
      autoFocus={false}
      open={open}
      placement={besideFieldPlacement}
    >
      <Popover.Anchor>{children}</Popover.Anchor>
      <Popover.Content p="4">{hint}</Popover.Content>
    </Popover.Root>
  );
}
