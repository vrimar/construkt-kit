import { SearchIcon } from "lucide-react";

import { Input, type InputProps } from "./Input";
import { InputGroup, InputGroupClearButton } from "./InputGroup";

export interface SearchInputProps extends InputProps {
  onClear?: () => unknown;
  hasIcon?: boolean;
}

export const SearchInput = ({
  hasIcon = true,
  onClear,
  size = "md",
  ...props
}: SearchInputProps) => {
  return (
    <InputGroup
      startElement={hasIcon && <SearchIcon />}
      endElement={
        props.value &&
        onClear && (
          <InputGroupClearButton
            size={size}
            aria-label="Clear search"
            onClick={onClear}
          />
        )
      }
      size={size}
    >
      <Input
        size={size}
        {...props}
      />
    </InputGroup>
  );
};
