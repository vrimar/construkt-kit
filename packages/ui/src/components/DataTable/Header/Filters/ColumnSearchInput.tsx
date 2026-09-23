import { useState } from "react";
import { useDebounce } from "react-use";

import { useControlledMirror } from "../../../../hooks/useControlledMirror";
import { SearchInput } from "../../../Input";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";
import { FILTER_DEBOUNCE_MS } from "./constants";

export const ColumnSearchInput = ({ label, value, onChange }: ColumnFilterProps) => {
  const { labels } = useDataTableContext();
  const current = value[0] ?? "";
  const [tempValue, setTempValue] = useState(current);
  const emit = useControlledMirror({
    value: current,
    onValueChange: (next: string) => onChange(next ? [next] : undefined),
    onExternalChange: setTempValue,
  });

  useDebounce(
    () => {
      if (tempValue !== current) emit(tempValue);
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
      placeholder={`${labels.filterBy} ${label}`}
      hasIcon={false}
      value={tempValue}
      variant="plain"
    />
  );
};
