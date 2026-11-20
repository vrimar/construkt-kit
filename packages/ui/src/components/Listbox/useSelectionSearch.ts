import { type ReactNode, useCallback } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import type { SelectionSearchOptions } from "./types";

export const normalizeQuery = (query: string) => query.trim().toLowerCase();

export const matchesQuery = (text: string, normalizedQuery: string) =>
  text.toLowerCase().includes(normalizedQuery);

export interface SelectionSearch {
  showInput: boolean;
  query: string;
  normalizedQuery: string;
  external: boolean;
  filterQuery: string;
  placeholder: string;
  /** Undefined when unset: a Select focuses its search on open unless this is `false`. */
  autoFocus: boolean | undefined;
  endElement?: ReactNode;
  setQuery: (query: string) => void;
  reset: () => void;
}

export function useSelectionSearch<T>(
  search: boolean | SelectionSearchOptions<T> | undefined,
): SelectionSearch {
  const options = typeof search === "object" ? search : search === true ? {} : undefined;
  const defaultQuery = options?.defaultQuery ?? "";
  const [query, setQuery] = useControllableState({
    value: options?.query,
    defaultValue: defaultQuery,
    onChange: options?.onQueryChange,
  });
  const latestRef = useLatestRef({ controlled: options?.query !== undefined, defaultQuery, query });

  const reset = useCallback(() => {
    const latest = latestRef.current;
    if (!latest.controlled && latest.query !== latest.defaultQuery) setQuery(latest.defaultQuery);
  }, [latestRef, setQuery]);

  const normalizedQuery = normalizeQuery(query);
  const external = options?.mode === "external";

  return {
    showInput: options != null && options.showInput !== false,
    query,
    normalizedQuery,
    external,
    filterQuery: external ? "" : normalizedQuery,
    placeholder: options?.placeholder ?? "Search...",
    autoFocus: options?.autoFocus,
    endElement: options?.endElement,
    setQuery,
    reset,
  };
}
