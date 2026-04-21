import { SearchIcon, XIcon } from "lucide-react";

import type { ButtonProps } from "../Buttons";
import { IconButton } from "../Buttons";
import { Input, type InputProps } from "./Input";
import { InputGroup } from "./InputGroup";

export interface SearchInputProps extends InputProps {
  onClear?: () => unknown;
  hasIcon?: boolean;
}

type InputGroupSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const iconButtonSizeMap: Record<InputGroupSize, ButtonProps["size"]> = {
  "2xs": "2xs",
  xs: "2xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
  "2xl": "xl",
};

export const SearchInput = ({
  hasIcon = true,
  onClear,
  size = "md",
  ...props
}: SearchInputProps) => {
  const iconButtonSize = iconButtonSizeMap[size as InputGroupSize];
  return (
    <InputGroup
      startElement={hasIcon && <SearchIcon />}
      endElement={
        props.value &&
        onClear && (
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
