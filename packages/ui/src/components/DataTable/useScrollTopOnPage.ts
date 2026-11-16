import { useEffect, useRef } from "react";

import type { DataTableInstance } from "./types";

export const useScrollTopOnPage = <TData extends object>(table: DataTableInstance<TData>) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const page = table.state.pagination.pageIndex;

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [page]);

  return scrollRef;
};
