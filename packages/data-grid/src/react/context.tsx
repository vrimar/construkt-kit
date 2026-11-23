import { type KeyboardEvent, type ReactNode, createContext, useContext } from "react";

import type { AnyGridCore } from "./useGridCore";

type EditorTab = (event: KeyboardEvent<HTMLElement>) => void;

const GridCoreContext = createContext<AnyGridCore | null>(null);

const RowStateVersionContext = createContext(0);

const EditorTabContext = createContext<EditorTab>(() => {});

export function GridContexts({
  core,
  onEditorTab,
  children,
}: {
  core: AnyGridCore;
  onEditorTab: EditorTab;
  children: ReactNode;
}) {
  return (
    <GridCoreContext value={core}>
      <RowStateVersionContext value={core.selection.rowStateVersion}>
        <EditorTabContext value={onEditorTab}>{children}</EditorTabContext>
      </RowStateVersionContext>
    </GridCoreContext>
  );
}

export function useRowStateCore(): AnyGridCore {
  // Re-renders past memoized cells and headers when row selection state changes.
  useContext(RowStateVersionContext);
  const core = useContext(GridCoreContext);
  if (!core) throw new Error("DataGrid: this component renders only inside a DataGrid");
  return core;
}

export const useEditorTab = (): EditorTab => useContext(EditorTabContext);
