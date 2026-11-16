import { SearchIcon } from "lucide-react";

import type { InputProps } from "./Input";
import { InputGroupClearButton } from "./InputGroup";
import { InputGroupField } from "./InputGroupField";

export interface SearchInputProps extends InputProps {
  onClear?: () => unknown;
  /** Accessible name for the clear button. */
  clearLabel?: string;
  hasIcon?: boolean;
}

export const SearchInput = ({
  hasIcon = true,
  onClear,
  clearLabel = "Clear search",
  size = "md",
  ...props
}: SearchInputProps) => {
  const hasValue = String(props.value ?? "") !== "";

  return (
    <InputGroupField
      size={size}
      {...props}
      startElement={hasIcon && <SearchIcon />}
      endElement={
        hasValue &&
        onClear && (
          <InputGroupClearButton
            size={size}
            aria-label={clearLabel}
            onClick={onClear}
          />
        )
      }
    />
  );
};
