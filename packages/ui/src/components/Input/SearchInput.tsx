import { SearchIcon, XIcon } from "lucide-react";
import { Input, type InputProps } from "./Input";

import { IconButton } from "../Buttons";
import { InputGroup } from "./InputGroup";

export interface SearchInputProps extends InputProps {
  onClear?: () => unknown;
  hasSearchIcon?: boolean;
}

type Size = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const iconButtonSizeMap: Record<Size, Size> = {
  "2xs": "2xs",
  xs: "xs",
  sm: "xs",
  md: "xs",
  lg: "sm",
  xl: "sm",
  "2xl": "sm",
};

export const SearchInput = ({
  hasSearchIcon = true,
  onClear,
  size,
  ...props
}: SearchInputProps) => {
  const iconButtonSize = iconButtonSizeMap[(size as Size) ?? "md"] ?? "xs";
  return (
    <InputGroup
      startElement={hasSearchIcon && <SearchIcon size="14" />}
      endElement={
        props.value && (
          <IconButton
            variant="plain"
            size={iconButtonSize}
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
