import { useState } from "react";

import { useControlledMirror } from "../../../../hooks/useControlledMirror";
import { useDebounce } from "../../../../hooks/useDebounce";
import { SearchInput } from "../../../Input";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";

export const ColumnSearchInput = ({
  placeholder,
  value,
  onChange,
  layout,
  debounceMs,
}: ColumnFilterProps) => {
  const { labels } = useDataTableContext();
  const current = value[0] ?? "";
  const [query, setQuery] = useState(current);
  const { applied, emit } = useControlledMirror({
    value: current,
    onValueChange: (next: string) => onChange(next ? [next] : undefined),
    onExternalChange: setQuery,
  });

  const apply = () => {
    if (query !== applied) emit(query);
  };

  useDebounce(apply, debounceMs, [query]);

  const changeQuery = (next: string) => {
    setQuery(next);
    if (next === "" && applied !== "") emit("");
  };

  return (
    <SearchInput
      size={layout === "field" ? "md" : "sm"}
      autoComplete="off"
      onClear={() => changeQuery("")}
      onChange={(e) => changeQuery(e.target.value)}
      onBlur={apply}
      placeholder={placeholder}
      clearLabel={labels.clearSearch}
      hasIcon={layout === "field"}
      value={query}
      variant={layout === "field" ? "outline" : "plain"}
    />
  );
};
