import { SearchIcon } from "lucide-react";

import type { InputProps } from "./Input";
import { InputGroupClearButton } from "./InputGroup";
import { InputGroupField } from "./InputGroupField";

interface SearchInputBaseProps extends Omit<InputProps, "value"> {
  /** Accessible name for the clear button. */
  clearLabel?: string;
  hasIcon?: boolean;
}

/** `onClear` needs a controlled `value`: the clear button shows only while it is non-empty. */
export type SearchInputProps = SearchInputBaseProps &
  (
    | { value?: InputProps["value"]; onClear?: never }
    | { value: NonNullable<InputProps["value"]>; onClear?: (() => unknown) | undefined }
  );

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
