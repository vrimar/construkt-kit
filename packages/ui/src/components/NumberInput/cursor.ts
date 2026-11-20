export interface InputSelection {
  start: number;
  end: number;
  value: string;
}

const isActive = (input: HTMLInputElement) => input.ownerDocument.activeElement === input;

export function recordCursor(input: HTMLInputElement | null): InputSelection | undefined {
  if (!input || !isActive(input)) return undefined;
  try {
    const { selectionStart: start, selectionEnd: end, value } = input;
    if (start == null || end == null) return undefined;
    return { start, end, value };
  } catch {
    return undefined;
  }
}

export function restoreCursor(
  input: HTMLInputElement | null,
  selection: InputSelection | undefined,
) {
  if (!input || !isActive(input)) return;
  if (!selection) {
    const length = input.value.length;
    input.setSelectionRange(length, length);
    return;
  }
  try {
    const next = input.value;
    const { start, end, value: previous } = selection;
    if (next === previous) {
      input.setSelectionRange(start, end);
      return;
    }
    const nextStart = getNextCursorPosition(previous, next, start);
    const nextEnd = start === end ? nextStart : getNextCursorPosition(previous, next, end);
    const clampedStart = Math.max(0, Math.min(nextStart, next.length));
    const clampedEnd = Math.max(clampedStart, Math.min(nextEnd, next.length));
    input.setSelectionRange(clampedStart, clampedEnd);
  } catch {
    const length = input.value.length;
    input.setSelectionRange(length, length);
  }
}

/** Where a caret at `position` in `previous` lands once the text becomes `next`. */
export function getNextCursorPosition(previous: string, next: string, position: number): number {
  const before = previous.slice(0, position);
  const after = previous.slice(position);

  let prefix = 0;
  for (let i = 0; i < Math.min(before.length, next.length); i++) {
    if (before[i] !== next[i]) break;
    prefix = i + 1;
  }

  let suffix = 0;
  for (let i = 0; i < Math.min(after.length, next.length - prefix); i++) {
    if (after[after.length - 1 - i] !== next[next.length - 1 - i]) break;
    suffix = i + 1;
  }

  if (before.length > 0 && prefix >= before.length) return prefix;
  if (suffix >= after.length) return next.length - suffix;
  if (prefix > 0) return prefix;
  if (suffix > 0) return next.length - suffix;
  if (position === 0) return next.length;
  if (previous.length > 0) return Math.round((position / previous.length) * next.length);
  return next.length;
}

export function setCaretToEnd(input: HTMLInputElement | null) {
  if (!input || !isActive(input)) return;
  try {
    const length = input.value.length;
    input.setSelectionRange(length, length);
  } catch {
    // An input type without a selection API, such as `number`, has no caret to move.
  }
}
