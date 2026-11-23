import type { ReactNode } from "react";

import { HStack } from "#styled-system/jsx";

import { SearchInput, type SearchInputProps } from "../Input";
import type { SelectionSearch } from "./useSelectionSearch";

export interface SelectionSearchFieldProps extends Omit<SearchInputProps, "value" | "onClear"> {
  search: SelectionSearch;
  endElement?: ReactNode;
}

export function SelectionSearchField({
  search,
  endElement = search.endElement,
  placeholder = search.placeholder,
  autoFocus = search.autoFocus,
  onChange,
  size = "sm",
  variant = "outline",
  ...props
}: SelectionSearchFieldProps) {
  return (
    <HStack
      gap="1"
      px="1"
      _first={{ pt: "1" }}
    >
      <SearchInput
        aria-label={placeholder}
        {...props}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={search.query}
        onChange={(event) => {
          search.setQuery(event.target.value);
          onChange?.(event);
        }}
        onClear={() => search.setQuery("")}
        size={size}
        variant={variant}
      />
      {endElement}
    </HStack>
  );
}
