import {
  EXTEND_COMMANDS,
  type ExtendCommand,
  type NavigationCommand,
} from "../selection/navigation";

export type BuiltInCommand =
  | NavigationCommand
  | ExtendCommand
  | "toggleRow"
  | "selectAll"
  | "selectRow"
  | "selectColumn"
  | "clearSelection"
  | "toggleRowSelected"
  | "openMenu"
  | "openColumnMenu"
  | "moveRowsUp"
  | "moveRowsDown"
  | "moveColumnsLeft"
  | "moveColumnsRight"
  | "editCell";

export const DEFAULT_KEYMAP: Readonly<Record<string, BuiltInCommand>> = {
  ArrowUp: "moveUp",
  ArrowDown: "moveDown",
  ArrowLeft: "moveLeft",
  ArrowRight: "moveRight",
  Home: "moveRowStart",
  End: "moveRowEnd",
  "Mod+ArrowUp": "moveColumnStart",
  "Mod+ArrowDown": "moveColumnEnd",
  "Mod+ArrowLeft": "moveRowStart",
  "Mod+ArrowRight": "moveRowEnd",
  "Mod+Home": "moveGridStart",
  "Mod+End": "moveGridEnd",
  PageUp: "movePageUp",
  PageDown: "movePageDown",
  "Shift+ArrowUp": "extendUp",
  "Shift+ArrowDown": "extendDown",
  "Shift+ArrowLeft": "extendLeft",
  "Shift+ArrowRight": "extendRight",
  "Shift+Home": "extendRowStart",
  "Shift+End": "extendRowEnd",
  "Mod+Shift+ArrowUp": "extendColumnStart",
  "Mod+Shift+ArrowDown": "extendColumnEnd",
  "Mod+Shift+ArrowLeft": "extendRowStart",
  "Mod+Shift+ArrowRight": "extendRowEnd",
  "Mod+Shift+Home": "extendGridStart",
  "Mod+Shift+End": "extendGridEnd",
  "Shift+PageUp": "extendPageUp",
  "Shift+PageDown": "extendPageDown",
  "Mod+A": "selectAll",
  "Shift+Space": "selectRow",
  "Mod+Space": "selectColumn",
  Escape: "clearSelection",
  Space: "toggleRowSelected",
  "Shift+F10": "openMenu",
  ContextMenu: "openMenu",
  "Alt+ArrowDown": "openColumnMenu",
  "Alt+Shift+ArrowUp": "moveRowsUp",
  "Alt+Shift+ArrowDown": "moveRowsDown",
  "Alt+Shift+ArrowLeft": "moveColumnsLeft",
  "Alt+Shift+ArrowRight": "moveColumnsRight",
  F2: "editCell",
  Enter: "toggleRow",
  Tab: "moveNext",
  "Shift+Tab": "movePrevious",
};

export const SELECTING_COMMANDS: ReadonlySet<string> = new Set<BuiltInCommand>([
  ...EXTEND_COMMANDS,
  "selectAll",
  "selectRow",
  "selectColumn",
  "toggleRowSelected",
]);

export const SELECTION_COMMANDS: ReadonlySet<string> = new Set([
  ...SELECTING_COMMANDS,
  "clearSelection",
]);

const DEFAULTS = new Map(
  Object.entries(DEFAULT_KEYMAP).map(([shortcut, command]) => [shortcut.toLowerCase(), command]),
);

export function resolveKeymap(
  overrides: Readonly<Record<string, string | null>> | undefined,
): Map<string, string> {
  const keymap = new Map<string, string>(DEFAULTS);
  for (const [shortcut, command] of Object.entries(overrides ?? {})) {
    if (command === null) keymap.delete(shortcut.toLowerCase());
    else keymap.set(shortcut.toLowerCase(), command);
  }
  return keymap;
}

export function commandsFor(keymap: ReadonlyMap<string, string>, shortcut: string): string[] {
  const bound = keymap.get(shortcut);
  if (bound === undefined) return [];
  const fallback = DEFAULTS.get(shortcut);
  return fallback && fallback !== bound ? [bound, fallback] : [bound];
}
