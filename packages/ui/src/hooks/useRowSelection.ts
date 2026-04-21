import * as React from "react";

export interface UseRowSelectionOptions<T> {
  rows: readonly T[];
  getId: (row: T) => number | string;
}

export const useRowSelection = <T>({ rows, getId }: UseRowSelectionOptions<T>) => {
  type Id = ReturnType<typeof getId>;

  const [selected, setSelected] = React.useState<Set<Id>>(() => new Set());

  const pageIds = React.useMemo(() => rows.map(getId), [rows, getId]);

  const isSelected = React.useCallback((id: Id) => selected.has(id), [selected]);

  const toggle = React.useCallback((id: Id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const togglePage = React.useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pageIds.every((id) => next.has(id));

      for (const id of pageIds) {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }

      return next;
    });
  }, [pageIds]);

  const clear = React.useCallback(() => {
    setSelected(new Set());
  }, []);

  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const indeterminate = pageIds.some((id) => selected.has(id)) && !allOnPage;

  return {
    selected,
    selectedItems: React.useMemo(
      () => rows.filter((row) => selected.has(getId(row))),
      [rows, selected, getId],
    ),
    selectedIds: React.useMemo(() => Array.from(selected), [selected]),
    isSelected,
    toggle,
    togglePage,
    clear,
    allOnPage,
    indeterminate,
  };
};
