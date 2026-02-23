import { useState } from "react";
import { useDebounce } from "react-use";

export function useDebounceQuery(initialQuery = "", delay = 500) {
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [immediateQuery, setImmediateQuery] = useState("");

  useDebounce(() => setDebouncedQuery(immediateQuery), delay, [immediateQuery]);

  const handleQueryChange = (value: string) => {
    setImmediateQuery(value);

    if (!value) setDebouncedQuery(value);
  };

  return { query: immediateQuery, debouncedQuery, setQuery: handleQueryChange };
}
