import { useEffect } from "react";

import { useControlledMirror } from "../../../../hooks/useControlledMirror";
import { useDebounceQuery } from "../../../../hooks/useDebounceQuery";
import { useLatestRef } from "../../../../hooks/useLatestRef";
import { SearchInput } from "../../../Input";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";
import { FILTER_DEBOUNCE_MS } from "./constants";

export const ColumnSearchInput = ({ placeholder, value, onChange, layout }: ColumnFilterProps) => {
  const { labels } = useDataTableContext();
  const current = value[0] ?? "";
  const { query, debouncedQuery, setQuery } = useDebounceQuery(current, FILTER_DEBOUNCE_MS);
  const emit = useControlledMirror({
    value: current,
    onValueChange: (next: string) => onChange(next ? [next] : undefined),
    onExternalChange: setQuery,
  });
  const emitRef = useLatestRef(emit);

  useEffect(() => {
    if (debouncedQuery === query && query !== current) emitRef.current(query);
  }, [current, debouncedQuery, emitRef, query]);

  return (
    <SearchInput
      size={layout === "field" ? "md" : "sm"}
      autoComplete="off"
      onClear={() => setQuery("")}
      onChange={(e) => setQuery(e.target.value)}
      onBlur={() => {
        if (query !== current) emit(query);
      }}
      placeholder={placeholder}
      clearLabel={labels.clearSearch}
      hasIcon={layout === "field"}
      value={query}
      variant={layout === "field" ? "outline" : "plain"}
    />
  );
};
