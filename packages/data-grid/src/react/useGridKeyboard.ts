import { getTabbables, isComposingEvent, matchesShortcut, useLatestRef } from "@construkt-kit/ui";
import {
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  SELECTING_COMMANDS,
  SELECTION_COMMANDS,
  commandsFor,
  resolveKeymap,
} from "../core/commands/keymap";
import type { DragSource } from "../core/dnd/types";
import type { CellRange, EntitySelection } from "../core/selection/types";
import { cellAt } from "./dom";
import { ariaRows } from "./geometry";
import type { DataGridLabels, DataGridOwnProps } from "./types";
import type { AnyGridCore } from "./useGridCore";

interface Announcing {
  announce: (message: string) => void;
  labels: Readonly<RefObject<DataGridLabels>>;
}

interface GridKeyboardOptions
  extends Pick<DataGridOwnProps<unknown>, "keymap" | "keyboardSelection">, Announcing {
  startGuard: RefObject<HTMLElement | null>;
  endGuard: RefObject<HTMLElement | null>;
  focusActiveCell: () => void;
}

interface SelectionBefore {
  selection: EntitySelection | null;
  ranges: readonly CellRange[];
}

export function useGridKeyboard(
  core: AnyGridCore,
  {
    keymap: overrides,
    keyboardSelection = true,
    startGuard,
    endGuard,
    focusActiveCell,
    announce,
    labels,
  }: GridKeyboardOptions,
) {
  const passingOut = useRef(false);
  const selectionBefore = useRef<SelectionBefore | null>(null);

  // The keydown's default Tab action then moves on from the guard, out of the grid.
  const passOut = (guard: HTMLElement | null) => {
    passingOut.current = true;
    guard?.focus({ preventScroll: true });
    passingOut.current = false;
  };

  const keymap = useMemo(() => resolveKeymap(overrides), [overrides]);
  const shortcuts = useMemo(() => [...keymap.keys()], [keymap]);

  const runKeymap = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || isComposingEvent(event)) return;
    const shortcut = shortcuts.find((item) => matchesShortcut(event.nativeEvent, item));
    const bound = shortcut === undefined ? [] : commandsFor(keymap, shortcut);
    const names = keyboardSelection ? bound : bound.filter((name) => !SELECTING_COMMANDS.has(name));
    const before = { selection: core.selection.selection, ranges: core.selection.ranges };
    if (names.some((name) => core.runCommand(name))) {
      event.preventDefault();
      if (names.some((name) => SELECTION_COMMANDS.has(name))) selectionBefore.current = before;
    } else if (names.length < bound.length) {
      event.preventDefault();
    } else if (event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey) {
      passOut(event.shiftKey ? startGuard.current : endGuard.current);
    } else if (bound.length > 0 && event.key === " ") {
      event.preventDefault();
    }
  };

  useLayoutEffect(() => {
    const before = selectionBefore.current;
    if (!before) return;
    selectionBefore.current = null;
    const { selection, ranges } = core.selection;
    const { current } = labels;
    if (selection !== before.selection) {
      announce(current.selected(selection?.ids.length ?? 0, selection?.kind ?? "cells"));
    } else if (ranges !== before.ranges) {
      announce(current.selected(core.selection.stats()?.cellCount ?? 0, "cells"));
    }
  });

  const onWidgetKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const cell = cellAt(event.target);
    if (!cell) return false;
    const plain = !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey;
    if (event.target === cell.element) {
      if (event.key === "F2" && core.editing.canEditCell(cell)) return false;
      const enters = plain && (event.key === "Enter" || event.key === "F2");
      const [first] = enters ? getTabbables(cell.element) : [];
      if (!first) return false;
      event.preventDefault();
      first.focus();
      return true;
    }
    if (plain && event.key === "Escape") {
      event.preventDefault();
      cell.element.focus({ preventScroll: true });
    } else if (plain && event.key === "Tab") {
      const stops = getTabbables(cell.element);
      const index = stops.indexOf(event.target as HTMLElement);
      event.preventDefault();
      stops[(index + (event.shiftKey ? -1 : 1) + stops.length) % stops.length]?.focus();
    }
    return true;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onWidgetKeyDown(event) && cellAt(event.target)) runKeymap(event);
  };

  const onGuardFocus = () => {
    if (passingOut.current) return;
    const active = core.activePosition();
    if (!active) return;
    core.scrollToCell(active);
    focusActiveCell();
  };

  return { onKeyDown, onEditorTab: runKeymap, onGuardFocus };
}

interface MoveAnnouncerOptions<TRow>
  extends Pick<DataGridOwnProps<TRow>, "rows" | "columnDefs">, Announcing {}

interface PendingMove {
  source: DragSource;
  from: number;
  input: unknown;
}

function movedIndex(core: AnyGridCore, source: DragSource): number {
  const [id] = source.ids;
  if (source.kind === "rows") return core.rowModel.indexOf(id);
  return core.columns.headerCell(String(id))?.first ?? -1;
}

export function useMoveAnnouncer<TRow>(
  core: AnyGridCore,
  { rows, columnDefs, announce, labels }: MoveAnnouncerOptions<TRow>,
): (source: DragSource) => void {
  const pendingMove = useRef<PendingMove | null>(null);
  const latest = useLatestRef({ rows, columnDefs });

  useLayoutEffect(() => {
    const move = pendingMove.current;
    if (!move || move.input === (move.source.kind === "rows" ? rows : columnDefs)) return;
    pendingMove.current = null;
    const index = movedIndex(core, move.source);
    if (index < 0 || index === move.from) return;
    const aria = ariaRows(core);
    announce(
      move.source.kind === "rows"
        ? labels.current.rowMoved(aria.body + index, aria.count)
        : labels.current.columnMoved(index + 1, core.columns.leaves.length),
    );
    const active = core.activePosition();
    if (active) core.scrollToCell(active);
  });

  return useCallback(
    (source: DragSource) => {
      pendingMove.current = {
        source,
        from: movedIndex(core, source),
        input: source.kind === "rows" ? latest.current.rows : latest.current.columnDefs,
      };
    },
    [core, latest],
  );
}
