type Modifier = "ctrl" | "meta" | "alt" | "shift";

interface ParsedShortcut extends Record<Modifier, boolean> {
  key: string;
}

export interface ShortcutPlatformOptions {
  /** Format and match for macOS / iOS (`Mod` is ⌘) instead of other platforms (`Mod` is Ctrl). Defaults to the current platform. */
  mac?: boolean;
}

const MODIFIER_NAMES: Record<string, Modifier | "mod"> = {
  mod: "mod",
  ctrl: "ctrl",
  control: "ctrl",
  meta: "meta",
  cmd: "meta",
  command: "meta",
  alt: "alt",
  option: "alt",
  shift: "shift",
};

const KEY_ALIASES: Record<string, string> = { esc: "escape", " ": "space" };

const MAC_MODIFIER_LABELS: Record<Modifier | "mod", string> = {
  mod: "⌘",
  meta: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
};

const MODIFIER_LABELS: Record<Modifier | "mod", string> = {
  mod: "Ctrl",
  meta: "Meta",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
};

const KEY_LABELS: Record<string, string> = {
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  escape: "Esc",
  space: "Space",
};

export const MODIFIER_KEYS: ReadonlySet<string> = new Set([
  "Shift",
  "Control",
  "Meta",
  "Alt",
  "AltGraph",
  "CapsLock",
]);

const MAC_PLATFORM = /mac|iphone|ipad|ipod/i;

export const isMacPlatform = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const { userAgentData, platform } = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  return MAC_PLATFORM.test(userAgentData?.platform || platform);
};

const splitShortcut = (shortcut: string) => {
  const parts = shortcut.split(/\+(?!$)/);
  const key = parts.pop() ?? "";
  return [...parts, key.trim() || key];
};

const normalizeKey = (key: string) => {
  const lower = key.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
};

const parseShortcut = (shortcut: string, mac: boolean): ParsedShortcut | null => {
  const parts = splitShortcut(shortcut);
  const key = parts.pop();
  if (!key) return null;
  const parsed: ParsedShortcut = {
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
    key: normalizeKey(key),
  };
  for (const part of parts) {
    const modifier = MODIFIER_NAMES[part.trim().toLowerCase()];
    if (!modifier) return null;
    parsed[modifier === "mod" ? (mac ? "meta" : "ctrl") : modifier] = true;
  }
  return parsed;
};

// Option on a Mac and Shift turn letter and digit keys into other characters; the physical key still names them.
const physicalKey = ({ key, code }: KeyboardEvent): string | undefined =>
  !/^[a-z0-9]$/i.test(key) && /^(Key[A-Z]|Digit[0-9])$/.test(code) ? code.slice(-1) : undefined;

// Windows reports AltGr as Ctrl+Alt; the character it types is the key, not a chord.
const pressedModifiers = (event: KeyboardEvent, mac: boolean) => {
  const altGraph = !mac && event.getModifierState("AltGraph");
  return {
    altGraph,
    ctrl: event.ctrlKey && !altGraph,
    alt: event.altKey && !altGraph,
    meta: event.metaKey,
    shift: event.shiftKey,
  };
};

/**
 * Whether a keyboard event is the shortcut, such as `"Mod+K"`, `"Alt+Shift+ArrowUp"` or `"?"`.
 * Modifiers are `Mod` (⌘ on a Mac, Ctrl elsewhere), `Ctrl`, `Meta`, `Alt` and `Shift`, joined to
 * the key by `+`; the key is a character or a `KeyboardEvent.key` name, matched case-insensitively.
 * Every modifier must match exactly, except that a symbol key such as `?` ignores Shift.
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: string,
  { mac = isMacPlatform() }: ShortcutPlatformOptions = {},
): boolean {
  if (typeof event.key !== "string") return false;
  const parsed = parseShortcut(shortcut, mac);
  if (!parsed) return false;
  const pressed = pressedModifiers(event, mac);
  const symbol = parsed.key.length === 1 && !/[a-z0-9]/.test(parsed.key);
  const keys = [
    normalizeKey(event.key),
    pressed.altGraph ? undefined : physicalKey(event)?.toLowerCase(),
  ];
  return (
    keys.includes(parsed.key) &&
    pressed.ctrl === parsed.ctrl &&
    pressed.meta === parsed.meta &&
    pressed.alt === parsed.alt &&
    (pressed.shift === parsed.shift || (symbol && !parsed.shift))
  );
}

export function shortcutFromEvent(event: KeyboardEvent, mac: boolean): string {
  const pressed = pressedModifiers(event, mac);
  const parts: string[] = [];
  if (mac ? pressed.meta : pressed.ctrl) parts.push("Mod");
  if (mac && pressed.ctrl) parts.push("Ctrl");
  if (!mac && pressed.meta) parts.push("Meta");
  if (pressed.alt) parts.push("Alt");
  if (pressed.shift) parts.push("Shift");
  const key =
    (pressed.altGraph ? undefined : physicalKey(event)) ??
    (event.key === " " ? "Space" : event.key);
  parts.push(key.length === 1 ? key.toUpperCase() : key);
  return parts.join("+");
}

/**
 * A shortcut such as `"Mod+Shift+K"` as the platform labels its keys: `⌘ ⇧ K` on a Mac,
 * `Ctrl Shift K` elsewhere. Arrow keys read `↑ ↓ ← →` and Escape `Esc`. The default platform is
 * read from `navigator`, which a server doesn't have; pass `mac` for output rendered there.
 */
export function formatShortcut(
  shortcut: string,
  { mac = isMacPlatform() }: ShortcutPlatformOptions = {},
): string {
  const parts = splitShortcut(shortcut);
  const key = parts.pop() ?? "";
  const modifierLabels = mac ? MAC_MODIFIER_LABELS : MODIFIER_LABELS;
  const modifierLabel = (part: string) => {
    const modifier = MODIFIER_NAMES[part.trim().toLowerCase()];
    return modifier && modifierLabels[modifier];
  };
  const labels = parts.map((part) => modifierLabel(part) ?? part);
  const keyLabel =
    modifierLabel(key) ??
    KEY_LABELS[normalizeKey(key)] ??
    (key.length === 1 ? key.toUpperCase() : key);
  return [...labels, keyLabel].join(" ");
}
