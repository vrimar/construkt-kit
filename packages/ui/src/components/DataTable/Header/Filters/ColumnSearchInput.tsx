import { useState } from "react";
import { useDebounce } from "react-use";

import { useControlledMirror } from "../../../../hooks/useControlledMirror";
import { SearchInput } from "../../../Input";
import { FILTER_DEBOUNCE_MS } from "./constants";

interface ColumnSearchInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColumnSearchInput = ({ name, value, onChange }: ColumnSearchInputProps) => {
  const [tempValue, setTempValue] = useState(value);
  const emit = useControlledMirror({
    value,
    onValueChange: onChange,
    onExternalChange: setTempValue,
  });

  useDebounce(
    () => {
      if (tempValue !== value) emit(tempValue);
    },
    FILTER_DEBOUNCE_MS,
    [tempValue],
  );

  const handleClear = () => {
    setTempValue("");
    emit("");
  };

  return (
    <SearchInput
      size="sm"
      autoComplete="off"
      onClear={handleClear}
      onChange={(e) => setTempValue(e.target.value)}
      placeholder={`Search by ${name}`}
      _placeholder={{
        color: "fg.subtle",
      }}
      fontWeight="normal"
      hasIcon={false}
      value={tempValue}
      variant="plain"
    />
  );
};
