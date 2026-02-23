import { Input, type InputProps } from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";

import { IconButton } from "../Buttons";
import { InputGroup } from "./InputGroup";

export interface SearchInputProps extends InputProps {
  onClear?: () => unknown;
  hasSearchIcon?: boolean;
}

export const SearchInput = ({ hasSearchIcon = true, onClear, ...props }: SearchInputProps) => {
  return (
    <InputGroup
      startElement={hasSearchIcon && <FiSearch />}
      endElement={
        props.value && (
          <IconButton
            icon={<FiX />}
            variant="ghost"
            size="xs"
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
