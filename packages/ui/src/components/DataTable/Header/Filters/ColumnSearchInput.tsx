import { SearchInput } from "../../../Input";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

interface Props {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColumnSearchInput = ({ name, value, onChange }: Props) => {
  const [tempValue, setTempValue] = useState(value);

  useDebounce(
    () => {
      if (tempValue !== value) onChange(tempValue);
    },
    500,
    [tempValue, value],
  );

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleClear = () => onChange("");

  return (
    <SearchInput
      size="sm"
      onClear={handleClear}
      onChange={(e) => setTempValue(e.target.value)}
      placeholder={`Search by ${name}`}
      _placeholder={{
        color: "fg.subtle",
      }}
      fontWeight="normal"
      hasSearchIcon={false}
      value={tempValue}
      variant="flushed"
    />
  );
};
