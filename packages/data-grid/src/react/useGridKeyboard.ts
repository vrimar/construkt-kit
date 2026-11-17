import { useHotkeyHandler } from "@construkt-kit/ui";
import { type KeyboardEvent, type RefObject, useLayoutEffect, useMemo, useRef } from "react";

import {
  SELECTING_COMMANDS,
  SELECTION_COMMANDS,
  commandsFor,
  resolveKeymap,
} from "../core/commands/keymap";
import type { CellRange, EntitySelection } from "../core/selection/types";
import { cellAt, tabStopsIn } from "./dom";
import type { DataGridLabels, DataGridOwnProps } from "./types";
import type { AnyGridCore } from "./useGridCore";

interface GridKeyboardOptions extends Pick<
  DataGridOwnProps<unknown>,
  "keymap" | "keyboardSelection"
> {
  startGuard: RefObject<HTMLElement | null>;
  endGuard: RefObject<HTMLElement | null>;
  runNamed: (name: string) => boolean;
  focusActiveCell: () => void;
  announce: (message: string) => void;
  labels: Readonly<RefObject<DataGridLabels>>;
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
    runNamed,
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
  const onCellKeyDown = useHotkeyHandler<HTMLDivElement>(
    shortcuts,
    (event, shortcut) => {
      const cell = cellAt(event.target);
      if (!cell) return;
      const bound = commandsFor(keymap, shortcut);
      const names = keyboardSelection
        ? bound
        : bound.filter((name) => !SELECTING_COMMANDS.has(name));
      const before = { selection: core.selection.selection, ranges: core.selection.ranges };
      if (names.some((name) => runNamed(name))) {
        event.preventDefault();
        if (names.some((name) => SELECTION_COMMANDS.has(name))) selectionBefore.current = before;
      } else if (names.length < bound.length) {
        event.preventDefault();
      } else if (event.key === "Tab") {
        passOut(event.shiftKey ? startGuard.current : endGuard.current);
      } else if (event.key === " ") {
        event.preventDefault();
      }
    },
    { preventDefault: false },
  );

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
      const [first] = enters ? tabStopsIn(cell.element) : [];
      if (!first) return false;
      event.preventDefault();
      first.focus();
      return true;
    }
    if (plain && event.key === "Escape") {
      event.preventDefault();
      cell.element.focus({ preventScroll: true });
    } else if (plain && event.key === "Tab") {
      const stops = tabStopsIn(cell.element);
      const index = stops.indexOf(event.target as HTMLElement);
      event.preventDefault();
      stops[(index + (event.shiftKey ? -1 : 1) + stops.length) % stops.length]?.focus();
    }
    return true;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onWidgetKeyDown(event)) onCellKeyDown(event);
  };

  const onGuardFocus = () => {
    if (passingOut.current) return;
    const active = core.activePosition();
    if (!active) return;
    core.scrollToCell(active);
    focusActiveCell();
  };

  return { onKeyDown, onGuardFocus };
}
