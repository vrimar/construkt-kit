import { SearchIcon, XIcon } from "lucide-react";

import { IconButton } from "../Buttons";
import { Input, type InputProps } from "./Input";
import { InputGroup, type InputGroupSize, inputGroupButtonSize } from "./InputGroup";

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
  const iconButtonSize = inputGroupButtonSize[size as InputGroupSize];
  return (
    <InputGroup
      startElement={hasIcon && <SearchIcon />}
      endElement={
        props.value &&
        onClear && (
          <IconButton
            variant="plain"
            size={iconButtonSize}
            aria-label="Clear search"
            onClick={onClear}
          >
            <XIcon />
          </IconButton>
        )
      }
      width="100%"
      size={size}
    >
      <Input
        size={size}
        {...props}
      />
    </InputGroup>
  );
};
