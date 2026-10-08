import { SearchIcon } from "lucide-react";

import { splitCssProps } from "#styled-system/jsx";

import { Input, type InputProps } from "./Input";
import { InputGroup, InputGroupClearButton } from "./InputGroup";

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
  className,
  style,
  ...props
}: SearchInputProps) => {
  const [styleProps, inputProps] = splitCssProps(props);
  const hasValue = String(inputProps.value ?? "") !== "";

  return (
    <InputGroup
      className={className}
      style={style}
      {...styleProps}
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
      size={size}
    >
      <Input
        size={size}
        {...inputProps}
      />
    </InputGroup>
  );
};
