import { Input, type InputProps } from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";

import { IconButton } from "../Buttons";
import { InputGroup } from "./InputGroup";

export interface SearchInputProps extends InputProps {
  onClear?: () => unknown;
  hasSearchIcon?: boolean;
}

type InputSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type ButtonSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const iconButtonSizeMap: Record<InputSize, ButtonSize> = {
  "2xs": "2xs",
  xs: "xs",
  sm: "xs",
  md: "xs",
  lg: "sm",
  xl: "sm",
  "2xl": "sm",
};

export const SearchInput = ({ hasSearchIcon = true, onClear, ...props }: SearchInputProps) => {
  const iconButtonSize = iconButtonSizeMap[(props.size as InputSize) ?? "md"] ?? "xs";
  return (
    <InputGroup
      startElement={hasSearchIcon && <FiSearch />}
      endElement={
        props.value && (
          <IconButton
            icon={<FiX />}
            variant="ghost"
            size={iconButtonSize}
            onClick={onClear}
          />
        )
      }
      width="100%"
    >
      <Input {...props} />
    </InputGroup>
  );
};
