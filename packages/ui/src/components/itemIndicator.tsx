import type { HTMLStyledProps } from "@construkt-kit/styled-system/jsx";
import { CheckIcon } from "lucide-react";
import type { ElementType } from "react";

import type { WithRef } from "../types";

/** Check mark for a selected item; unselected items keep an empty icon box so labels stay aligned. */
export function createItemIndicator(
  StyledItemIndicator: ElementType,
  useIsSelected: () => boolean,
) {
  return function ItemIndicator({ ref, ...props }: WithRef<HTMLStyledProps<"div">>) {
    const selected = useIsSelected();

    if (!selected) {
      return (
        <svg
          aria-hidden="true"
          focusable="false"
        />
      );
    }

    return (
      <StyledItemIndicator
        ref={ref}
        {...props}
      >
        <CheckIcon />
      </StyledItemIndicator>
    );
  };
}
