import { useEffect, useState } from "react";

import { useControlledMirror } from "../../../../hooks/useControlledMirror";
import { useDebounceQuery } from "../../../../hooks/useDebounceQuery";
import { useLatestRef } from "../../../../hooks/useLatestRef";
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
  const { query, debouncedQuery, setQuery } = useDebounceQuery(current, debounceMs);
  const [applied, setApplied] = useState(current);
  const emit = useControlledMirror({
    value: current,
    onValueChange: (next: string) => onChange(next ? [next] : undefined),
    onExternalChange: (next: string) => {
      setApplied(next);
      setQuery(next);
    },
  });

  const apply = () => {
    if (query === applied) return;
    setApplied(query);
    emit(query);
  };
  const applyRef = useLatestRef(apply);

  useEffect(() => {
    if (debouncedQuery === query) applyRef.current();
  }, [applyRef, debouncedQuery, query]);

  return (
    <SearchInput
      size={layout === "field" ? "md" : "sm"}
      autoComplete="off"
      onClear={() => setQuery("")}
      onChange={(e) => setQuery(e.target.value)}
      onBlur={apply}
      placeholder={placeholder}
      clearLabel={labels.clearSearch}
      hasIcon={layout === "field"}
      value={query}
      variant={layout === "field" ? "outline" : "plain"}
    />
  );
};
