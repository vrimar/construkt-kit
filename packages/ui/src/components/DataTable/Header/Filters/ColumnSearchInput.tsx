import { useState } from "react";
import { useDebounce } from "react-use";

import { SearchInput } from "../../../Input";

const DEBOUNCE_DELAY_MS = 500;

interface ColumnSearchInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColumnSearchInput = ({ name, value, onChange }: ColumnSearchInputProps) => {
  const [tempValue, setTempValue] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setTempValue(value);
  }

  useDebounce(
    () => {
      if (tempValue !== value) onChange(tempValue);
    },
    DEBOUNCE_DELAY_MS,
    [tempValue, value],
  );

  const handleClear = () => onChange("");

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
